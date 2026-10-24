import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import BrandLogo from '@/components/BrandLogo'

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
    <div className="min-h-screen bg-[#F7F2E9] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-[#FAF7F0] border border-[#1F3D2B]/15 rounded-3xl p-8 md:p-10 shadow-soft-lg space-y-6">
        <div className="flex flex-col items-center text-center space-y-3 pb-2 border-b border-[#1F3D2B]/10">
          <BrandLogo size="lg" />
        </div>

        <div>
          <h2 className="text-xl font-serif font-bold text-[#1F3D2B]">Recuperar Senha</h2>
          <p className="text-xs text-[#1F3D2B]/70 mt-1">
            Informe seu e-mail para receber as orientações de redefinição.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="p-5 rounded-2xl bg-[#EEF3EE] border border-[#1F3D2B]/15 space-y-3 text-xs text-[#142419]">
            <div className="flex items-center gap-2 font-bold text-[#1F3D2B] text-sm">
              <CheckCircle className="w-5 h-5 text-emerald-700" />
              <span>Instruções enviadas!</span>
            </div>
            <p>
              Se houver uma conta associada a <strong>{email}</strong>, você receberá um link de
              redefinição em instantes.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F3D2B] text-[#FAF7F0] font-semibold text-xs hover:bg-[#2E583E] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar ao Login</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1F3D2B] mb-1.5">
                E-mail cadastrado
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#1F3D2B]/20 bg-white text-[#142419] text-sm focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
                placeholder="seu@email.com"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-[#1F3D2B] hover:bg-[#2E583E] text-[#FAF7F0] font-semibold text-sm transition-all shadow-card hover:shadow-soft flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </button>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-[#1F3D2B]/80 hover:text-[#1F3D2B] inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar ao Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
