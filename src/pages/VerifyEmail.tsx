import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Play, AlertCircle, CheckCircle } from 'lucide-react'

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error')
  const [errorMessage, setErrorMessage] = useState(token ? '' : 'Token de verificação ausente.')

  useEffect(() => {
    if (!token) return

    pb.collection('users')
      .confirmVerification(token)
      .then(() => {
        setStatus('success')
      })
      .catch((err) => {
        console.error(err)
        setStatus('error')
        setErrorMessage('Token inválido ou expirado. Tente solicitar uma nova verificação.')
      })
  }, [token])

  return (
    <div className="min-h-screen bg-[#F4F4F4] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border-2 border-black p-8 shadow-[4px_4px_0px_0px_#111]">
        <div className="flex items-center gap-3 mb-6 border-b-2 border-black pb-4">
          <div className="w-10 h-10 bg-[#F5D90A] border-2 border-black flex items-center justify-center">
            <Play className="w-5 h-5 fill-black text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider text-[#111]">
              ALINE RESOLVE
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#555] font-medium">
              PRODUÇÃO DE VÍDEOS · INSTAGRAM
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold uppercase tracking-tight text-[#111] mb-2">
          VERIFICAÇÃO DE E-MAIL
        </h2>

        {status === 'loading' && (
          <div className="py-8 text-center">
            <div className="w-8 h-8 border-4 border-black border-t-[#F5D90A] animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold uppercase">Confirmando seu e-mail...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#E6F4EA] border-2 border-[#1D6B3A] text-[#1D6B3A] flex items-center gap-2">
              <CheckCircle className="w-6 h-6 shrink-0" />
              <span className="font-bold text-sm uppercase">E-mail verificado com sucesso!</span>
            </div>
            <p className="text-xs text-[#555]">
              Sua conta está ativa e pronta para operar todos os fluxos de edição e sincronização.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="w-full h-11 bg-[#F5D90A] text-black font-bold uppercase tracking-wider text-sm border-2 border-black flex items-center justify-center hover:bg-[#ffe31a]"
              >
                Ir para o Login
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#FDE8E8] border-2 border-[#9B1C1C] text-[#9B1C1C] flex items-center gap-2">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <span className="font-bold text-sm uppercase">Falha na verificação</span>
            </div>
            <p className="text-xs text-[#555]">{errorMessage}</p>
            <div className="pt-2">
              <Link
                to="/login"
                className="w-full h-11 bg-black text-white font-bold uppercase tracking-wider text-sm border-2 border-black flex items-center justify-center hover:bg-[#333]"
              >
                Voltar ao Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail
