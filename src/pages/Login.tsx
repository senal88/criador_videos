import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Play, AlertCircle } from 'lucide-react'

const Login: React.FC = () => {
  const [email, setEmail] = useState('luizfernandomoreirasena@gmail.com')
  const [password, setPassword] = useState('Skip@Pass')
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
    <div className="min-h-screen bg-[#F4F4F4] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border-2 border-black p-8 shadow-[4px_4px_0px_0px_#111]">
        {/* Header Logo */}
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
          ENTRAR NO SISTEMA
        </h2>
        <p className="text-sm text-[#555] mb-6">
          Acesse seu painel integrado de produção e edição de vídeos.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-[#FDE8E8] border-2 border-[#9B1C1C] flex items-center gap-2 text-[#9B1C1C] text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#111] mb-1">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3 border-2 border-black bg-white text-[#111] text-sm focus:outline-none focus:ring-2 focus:ring-[#F5D90A] focus:border-black rounded-none"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#111]">
                Senha
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-[#555] hover:text-black underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
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
              disabled={loading}
              className="w-full h-12 bg-[#F5D90A] hover:bg-[#ffe31a] active:translate-y-[1px] text-black font-bold uppercase tracking-wider text-sm border-2 border-black transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              {loading ? 'AUTENTICANDO...' : 'ACESSAR DASHBOARD'}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-black/20 flex flex-col gap-2 text-center text-xs text-[#555]">
          <div>
            Não tem uma conta?{' '}
            <Link to="/signup" className="font-bold text-black underline uppercase">
              Cadastre-se
            </Link>
          </div>
          <div className="p-2 bg-[#F4F4F4] border border-black/30 mt-2 text-left">
            <p className="font-bold text-[#111] mb-1">ACESSO DE TESTE RÁPIDO:</p>
            <p className="font-mono text-xs text-[#333]">
              E-mail: luizfernandomoreirasena@gmail.com
            </p>
            <p className="font-mono text-xs text-[#333]">Senha: Skip@Pass</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
