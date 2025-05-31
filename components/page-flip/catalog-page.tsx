import type React from "react"
import Image from "next/image"

interface CatalogPageProps {
  title?: string
  description?: string
  imageSrc?: string
  imageAlt?: string
  artist?: string
  year?: string
  medium?: string
  dimensions?: string
  children?: React.ReactNode
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  title,
  description,
  imageSrc,
  imageAlt,
  artist,
  year,
  medium,
  dimensions,
  children,
}) => {
  if (children) {
    return <div className="h-full">{children}</div>
  }

  return (
    <div className="h-full flex flex-col">
      {imageSrc && (
        <div className="relative w-full h-3/5 mb-4">
          <Image
            src={imageSrc || "/placeholder.svg"}
            alt={imageAlt || title || "작품 이미지"}
            fill
            className="object-contain"
          />
        </div>
      )}

      <div className="px-2">
        {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}

        <div className="text-sm space-y-1 mb-3">
          {artist && (
            <p>
              <span className="text-celadon-green">작가:</span> {artist}
            </p>
          )}
          {year && (
            <p>
              <span className="text-celadon-green">제작년도:</span> {year}
            </p>
          )}
          {medium && (
            <p>
              <span className="text-celadon-green">매체:</span> {medium}
            </p>
          )}
          {dimensions && (
            <p>
              <span className="text-celadon-green">크기:</span> {dimensions}
            </p>
          )}
        </div>

        {description && <p className="text-sm">{description}</p>}
      </div>
    </div>
  )
}
