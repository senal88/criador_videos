import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AlertCircle, ArrowRight } from 'lucide-react'
import BrandLogo from '@/components/BrandLogo'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err: unknown) {
      console.error(err)
      setError('Credenciais inválidas. Verifique seu e-mail e senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F2E9] flex flex-col justify-center items-center p-4 selection:bg-[#C4704F] selection:text-white">
      <div className="w-full max-w-md bg-[#FAF7F0] border border-[#1F3D2B]/15 rounded-3xl p-8 md:p-10 shadow-soft-lg space-y-6">
        {/* Header Logo */}
        <div className="flex flex-col items-center text-center space-y-3 pb-2 border-b border-[#1F3D2B]/10">
          <BrandLogo size="lg" />
          <div className="pt-2">
            <p className="font-serif italic text-base text-[#1F3D2B] font-medium leading-relaxed">
              &ldquo;Você cuida de quem você ama. Eu resolvo o resto.&rdquo;
            </p>
            <p className="text-xs text-[#1F3D2B]/75 mt-1">
              Organização, orientação e acompanhamento para idosos e suas famílias.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-serif font-bold text-[#1F3D2B]">Entrar no Painel</h2>
          <p className="text-xs text-[#1F3D2B]/70 mt-1">
            Acesse o gerenciador de mídias, tutoriais e projetos.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1F3D2B] mb-1.5">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-[#1F3D2B]/20 bg-white text-[#142419] text-sm focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-[#1F3D2B]">Senha</label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-[#C4704F] hover:text-[#1F3D2B] underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              <span>{loading ? 'Acessando...' : 'Acessar Painel'}</span>
              <ArrowRight className="w-4 h-4 text-[#D98A6C]" />
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-[#1F3D2B]/10 text-center text-xs text-[#1F3D2B]/70">
          Não tem uma conta?{' '}
          <Link
            to="/signup"
            className="font-semibold text-[#C4704F] hover:text-[#1F3D2B] underline"
          >
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
