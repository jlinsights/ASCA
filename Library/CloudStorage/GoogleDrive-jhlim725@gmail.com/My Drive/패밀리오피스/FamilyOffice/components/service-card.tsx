import Link from "next/link"
import { memo } from "react"

interface ServiceCardProps {
  icon: React.ReactNode
  title: string
  description: string
  href: string
}

export const ServiceCard = memo(function ServiceCard({ 
  icon, 
  title, 
  description, 
  href 
}: ServiceCardProps) {
  return (
    <Link 
      href={href}
      className="group block h-full"
    >
      <div className="glass-card p-6 md:p-8 hover:scale-105 transition-fo h-full">
        {/* 아이콘 */}
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-bronze-primary/20 to-forest-primary/20 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-fo">
          <div className="text-bronze-primary group-hover:text-forest-primary transition-fo">
            {icon}
          </div>
        </div>
        
        {/* 제목 */}
        <h3 className="font-heading text-lg md:text-xl font-bold mb-3 md:mb-4 text-navy-primary dark:text-white group-hover:text-forest-primary dark:group-hover:text-bronze-primary transition-fo">
          {title}
        </h3>
        
        {/* 설명 */}
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 md:mb-6 text-sm md:text-base">
          {description}
        </p>
        
        {/* 더보기 링크 */}
        <div className="flex items-center text-bronze-primary group-hover:text-forest-primary font-semibold transition-fo text-sm md:text-base">
          <span>자세히 보기</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="ml-2 group-hover:translate-x-1 transition-transform duration-300"
          >
            <path
              d="M5 12H19M19 12L12 5M19 12L12 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </Link>
  )
}) 