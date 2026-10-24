import React from 'react'
import { Phone, Instagram, Heart, CheckCircle2 } from 'lucide-react'

interface BrandBlockProps {
  variant?: 'sidebar' | 'dashboard' | 'compact'
  className?: string
}

export const BrandBlock: React.FC<BrandBlockProps> = ({ variant = 'sidebar', className = '' }) => {
  if (variant === 'dashboard') {
    return (
      <div
        className={`rounded-2xl bg-gradient-to-br from-[#1F3D2B] via-[#234A33] to-[#173022] text-[#FAF7F0] p-6 md:p-8 shadow-soft-lg relative overflow-hidden ${className}`}
      >
        {/* Detalhe de fundo decorativo */}
        <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-[#C4704F]/15 blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-44 h-44 rounded-full bg-[#E5ECE5]/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F0]/10 text-[#FAF7F0] text-xs font-medium backdrop-blur-sm border border-white/10">
              <Heart className="w-3.5 h-3.5 text-[#D98A6C] fill-[#D98A6C]" />
              <span>Aline Resolve • Cuidado com amor e método</span>
            </div>

            <h3 className="font-serif text-2xl md:text-3xl text-white font-semibold leading-snug">
              &ldquo;Você cuida de quem você ama.{' '}
              <span className="italic text-[#D98A6C] font-normal">Eu resolvo o resto.</span>&rdquo;
            </h3>

            <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-[#FAF7F0]/90 pt-1">
              <span className="flex items-center gap-1.5">
                <span>📋</span>
                <span>Organização • orientação • acompanhamento</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#D98A6C]">
                <span>👵</span>
                <span className="text-[#FAF7F0]/90">Soluções para idosos e suas famílias</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <a
              href="https://wa.me/5527998180072"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#C4704F] hover:bg-[#D98A6C] text-white font-semibold text-sm transition-all shadow-card hover:shadow-soft"
            >
              <Phone className="w-4 h-4" />
              <span>📲 27 99818-0072</span>
            </a>

            <a
              href="https://www.instagram.com/alineresolve/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all border border-white/15 backdrop-blur-sm"
            >
              <Instagram className="w-4 h-4 text-[#D98A6C]" />
              <span>@alineresolve</span>
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Variante Sidebar (acolhedora, compacta e elegante)
  return (
    <div
      className={`rounded-2xl bg-[#EEF3EE]/80 border border-[#1F3D2B]/15 p-4 text-[#142419] space-y-3 ${className}`}
    >
      <div className="space-y-1">
        <p className="font-serif italic text-sm text-[#1F3D2B] font-medium leading-snug">
          &ldquo;Você cuida de quem você ama. Eu resolvo o resto.&rdquo;
        </p>
      </div>

      <div className="space-y-1.5 text-xs text-[#1F3D2B]/85">
        <div className="flex items-start gap-2">
          <span className="shrink-0 text-sm">📋</span>
          <span className="leading-tight font-medium">
            Organização • orientação • acompanhamento
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="shrink-0 text-sm">👵</span>
          <span className="leading-tight font-medium">Soluções para idosos e suas famílias</span>
        </div>
      </div>

      <div className="pt-2 border-t border-[#1F3D2B]/10 flex flex-col gap-2">
        <a
          href="https://wa.me/5527998180072"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#1F3D2B] hover:bg-[#2E583E] text-[#FAF7F0] text-xs font-semibold transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-[#D98A6C]" />
          <span>📲 27 99818-0072</span>
        </a>

        <a
          href="https://www.instagram.com/alineresolve/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/80 hover:bg-white text-[#1F3D2B] border border-[#1F3D2B]/20 text-xs font-medium transition-colors"
        >
          <Instagram className="w-3.5 h-3.5 text-[#C4704F]" />
          <span>@alineresolve</span>
        </a>
      </div>
    </div>
  )
}

export default BrandBlock
