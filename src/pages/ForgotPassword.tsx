import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Play, AlertCircle, CheckCircle } from 'lucide-react'

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await pb.collection('users').requestPasswordReset(email)
      setSubmitted(true)
    } catch (err: unknown) {
      console.error(err)
      setError('Não foi possível enviar a solicitação. Verifique o e-mail informado.')
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
          RECUPERAR SENHA
        </h2>
        <p className="text-sm text-[#555] mb-6">
          Informe seu e-mail para receber as instruções de redefinição de acesso.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-[#FDE8E8] border-2 border-[#9B1C1C] flex items-center gap-2 text-[#9B1C1C] text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="p-4 bg-[#E6F4EA] border-2 border-[#1D6B3A] text-[#1D6B3A] space-y-3">
            <div className="flex items-center gap-2 font-bold uppercase text-sm">
              <CheckCircle className="w-5 h-5" />
              <span>Instruções enviadas!</span>
            </div>
            <p className="text-xs">
              Se houver uma conta associada a <strong>{email}</strong>, você receberá um link de
              redefinição em instantes.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-block px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-[#333]"
              >
                Voltar ao Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#111] mb-1">
                E-mail cadastrado
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#F5D90A] hover:bg-[#ffe31a] text-black font-bold uppercase tracking-wider text-sm border-2 border-black transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {loading ? 'ENVIANDO...' : 'ENVIAR LINK DE RECUPERAÇÃO'}
              </button>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs font-bold uppercase text-[#555] hover:text-black underline"
              >
                ← Voltar para o Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
