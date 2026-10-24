import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import BrandLogo from '@/components/BrandLogo'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

const ConfirmEmailChange: React.FC = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    token ? 'idle' : 'error',
  )
  const [errorMessage, setErrorMessage] = useState(token ? '' : 'Token de alteração ausente.')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setStatus('loading')
    try {
      await pb.collection('users').confirmEmailChange(token, password)
      setStatus('success')
    } catch (err: unknown) {
      console.error(err)
      setStatus('error')
      setErrorMessage('Não foi possível confirmar a alteração. Senha incorreta ou token expirado.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F2E9] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-[#FAF7F0] border border-[#1F3D2B]/15 rounded-2xl p-8 shadow-soft">
        <div className="flex justify-center mb-6 border-b border-[#1F3D2B]/10 pb-4">
          <BrandLogo size="md" />
        </div>

        <h2 className="text-xl font-serif font-bold text-[#1F3D2B] mb-2 text-center">
          Alteração de E-mail
        </h2>
        <p className="text-xs text-[#1F3D2B]/70 mb-6 text-center">
          Confirme sua senha para validar o novo endereço de e-mail.
        </p>

        {status === 'success' && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span className="font-semibold text-xs">E-mail alterado com sucesso!</span>
            </div>
            <div className="pt-2">
              <Link
                to="/login"
                className="w-full h-11 bg-[#C4704F] hover:bg-[#D98A6C] text-white font-semibold text-xs rounded-xl shadow-card flex items-center justify-center transition-all"
              >
                Fazer login com o novo e-mail
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span className="font-semibold text-xs">Erro na confirmação</span>
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

        {status !== 'success' && status !== 'error' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1F3D2B] mb-1">
                Sua senha atual
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3 border border-[#1F3D2B]/20 rounded-xl bg-white text-[#142419] text-sm focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full h-11 bg-[#C4704F] hover:bg-[#D98A6C] text-white font-semibold text-xs rounded-xl shadow-card transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {status === 'loading' ? 'Confirmando...' : 'Confirmar Novo E-mail'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ConfirmEmailChange
