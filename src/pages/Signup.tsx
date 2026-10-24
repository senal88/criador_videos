import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Play, AlertCircle } from 'lucide-react'

const Signup: React.FC = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

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
      await pb.collection('users').create({
        name,
        email,
        password,
        passwordConfirm,
        emailVisibility: true,
      })

      // Enviar verificação de email
      try {
        await pb.collection('users').requestVerification(email)
      } catch (e) {
        console.warn('Erro ao solicitar verificação:', e)
      }

      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 2500)
    } catch (err: unknown) {
      console.error(err)
      setError('Erro ao criar conta. O e-mail pode já estar em uso.')
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

        <h2 className="text-2xl font-bold uppercase tracking-tight text-[#111] mb-2">
          CRIAR CONTA
        </h2>
        <p className="text-sm text-[#555] mb-6">
          Cadastre-se para gerenciar seus tutoriais e projetos.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-[#FDE8E8] border-2 border-[#9B1C1C] flex items-center gap-2 text-[#9B1C1C] text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 bg-[#E6F4EA] border-2 border-[#1D6B3A] text-[#1D6B3A] text-sm font-bold uppercase">
            Conta criada com sucesso! Redirecionando para login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#111] mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3 border-2 border-black bg-white text-[#111] text-sm focus:outline-none focus:ring-2 focus:ring-[#F5D90A] focus:border-black rounded-none"
              placeholder="Aline Santos"
            />
          </div>

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
            <label className="block text-xs font-bold uppercase tracking-wider text-[#111] mb-1">
              Senha (mín. 8 caracteres)
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
              Confirmar Senha
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
              disabled={loading || success}
              className="w-full h-12 bg-[#F5D90A] hover:bg-[#ffe31a] active:translate-y-[1px] text-black font-bold uppercase tracking-wider text-sm border-2 border-black transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              {loading ? 'CRIANDO CONTA...' : 'FINALIZAR CADASTRO'}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-black/20 text-center text-xs text-[#555]">
          Já possui uma conta?{' '}
          <Link to="/login" className="font-bold text-black underline uppercase">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Signup
