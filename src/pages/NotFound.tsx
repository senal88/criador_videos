import React from 'react'
import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F4F4F4] flex flex-col justify-center items-center p-6 text-center">
      <div className="w-full max-w-md bg-white border-2 border-black p-8 shadow-[6px_6px_0px_0px_#111]">
        <div className="w-12 h-12 bg-[#F5D90A] border-2 border-black flex items-center justify-center mx-auto mb-4">
          <Play className="w-6 h-6 fill-black text-black" />
        </div>
        <h1 className="text-4xl font-black uppercase text-[#111] mb-2">404</h1>
        <h2 className="text-lg font-bold uppercase tracking-wider text-[#111] mb-4">
          PÁGINA NÃO ENCONTRADA
        </h2>
        <p className="text-xs text-[#555] mb-6">
          O caminho solicitado não existe ou foi movido na estrutura de produção da Aline Resolve.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-[#F5D90A] hover:bg-[#ffe31a] border-2 border-black text-black text-xs font-bold uppercase tracking-wider shadow-brutal transition-all"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFound
