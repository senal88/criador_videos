import React from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '@/components/BrandLogo'

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7F2E9] flex flex-col justify-center items-center p-6 text-center">
      <div className="w-full max-w-md bg-[#FAF7F0] border border-[#1F3D2B]/15 rounded-2xl p-8 shadow-soft">
        <div className="flex justify-center mb-6">
          <BrandLogo size="md" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-[#1F3D2B] mb-2">404</h1>
        <h2 className="text-base font-serif font-semibold text-[#142419] mb-3">
          Página não encontrada
        </h2>
        <p className="text-xs text-[#1F3D2B]/70 mb-6 leading-relaxed">
          O caminho solicitado não existe ou foi reorganizado no sistema da Aline Resolve.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-[#C4704F] hover:bg-[#D98A6C] text-white text-xs font-semibold rounded-xl shadow-card hover:shadow-soft transition-all"
        >
          Voltar ao Painel Geral
        </Link>
      </div>
    </div>
  )
}

export default NotFound
