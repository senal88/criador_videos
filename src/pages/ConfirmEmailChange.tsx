import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Play, AlertCircle, CheckCircle } from 'lucide-react'

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
          ALTERAÇÃO DE E-MAIL
        </h2>
        <p className="text-sm text-[#555] mb-6">Confirme sua senha para validar o novo endereço.</p>

        {status === 'success' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#E6F4EA] border-2 border-[#1D6B3A] text-[#1D6B3A] flex items-center gap-2">
              <CheckCircle className="w-6 h-6 shrink-0" />
              <span className="font-bold text-sm uppercase">E-mail alterado com sucesso!</span>
            </div>
            <div className="pt-2">
              <Link
                to="/login"
                className="w-full h-11 bg-[#F5D90A] text-black font-bold uppercase tracking-wider text-sm border-2 border-black flex items-center justify-center hover:bg-[#ffe31a]"
              >
                Fazer login com o novo e-mail
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#FDE8E8] border-2 border-[#9B1C1C] text-[#9B1C1C] flex items-center gap-2">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <span className="font-bold text-sm uppercase">Erro na confirmação</span>
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

        {status !== 'success' && status !== 'error' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#111] mb-1">
                Sua senha atual
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3 border-2 border-black bg-white text-[#111] text-sm focus:outline-none focus:ring-2 focus:ring-[#F5D90A] focus:border-black rounded-none"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full h-12 bg-[#F5D90A] hover:bg-[#ffe31a] text-black font-bold uppercase tracking-wider text-sm border-2 border-black transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {status === 'loading' ? 'CONFIRMANDO...' : 'CONFIRMAR NOVO E-MAIL'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ConfirmEmailChange
