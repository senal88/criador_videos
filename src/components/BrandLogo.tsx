import React from 'react'
import { Sparkles } from 'lucide-react'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'light' | 'dark'
  className?: string
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'light',
  className = '',
}) => {
  const isDark = variant === 'dark'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Símbolo com monograma acolhedor e traço terracota */}
      <div
        className={`relative shrink-0 flex items-center justify-center rounded-2xl transition-transform hover:scale-105 ${
          size === 'sm'
            ? 'w-9 h-9'
            : size === 'lg'
              ? 'w-14 h-14 shadow-soft'
              : 'w-11 h-11 shadow-soft'
        } ${
          isDark
            ? 'bg-[#1F3D2B] text-[#FAF7F0] border border-[#2E583E]'
            : 'bg-[#1F3D2B] text-[#FAF7F0] border border-[#2E583E]'
        }`}
      >
        <span
          className={`font-serif font-bold italic select-none ${
            size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl'
          }`}
          style={{ letterSpacing: '-0.03em' }}
        >
          A
        </span>
        <span
          className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#C4704F] rounded-full border-2 border-[#FAF7F0] flex items-center justify-center"
          title="Aline Resolve"
        >
          <span className="w-1 h-1 bg-white rounded-full" />
        </span>
      </div>

      <div className="flex flex-col leading-tight">
        <div className="flex items-baseline gap-1.5">
          <span
            className={`font-serif font-bold tracking-tight ${
              isDark ? 'text-[#FAF7F0]' : 'text-[#1F3D2B]'
            } ${size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl'}`}
          >
            Aline
          </span>
          <span
            className={`font-serif italic font-medium ${
              isDark ? 'text-[#D98A6C]' : 'text-[#C4704F]'
            } ${size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl'}`}
          >
            Resolve
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span
            className={`font-script text-xs sm:text-sm font-semibold tracking-wide ${
              isDark ? 'text-[#FAF7F0]/80' : 'text-[#1F3D2B]/80'
            }`}
          >
            cuidado & acolhimento
          </span>
        </div>
      </div>
    </div>
  )
}

export default BrandLogo
