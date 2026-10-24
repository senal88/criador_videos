import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getProjetos, updateProjeto } from '@/services/projetos'
import type { ProjetoRecord, StatusProjeto } from '@/types/database'
import {
  Copy,
  Check,
  Scissors,
  Palette,
  Layers,
  AlertTriangle,
  Save,
  Terminal,
  Clock,
  Sparkles,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export const Edicao: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const projetoParam = searchParams.get('projeto')
  const actionParam = searchParams.get('action')

  const [projetos, setProjetos] = useState<ProjetoRecord[]>([])
  const [selectedProjetoId, setSelectedProjetoId] = useState<string>('')
  const [selectedProjeto, setSelectedProjeto] = useState<ProjetoRecord | null>(null)

  // Status e progresso editáveis do projeto selecionado
  const [progresso, setProgresso] = useState<number>(0)
  const [status, setStatus] = useState<StatusProjeto>('Em edição')
  const [isSaving, setIsSaving] = useState(false)

  // Cortes rápidos
  const [inicioSeg, setInicioSeg] = useState<string>('3')
  const [fimSeg, setFimSeg] = useState<string>('45')

  // Estados de feedback de cópia
  const [copiadoCorte, setCopiadoCorte] = useState(false)
  const [copiadoConversao, setCopiadoConversao] = useState(false)
  const [copiadoReels, setCopiadoReels] = useState(false)
  const [copiadoCor1, setCopiadoCor1] = useState(false)
  const [copiadoCor2, setCopiadoCor2] = useState(false)
  const [copiadoCor3, setCopiadoCor3] = useState(false)

  // Referência para focar em seções se chamado por atalhos
  const cortesRef = useRef<HTMLDivElement>(null)
  const corRef = useRef<HTMLDivElement>(null)

  // Carregar projetos
  useEffect(() => {
    getProjetos()
      .then((data) => {
        setProjetos(data)
        if (data.length > 0) {
          if (projetoParam) {
            const match = data.find((p) => p.id === projetoParam)
            if (match) {
              setSelectedProjetoId(match.id)
              setSelectedProjeto(match)
              setProgresso(match.progresso || 0)
              setStatus(match.status)
              return
            }
          }
          setSelectedProjetoId(data[0].id)
          setSelectedProjeto(data[0])
          setProgresso(data[0].progresso || 0)
          setStatus(data[0].status)
        }
      })
      .catch(console.error)
  }, [projetoParam])

  // Ações de atalho direto
  useEffect(() => {
    if (actionParam === 'corte') {
      cortesRef.current?.scrollIntoView({ behavior: 'smooth' })
    } else if (actionParam === 'cor') {
      corRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [actionParam])

  // Atalhos de Teclado no Painel de Edição
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        cortesRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        corRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        navigate('/sincronizacao')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  const handleSelectProjeto = (id: string) => {
    setSelectedProjetoId(id)
    setSearchParams({ projeto: id })
    const found = projetos.find((p) => p.id === id)
    if (found) {
      setSelectedProjeto(found)
      setProgresso(found.progresso || 0)
      setStatus(found.status)
    }
  }

  // Salvar alterações de progresso/status no banco
  const handleSalvarProjeto = async () => {
    if (!selectedProjeto) return
    setIsSaving(true)
    try {
      const updated = await updateProjeto(selectedProjeto.id, {
        progresso: Number(progresso),
        status,
      })
      setSelectedProjeto(updated)
      setProjetos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      toast({
        title: 'Projeto atualizado!',
        description: `Progresso: ${updated.progresso}% | Status: ${updated.status}`,
      })
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao atualizar projeto',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Função utilitária de cópia com estado temporário
  const copyToClipboard = async (text: string, setCopied: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Fallback manual
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  // Formatador de segundos para HH:MM:SS
  const formatSecondsToTime = (val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0)
    const hours = Math.floor(num / 3600)
    const minutes = Math.floor((num % 3600) / 60)
    const seconds = num % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  // Comando de corte ffmpeg dinâmico
  const ffmpegCorteCmd = useMemo(() => {
    const start = formatSecondsToTime(inicioSeg)
    const end = formatSecondsToTime(fimSeg)
    return `ffmpeg -i pronto_para_editar.mp4 -ss ${start} -to ${end} -c:v libx264 -crf 18 -c:a aac corte.mp4`
  }, [inicioSeg, fimSeg])

  // Comando de conversão base do Guia (Seção 6.3)
  const ffmpegConversaoCmd =
    'ffmpeg -i bruto.mp4 -vf "crop=1080:1920:0:120,fps=30" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k pronto_para_editar.mp4'

  // Comando Reels completo 1080x1920 (crop offset 120 para barra de status)
  const ffmpegReelsCmd =
    'ffmpeg -i bruto.mp4 -vf "crop=1080:1920:0:120,fps=30" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k TUT_reels_1080x1920.mp4'

  // Comandos de ajuste de cor do Guia
  const cmdCor1 =
    'ffmpeg -i entrada.mp4 -vf "colorbalance=rs=0.05:gs=-0.02:bs=-0.05" -c:a copy cor_balanceada.mp4'
  const cmdCor2 =
    'ffmpeg -i entrada.mp4 -vf "eq=contrast=1.2:brightness=0.02" -c:a copy contraste_elevado.mp4'
  const cmdCor3 =
    'ffmpeg -i entrada.mp4 -vf "colortemperature=temperature=6500" -c:a copy tom_quente.mp4'

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* SELETOR DE PROJETO NO TOPO */}
      <div className="bg-white border-2 border-black p-5 shadow-brutal flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#555] mb-1">
            Projeto Ativo para Edição
          </label>
          <select
            value={selectedProjetoId}
            onChange={(e) => handleSelectProjeto(e.target.value)}
            className="w-full h-11 px-3 border-2 border-black bg-white text-[#111] font-bold text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#F5D90A]"
          >
            {projetos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} — [{p.formato}] ({p.status})
              </option>
            ))}
          </select>
        </div>

        {selectedProjeto && (
          <div className="flex flex-wrap items-center gap-3 border-t md:border-t-0 md:border-l-2 border-black pt-3 md:pt-0 md:pl-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#555] mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusProjeto)}
                className="h-10 px-2 border-2 border-black bg-white text-xs font-bold uppercase focus:outline-none"
              >
                <option value="Em gravação">Em gravação</option>
                <option value="Em edição">Em edição</option>
                <option value="Pronto para revisão">Pronto para revisão</option>
                <option value="Publicado">Publicado</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#555] mb-1">
                Progresso ({progresso}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={progresso}
                onChange={(e) => setProgresso(Number(e.target.value))}
                className="w-28 h-2 bg-black accent-[#F5D90A] cursor-pointer"
              />
            </div>

            <button
              onClick={handleSalvarProjeto}
              disabled={isSaving}
              className="h-10 px-4 bg-[#F5D90A] hover:bg-[#ffe31a] text-black border-2 border-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer self-end disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 1. SEÇÃO: CORTES RÁPIDOS */}
      <div ref={cortesRef}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-[#F5D90A] border-2 border-black flex items-center justify-center font-black text-xs">
            1
          </div>
          <h2 className="text-lg font-bold uppercase tracking-[0.02em] text-[#111] flex items-center gap-2">
            <Scissors className="w-5 h-5" />
            <span>CORTES RÁPIDOS (FFMPEG)</span>
          </h2>
        </div>

        <div className="border-2 border-black bg-white p-6 shadow-brutal space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#111] mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Início (segundos)</span>
              </label>
              <input
                type="number"
                min="0"
                value={inicioSeg}
                onChange={(e) => setInicioSeg(e.target.value)}
                className="w-full h-11 px-3 border-2 border-black bg-white font-mono text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#F5D90A]"
                placeholder="Ex: 3"
              />
              <span className="text-[11px] font-mono text-[#555] mt-1 block">
                Equivale a: {formatSecondsToTime(inicioSeg)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#111] mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Fim (segundos)</span>
              </label>
              <input
                type="number"
                min="0"
                value={fimSeg}
                onChange={(e) => setFimSeg(e.target.value)}
                className="w-full h-11 px-3 border-2 border-black bg-white font-mono text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#F5D90A]"
                placeholder="Ex: 45"
              />
              <span className="text-[11px] font-mono text-[#555] mt-1 block">
                Equivale a: {formatSecondsToTime(fimSeg)}
              </span>
            </div>
          </div>

          {/* Terminal / Bloco de Código de Corte */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#111] flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                <span>Comando ffmpeg gerado em tempo real:</span>
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(ffmpegCorteCmd, setCopiadoCorte)}
                className={`h-9 px-3 border-2 border-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                  copiadoCorte
                    ? 'bg-[#E6F4EA] text-[#1D6B3A] border-[#1D6B3A]'
                    : 'bg-white hover:bg-[#F5D90A] text-black'
                }`}
              >
                {copiadoCorte ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar comando</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-[#111111] text-[#7FE08B] p-4 border-2 border-black overflow-x-auto font-mono text-xs select-all">
              <code>{ffmpegCorteCmd}</code>
            </div>
          </div>

          {/* Botão de conversão de bruto */}
          <div className="pt-4 border-t-2 border-black flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-[#111]">
                Ajustar bruto do S23 (1080×1920 a 30 fps)
              </p>
              <p className="text-[11px] text-[#555]">
                Remove o topo com a barra de status do celular e padroniza para 30 fps.
              </p>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(ffmpegConversaoCmd, setCopiadoConversao)}
              className={`h-10 px-4 border-2 border-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                copiadoConversao
                  ? 'bg-[#E6F4EA] text-[#1D6B3A] border-[#1D6B3A]'
                  : 'bg-black text-white hover:bg-[#333]'
              }`}
            >
              {copiadoConversao ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar comando de conversão</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. SEÇÃO: AJUSTES DE COR */}
      <div ref={corRef}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-[#F5D90A] border-2 border-black flex items-center justify-center font-black text-xs">
            2
          </div>
          <h2 className="text-lg font-bold uppercase tracking-[0.02em] text-[#111] flex items-center gap-2">
            <Palette className="w-5 h-5" />
            <span>AJUSTES DE COR (PRESETS FFMPEG)</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Correção de branco */}
          <div className="border-2 border-black bg-white p-5 shadow-brutal flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-extrabold uppercase text-sm text-[#111]">Correção de branco</h3>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-[#F4F4F4] border border-black">
                  colorbalance
                </span>
              </div>
              <p className="text-xs text-[#555] mb-3">
                Equilibra tons azulados da iluminação artificial e neutraliza a tela do celular.
              </p>
              <div className="bg-[#111111] text-[#7FE08B] p-3 border border-black font-mono text-[11px] overflow-x-auto mb-4 select-all">
                <code>{cmdCor1}</code>
              </div>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(cmdCor1, setCopiadoCor1)}
              className={`w-full h-10 border-2 border-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                copiadoCor1
                  ? 'bg-[#E6F4EA] text-[#1D6B3A] border-[#1D6B3A]'
                  : 'bg-white hover:bg-[#F5D90A] text-black'
              }`}
            >
              {copiadoCor1 ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar comando</span>
                </>
              )}
            </button>
          </div>

          {/* Card 2: Aumentar contraste */}
          <div className="border-2 border-black bg-white p-5 shadow-brutal flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-extrabold uppercase text-sm text-[#111]">Aumentar contraste</h3>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-[#F4F4F4] border border-black">
                  eq=contrast=1.2
                </span>
              </div>
              <p className="text-xs text-[#555] mb-3">
                Eleva a separação entre texto e fundo, essencial para telas com modo escuro ativado.
              </p>
              <div className="bg-[#111111] text-[#7FE08B] p-3 border border-black font-mono text-[11px] overflow-x-auto mb-4 select-all">
                <code>{cmdCor2}</code>
              </div>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(cmdCor2, setCopiadoCor2)}
              className={`w-full h-10 border-2 border-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                copiadoCor2
                  ? 'bg-[#E6F4EA] text-[#1D6B3A] border-[#1D6B3A]'
                  : 'bg-white hover:bg-[#F5D90A] text-black'
              }`}
            >
              {copiadoCor2 ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar comando</span>
                </>
              )}
            </button>
          </div>

          {/* Card 3: Tom quente */}
          <div className="border-2 border-black bg-white p-5 shadow-brutal flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-extrabold uppercase text-sm text-[#111]">
                  Vídeo com calor (tom quente)
                </h3>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-[#F4F4F4] border border-black">
                  colortemperature=6500
                </span>
              </div>
              <p className="text-xs text-[#555] mb-3">
                Adiciona temperatura acolhedora para tutoriais humanizados com narração amigável.
              </p>
              <div className="bg-[#111111] text-[#7FE08B] p-3 border border-black font-mono text-[11px] overflow-x-auto mb-4 select-all">
                <code>{cmdCor3}</code>
              </div>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(cmdCor3, setCopiadoCor3)}
              className={`w-full h-10 border-2 border-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                copiadoCor3
                  ? 'bg-[#E6F4EA] text-[#1D6B3A] border-[#1D6B3A]'
                  : 'bg-white hover:bg-[#F5D90A] text-black'
              }`}
            >
              {copiadoCor3 ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar comando</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. SEÇÃO: CONVERSÃO PARA REELS */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-[#F5D90A] border-2 border-black flex items-center justify-center font-black text-xs">
            3
          </div>
          <h2 className="text-lg font-bold uppercase tracking-[0.02em] text-[#111] flex items-center gap-2">
            <Layers className="w-5 h-5" />
            <span>CONVERSÃO PARA REELS 9:16 (1080×1920)</span>
          </h2>
        </div>

        <div className="border-2 border-black bg-white p-6 shadow-brutal flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-extrabold uppercase text-sm text-[#111]">
                Enquadramento 9:16 com corte de status bar (120px)
              </span>
              <span className="px-2 py-0.5 bg-[#F5D90A] text-black text-[10px] font-bold border border-black">
                S23 Nativo
              </span>
            </div>
            <p className="text-xs text-[#555] max-w-2xl leading-relaxed">
              O Galaxy S23 grava em 1080×2340 pixels. Este comando faz o crop vertical exato para
              1080×1920 a 30 fps, escondendo a barra de status superior (offset Y=120) para
              conformidade total com o Instagram Reels.
            </p>
          </div>

          <button
            type="button"
            onClick={() => copyToClipboard(ffmpegReelsCmd, setCopiadoReels)}
            className={`h-14 px-6 border-2 border-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-brutal-hover ${
              copiadoReels
                ? 'bg-[#E6F4EA] text-[#1D6B3A] border-[#1D6B3A]'
                : 'bg-[#F5D90A] hover:bg-[#ffe31a] text-black'
            }`}
          >
            {copiadoReels ? (
              <>
                <Check className="w-5 h-5" />
                <span>Copiado para a área de transferência!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Copiar comando Reels 9:16 (1080×1920)</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* 4. NOTA DE SEGURANÇA (BORDA AMARELA) */}
      <div className="border-2 border-[#F5D90A] bg-[#FFFDE6] p-5 shadow-brutal flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-black shrink-0 mt-0.5" />
        <div>
          <h4 className="font-extrabold uppercase text-xs tracking-wider text-black mb-1">
            REGRA DE SEGURANÇA OPERACIONAL (GUIA DE GRAVAÇÃO)
          </h4>
          <p className="text-sm font-bold text-black">
            Nunca sobrescreva o vídeo bruto. Rode sempre os comandos do terminal em uma cópia.
            Mantenha os originais na pasta{' '}
            <code className="bg-black text-[#F5D90A] px-1.5 py-0.5 text-xs">
              Tutoriais\TUT-XXX\bruto\
            </code>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

export default Edicao
