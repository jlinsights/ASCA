import type React from "react"
import Image from "next/image"
import { Logo } from "../logo"

interface CatalogCoverProps {
  title: string
  subtitle?: string
  imageSrc?: string
  imageAlt?: string
  date?: string
  publisher?: string
  logoSrc?: string
}

export const CatalogCover: React.FC<CatalogCoverProps> = ({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  date,
  publisher,
  logoSrc,
}) => {
  return (
    <div className="h-full flex flex-col justify-between p-6 bg-ink-black text-rice-paper">
      <div className="flex justify-center mb-4">
        {logoSrc ? (
          <Image src={logoSrc} alt="로고" width={100} height={50} className="object-contain" />
        ) : (
          <Logo width={100} height={50} className="object-contain" />
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {imageSrc && (
          <div className="relative w-4/5 h-3/5 mb-8">
            <Image
              src={imageSrc || "/placeholder.svg"}
              alt={imageAlt || "표지 이미지"}
              fill
              className="object-contain"
            />
          </div>
        )}

        <h1 className="text-3xl font-bold text-center mb-2">{title}</h1>
        {subtitle && <h2 className="text-xl text-center mb-6">{subtitle}</h2>}
      </div>

      <div className="text-sm text-center">
        {date && <p className="mb-1">{date}</p>}
        {publisher && <p>{publisher}</p>}
      </div>
    </div>
  )
}
