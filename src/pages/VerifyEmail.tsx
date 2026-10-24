import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import BrandLogo from '@/components/BrandLogo'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

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
    <div className="min-h-screen bg-[#F7F2E9] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-[#FAF7F0] border border-[#1F3D2B]/15 rounded-2xl p-8 shadow-soft">
        <div className="flex justify-center mb-6 border-b border-[#1F3D2B]/10 pb-4">
          <BrandLogo size="md" />
        </div>

        <h2 className="text-xl font-serif font-bold text-[#1F3D2B] mb-2 text-center">
          Verificação de E-mail
        </h2>

        {status === 'loading' && (
          <div className="py-8 text-center">
            <div className="w-8 h-8 border-3 border-[#1F3D2B] border-t-[#C4704F] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs font-semibold text-[#1F3D2B]">Confirmando seu e-mail...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span className="font-semibold text-xs">E-mail verificado com sucesso!</span>
            </div>
            <p className="text-xs text-[#1F3D2B]/75 leading-relaxed">
              Sua conta está ativa e pronta para operar todos os fluxos de tutoriais, biblioteca e
              sincronização.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="w-full h-11 bg-[#C4704F] hover:bg-[#D98A6C] text-white font-semibold text-xs rounded-xl shadow-card flex items-center justify-center transition-all"
              >
                Ir para o Login
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span className="font-semibold text-xs">Falha na verificação</span>
            </div>
            <p className="text-xs text-[#1F3D2B]/75 leading-relaxed">{errorMessage}</p>
            <div className="pt-2">
              <Link
                to="/login"
                className="w-full h-11 bg-[#1F3D2B] hover:bg-[#2E583E] text-white font-semibold text-xs rounded-xl shadow-card flex items-center justify-center transition-all"
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
