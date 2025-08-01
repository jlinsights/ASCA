"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { searchKakaoLocation } from "@/lib/kakao"
import { MapPin, Navigation, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  // 지도 기본 설정
  width?: string | number
  height?: string | number
  className?: string
  
  // 지도 초기 위치
  latitude?: number
  longitude?: number
  level?: number
  
  // 검색어로 위치 설정
  searchQuery?: string
  
  // 마커 정보
  markers?: MapMarker[]
  
  // 지도 옵션
  enableScrollWheel?: boolean
  enableDoubleClick?: boolean
  enableKeyboard?: boolean
  showMapTypeControl?: boolean
  showZoomControl?: boolean
  
  // 이벤트 핸들러
  onMapLoad?: (map: any) => void
  onMarkerClick?: (marker: MapMarker) => void
}

interface MapMarker {
  id: string
  title: string
  description?: string
  latitude: number
  longitude: number
  address?: string
  category?: string
  imageUrl?: string
  url?: string
}

export function KakaoMap({
  width = "100%",
  height = 400,
  className = "",
  latitude = 37.5665,
  longitude = 126.9780,
  level = 3,
  searchQuery,
  markers = [],
  enableScrollWheel = true,
  enableDoubleClick = true,
  enableKeyboard = true,
  showMapTypeControl = true,
  showZoomControl = true,
  onMapLoad,
  onMarkerClick
}: KakaoMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchResult, setSearchResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // 카카오맵 SDK 로드
  useEffect(() => {
    loadKakaoMapScript()
  }, [loadKakaoMapScript])

  // 검색어 변경 시 위치 검색
  useEffect(() => {
    if (searchQuery) {
      searchLocation(searchQuery)
    }
  }, [searchQuery])

  // 마커 업데이트
  useEffect(() => {
    if (mapInstance.current && markers.length > 0) {
      updateMarkers()
    }
  }, [markers, updateMarkers])

  const loadKakaoMapScript = useCallback(async () => {
    try {
      if (window.kakao && window.kakao.maps) {
        initializeMap()
        return
      }

      const script = document.createElement('script')
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY}&autoload=false`
      script.async = true
      
      script.onload = () => {
        window.kakao.maps.load(() => {
          initializeMap()
        })
      }
      
      script.onerror = () => {
        setError('카카오맵을 로드할 수 없습니다')
        setIsLoading(false)
      }
      
      document.head.appendChild(script)
    } catch (error) {
      
      setError('카카오맵 로드 중 오류가 발생했습니다')
      setIsLoading(false)
    }
  }, [])

  const initializeMap = () => {
    if (!mapContainer.current || !window.kakao?.maps) return

    try {
      const options = {
        center: new window.kakao.maps.LatLng(latitude, longitude),
        level: level
      }

      const map = new window.kakao.maps.Map(mapContainer.current, options)
      mapInstance.current = map

      // 지도 컨트롤 설정
      if (showMapTypeControl) {
        const mapTypeControl = new window.kakao.maps.MapTypeControl()
        map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT)
      }

      if (showZoomControl) {
        const zoomControl = new window.kakao.maps.ZoomControl()
        map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT)
      }

      // 지도 이벤트 설정
      if (!enableScrollWheel) {
        map.setZoomable(false)
      }
      if (!enableDoubleClick) {
        map.setDraggable(false)
      }
      if (!enableKeyboard) {
        map.setKeyboardShortcuts(false)
      }

      setIsLoading(false)
      onMapLoad?.(map)

      
    } catch (error) {
      
      setError('지도 초기화에 실패했습니다')
      setIsLoading(false)
    }
  }

  const searchLocation = async (query: string) => {
    try {
      setIsLoading(true)
      const result = await searchKakaoLocation(query)
      
      if (result && result.documents && result.documents.length > 0) {
        const firstResult = result.documents[0]
        setSearchResult(firstResult)
        
        // 지도 중심 이동
        if (mapInstance.current) {
          const moveLatLng = new window.kakao.maps.LatLng(
            parseFloat(firstResult.y),
            parseFloat(firstResult.x)
          )
          mapInstance.current.setCenter(moveLatLng)
          
          // 검색 결과 마커 추가
          const marker = new window.kakao.maps.Marker({
            position: moveLatLng,
            map: mapInstance.current
          })
          
          // 인포윈도우 추가
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;">${firstResult.place_name}</div>`
          })
          infowindow.open(mapInstance.current, marker)
        }
      } else {
        setError('검색 결과를 찾을 수 없습니다')
      }
    } catch (error) {
      
      setError('위치 검색 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const updateMarkers = useCallback(() => {
    if (!mapInstance.current || !window.kakao?.maps) return

    markers.forEach((markerData) => {
      const position = new window.kakao.maps.LatLng(markerData.latitude, markerData.longitude)
      
      const marker = new window.kakao.maps.Marker({
        position: position,
        map: mapInstance.current
      })

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        onMarkerClick?.(markerData)
        
        // 인포윈도우 표시
        const infoContent = `
          <div style="padding:10px;min-width:200px;">
            <div style="font-weight:bold;margin-bottom:5px;">${markerData.title}</div>
            ${markerData.description ? `<div style="margin-bottom:5px;color:#666;">${markerData.description}</div>` : ''}
            ${markerData.address ? `<div style="font-size:12px;color:#888;">${markerData.address}</div>` : ''}
          </div>
        `
        
        const infowindow = new window.kakao.maps.InfoWindow({
          content: infoContent
        })
        infowindow.open(mapInstance.current, marker)
      })
    })
  }, [markers, onMarkerClick])

  const openKakaoMap = () => {
    if (searchResult) {
      const url = `https://map.kakao.com/link/map/${searchResult.place_name},${searchResult.y},${searchResult.x}`
      window.open(url, '_blank')
    }
  }

  const openKakaoNavigation = () => {
    if (searchResult) {
      const url = `https://map.kakao.com/link/to/${searchResult.place_name},${searchResult.y},${searchResult.x}`
      window.open(url, '_blank')
    }
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-600">지도 로드 오류</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => {
              setError(null)
              setIsLoading(true)
              loadKakaoMapScript()
            }}
            variant="outline"
          >
            다시 시도
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* 지도 컨테이너 */}
      <div 
        ref={mapContainer}
        style={{ width, height }}
        className="rounded-lg overflow-hidden border border-border"
      />
      
      {/* 로딩 상태 */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted/50 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">지도를 불러오는 중...</p>
          </div>
        </div>
      )}
      
      {/* 검색 결과 정보 */}
      {searchResult && (
        <Card className="absolute top-4 left-4 w-80 bg-background/95 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {searchResult.place_name}
            </CardTitle>
            <CardDescription className="text-sm">
              {searchResult.address_name}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2 mb-3">
              {searchResult.category_name && (
                <Badge variant="secondary" className="text-xs">
                  {searchResult.category_name.split(' > ').pop()}
                </Badge>
              )}
              {searchResult.phone && (
                <Badge variant="outline" className="text-xs">
                  {searchResult.phone}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={openKakaoMap}
                className="flex-1"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                카카오맵
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={openKakaoNavigation}
                className="flex-1"
              >
                <Navigation className="h-3 w-3 mr-1" />
                길찾기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// 전시회 위치 표시용 특화 컴포넌트
export function ExhibitionMap({ 
  exhibition, 
  className = "",
  ...props 
}: { 
  exhibition: { 
    name: string
    location?: string
    address?: string
  } 
} & Omit<KakaoMapProps, 'searchQuery'>) {
  return (
    <KakaoMap
      searchQuery={exhibition.location || exhibition.address}
      className={className}
      markers={exhibition.location ? [{
        id: 'exhibition',
        title: exhibition.name,
        description: '전시회 개최지',
        latitude: 0, // 검색 결과로 대체됨
        longitude: 0,
        address: exhibition.address,
        category: 'exhibition'
      }] : []}
      {...props}
    />
  )
} 