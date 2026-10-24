import React, { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Play, AlertCircle, CheckCircle } from 'lucide-react'

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!token) {
      setError('Token de redefinição não encontrado ou inválido.')
      return
    }

    if (password !== passwordConfirm) {
      setError('As senhas não coincidem.')
      return
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    setLoading(true)

    try {
      await pb.collection('users').confirmPasswordReset(token, password, passwordConfirm)
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 2500)
    } catch (err: unknown) {
      console.error(err)
      setError('Token expirado ou inválido. Solicite uma nova recuperação de senha.')
    } finally {
      setLoading(false)
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

        <h2 className="text-2xl font-bold uppercase tracking-tight text-[#111] mb-2">NOVA SENHA</h2>
        <p className="text-sm text-[#555] mb-6">Defina sua nova credencial de segurança.</p>

        {error && (
          <div className="mb-6 p-3 bg-[#FDE8E8] border-2 border-[#9B1C1C] flex items-center gap-2 text-[#9B1C1C] text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 bg-[#E6F4EA] border-2 border-[#1D6B3A] text-[#1D6B3A] space-y-3">
            <div className="flex items-center gap-2 font-bold uppercase text-sm">
              <CheckCircle className="w-5 h-5" />
              <span>Senha alterada com sucesso!</span>
            </div>
            <p className="text-xs">Redirecionando para a página de login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#111] mb-1">
                Nova Senha (mín. 8 caracteres)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3 border-2 border-black bg-white text-[#111] text-sm focus:outline-none focus:ring-2 focus:ring-[#F5D90A] focus:border-black rounded-none"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#111] mb-1">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                required
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full h-11 px-3 border-2 border-black bg-white text-[#111] text-sm focus:outline-none focus:ring-2 focus:ring-[#F5D90A] focus:border-black rounded-none"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#F5D90A] hover:bg-[#ffe31a] text-black font-bold uppercase tracking-wider text-sm border-2 border-black transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {loading ? 'SALVANDO...' : 'REDEFINIR SENHA'}
              </button>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs font-bold uppercase text-[#555] hover:text-black underline"
              >
                ← Cancelar e voltar ao Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
