import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { AlertCircle, ArrowRight } from 'lucide-react'
import BrandLogo from '@/components/BrandLogo'

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
    <div className="min-h-screen bg-[#F7F2E9] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-[#FAF7F0] border border-[#1F3D2B]/15 rounded-3xl p-8 md:p-10 shadow-soft-lg space-y-6">
        <div className="flex flex-col items-center text-center space-y-3 pb-2 border-b border-[#1F3D2B]/10">
          <BrandLogo size="lg" />
          <p className="font-serif italic text-base text-[#1F3D2B] font-medium leading-relaxed">
            &ldquo;Você cuida de quem você ama. Eu resolvo o resto.&rdquo;
          </p>
        </div>

        <div>
          <h2 className="text-xl font-serif font-bold text-[#1F3D2B]">Criar Conta</h2>
          <p className="text-xs text-[#1F3D2B]/70 mt-1">
            Cadastre-se para gerenciar seus vídeos, orientações e biblioteca.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            Conta criada com sucesso! Redirecionando para o acesso...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1F3D2B] mb-1.5">
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-[#1F3D2B]/20 bg-white text-[#142419] text-sm focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
              placeholder="Aline Santos"
            />
          </div>

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
            <label className="block text-xs font-semibold text-[#1F3D2B] mb-1.5">
              Senha (mín. 8 caracteres)
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
              Confirmar Senha
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
              disabled={loading || success}
              className="w-full h-12 rounded-xl bg-[#1F3D2B] hover:bg-[#2E583E] text-[#FAF7F0] font-semibold text-sm transition-all shadow-card hover:shadow-soft flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Criando conta...' : 'Finalizar Cadastro'}</span>
              <ArrowRight className="w-4 h-4 text-[#D98A6C]" />
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-[#1F3D2B]/10 text-center text-xs text-[#1F3D2B]/70">
          Já possui uma conta?{' '}
          <Link to="/login" className="font-semibold text-[#C4704F] hover:text-[#1F3D2B] underline">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Signup
