import React, { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import BrandLogo from '@/components/BrandLogo'

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
    <div className="min-h-screen bg-[#F7F2E9] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-[#FAF7F0] border border-[#1F3D2B]/15 rounded-3xl p-8 md:p-10 shadow-soft-lg space-y-6">
        <div className="flex flex-col items-center text-center space-y-3 pb-2 border-b border-[#1F3D2B]/10">
          <BrandLogo size="lg" />
        </div>

        <div>
          <h2 className="text-xl font-serif font-bold text-[#1F3D2B]">Definir Nova Senha</h2>
          <p className="text-xs text-[#1F3D2B]/70 mt-1">
            Escolha uma senha segura com no mínimo 8 caracteres.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-5 rounded-2xl bg-[#EEF3EE] border border-[#1F3D2B]/15 space-y-3 text-xs text-[#142419]">
            <div className="flex items-center gap-2 font-bold text-[#1F3D2B] text-sm">
              <CheckCircle className="w-5 h-5 text-emerald-700" />
              <span>Senha alterada com sucesso!</span>
            </div>
            <p>Redirecionando para a página de login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1F3D2B] mb-1.5">
                Nova Senha (mín. 8 caracteres)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#1F3D2B]/20 bg-white text-[#142419] text-sm focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F3D2B] mb-1.5">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                required
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#1F3D2B]/20 bg-white text-[#142419] text-sm focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-[#1F3D2B] hover:bg-[#2E583E] text-[#FAF7F0] font-semibold text-sm transition-all shadow-card hover:shadow-soft flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Redefinir Senha'}
              </button>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-[#1F3D2B]/80 hover:text-[#1F3D2B] inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancelar e voltar ao Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
