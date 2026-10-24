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
  Sliders,
  CheckCircle2,
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
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* SELETOR DE PROJETO NO TOPO */}
      <div className="bg-[#FAF7F0] border border-[#1F3D2B]/15 rounded-2xl p-5 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-[#1F3D2B]/70 mb-1.5 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#C4704F]" />
            <span>Projeto Ativo para Edição</span>
          </label>
          <select
            value={selectedProjetoId}
            onChange={(e) => handleSelectProjeto(e.target.value)}
            className="w-full h-11 px-3 border border-[#1F3D2B]/20 rounded-xl bg-white text-[#142419] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
          >
            {projetos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} — [{p.formato}] ({p.status})
              </option>
            ))}
          </select>
        </div>

        {selectedProjeto && (
          <div className="flex flex-wrap items-center gap-3 border-t md:border-t-0 md:border-l border-[#1F3D2B]/10 pt-3 md:pt-0 md:pl-5">
            <div>
              <label className="block text-[11px] font-semibold text-[#1F3D2B]/70 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusProjeto)}
                className="h-10 px-3 border border-[#1F3D2B]/20 rounded-xl bg-white text-xs font-semibold text-[#1F3D2B] focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
              >
                <option value="Em gravação">Em gravação</option>
                <option value="Em edição">Em edição</option>
                <option value="Pronto para revisão">Pronto para revisão</option>
                <option value="Publicado">Publicado</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#1F3D2B]/70 mb-1">
                Progresso ({progresso}%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progresso}
                  onChange={(e) => setProgresso(Number(e.target.value))}
                  className="w-28 h-2 bg-[#EEF3EE] rounded-lg accent-[#C4704F] cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={handleSalvarProjeto}
              disabled={isSaving}
              className="h-10 px-4 bg-[#C4704F] hover:bg-[#D98A6C] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-card hover:shadow-soft cursor-pointer self-end disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 1. SEÇÃO: CORTES RÁPIDOS */}
      <div ref={cortesRef}>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-lg bg-[#1F3D2B] text-white flex items-center justify-center font-serif font-bold text-xs">
            1
          </span>
          <h2 className="text-lg font-serif font-bold text-[#1F3D2B] flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#C4704F]" />
            <span>Cortes Rápidos e Precisos (FFmpeg)</span>
          </h2>
        </div>

        <div className="border border-[#1F3D2B]/15 bg-[#FAF7F0] rounded-2xl p-6 shadow-card space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1F3D2B] mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C4704F]" />
                <span>Início do Corte (segundos)</span>
              </label>
              <input
                type="number"
                min="0"
                value={inicioSeg}
                onChange={(e) => setInicioSeg(e.target.value)}
                className="w-full h-11 px-3 border border-[#1F3D2B]/20 rounded-xl bg-white font-mono text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
                placeholder="Ex: 3"
              />
              <span className="text-[11px] font-mono text-[#1F3D2B]/60 mt-1 block">
                Tempo formatado: {formatSecondsToTime(inicioSeg)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F3D2B] mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C4704F]" />
                <span>Fim do Corte (segundos)</span>
              </label>
              <input
                type="number"
                min="0"
                value={fimSeg}
                onChange={(e) => setFimSeg(e.target.value)}
                className="w-full h-11 px-3 border border-[#1F3D2B]/20 rounded-xl bg-white font-mono text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
                placeholder="Ex: 45"
              />
              <span className="text-[11px] font-mono text-[#1F3D2B]/60 mt-1 block">
                Tempo formatado: {formatSecondsToTime(fimSeg)}
              </span>
            </div>
          </div>

          {/* Terminal / Bloco de Código de Corte */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#1F3D2B] flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-[#C4704F]" />
                <span>Comando FFmpeg gerado em tempo real:</span>
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(ffmpegCorteCmd, setCopiadoCorte)}
                className={`h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                  copiadoCorte
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white hover:bg-[#EEF3EE] text-[#1F3D2B] border-[#1F3D2B]/20 shadow-sm'
                }`}
              >
                {copiadoCorte ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#C4704F]" />
                    <span>Copiar comando</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-[#142419] text-[#FAF7F0] p-4 rounded-xl border border-[#1F3D2B]/20 overflow-x-auto font-mono text-xs select-all leading-relaxed">
              <code>{ffmpegCorteCmd}</code>
            </div>
          </div>

          {/* Botão de conversão de bruto */}
          <div className="pt-4 border-t border-[#1F3D2B]/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#142419]">
                Ajustar bruto do S23 (1080×1920 a 30 fps)
              </p>
              <p className="text-[11px] text-[#1F3D2B]/70">
                Remove o topo com a barra de status do celular e padroniza para 30 fps sem perda.
              </p>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(ffmpegConversaoCmd, setCopiadoConversao)}
              className={`h-10 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                copiadoConversao
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-[#1F3D2B] hover:bg-[#2E583E] text-white border-[#1F3D2B] shadow-card'
              }`}
            >
              {copiadoConversao ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#D98A6C]" />
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
          <span className="w-6 h-6 rounded-lg bg-[#1F3D2B] text-white flex items-center justify-center font-serif font-bold text-xs">
            2
          </span>
          <h2 className="text-lg font-serif font-bold text-[#1F3D2B] flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#C4704F]" />
            <span>Ajustes de Cor e Harmonia (Presets FFmpeg)</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Correção de branco */}
          <div className="border border-[#1F3D2B]/15 bg-[#FAF7F0] rounded-2xl p-5 shadow-card hover:shadow-soft transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif font-bold text-sm text-[#142419]">Correção de branco</h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-[#EEF3EE] rounded-md text-[#1F3D2B] border border-[#1F3D2B]/10">
                  colorbalance
                </span>
              </div>
              <p className="text-xs text-[#1F3D2B]/75 mb-3 leading-relaxed">
                Equilibra tons azulados da iluminação artificial e neutraliza a tela do celular.
              </p>
              <div className="bg-[#142419] text-[#FAF7F0] p-3 rounded-xl border border-[#1F3D2B]/20 font-mono text-[11px] overflow-x-auto mb-4 select-all">
                <code>{cmdCor1}</code>
              </div>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(cmdCor1, setCopiadoCor1)}
              className={`w-full h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                copiadoCor1
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white hover:bg-[#EEF3EE] text-[#1F3D2B] border-[#1F3D2B]/20 shadow-sm'
              }`}
            >
              {copiadoCor1 ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#C4704F]" />
                  <span>Copiar comando</span>
                </>
              )}
            </button>
          </div>

          {/* Card 2: Aumentar contraste */}
          <div className="border border-[#1F3D2B]/15 bg-[#FAF7F0] rounded-2xl p-5 shadow-card hover:shadow-soft transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif font-bold text-sm text-[#142419]">Aumentar contraste</h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-[#EEF3EE] rounded-md text-[#1F3D2B] border border-[#1F3D2B]/10">
                  eq=contrast=1.2
                </span>
              </div>
              <p className="text-xs text-[#1F3D2B]/75 mb-3 leading-relaxed">
                Eleva a separação entre texto e fundo, essencial para telas com modo escuro ativado.
              </p>
              <div className="bg-[#142419] text-[#FAF7F0] p-3 rounded-xl border border-[#1F3D2B]/20 font-mono text-[11px] overflow-x-auto mb-4 select-all">
                <code>{cmdCor2}</code>
              </div>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(cmdCor2, setCopiadoCor2)}
              className={`w-full h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                copiadoCor2
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white hover:bg-[#EEF3EE] text-[#1F3D2B] border-[#1F3D2B]/20 shadow-sm'
              }`}
            >
              {copiadoCor2 ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#C4704F]" />
                  <span>Copiar comando</span>
                </>
              )}
            </button>
          </div>

          {/* Card 3: Tom quente */}
          <div className="border border-[#1F3D2B]/15 bg-[#FAF7F0] rounded-2xl p-5 shadow-card hover:shadow-soft transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif font-bold text-sm text-[#142419]">
                  Vídeo com calor (tom acolhedor)
                </h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-[#F4EAE4] rounded-md text-[#C4704F] border border-[#C4704F]/20">
                  temperature=6500
                </span>
              </div>
              <p className="text-xs text-[#1F3D2B]/75 mb-3 leading-relaxed">
                Adiciona temperatura acolhedora para tutoriais humanizados com narração amigável.
              </p>
              <div className="bg-[#142419] text-[#FAF7F0] p-3 rounded-xl border border-[#1F3D2B]/20 font-mono text-[11px] overflow-x-auto mb-4 select-all">
                <code>{cmdCor3}</code>
              </div>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(cmdCor3, setCopiadoCor3)}
              className={`w-full h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                copiadoCor3
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white hover:bg-[#EEF3EE] text-[#1F3D2B] border-[#1F3D2B]/20 shadow-sm'
              }`}
            >
              {copiadoCor3 ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#C4704F]" />
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
          <span className="w-6 h-6 rounded-lg bg-[#1F3D2B] text-white flex items-center justify-center font-serif font-bold text-xs">
            3
          </span>
          <h2 className="text-lg font-serif font-bold text-[#1F3D2B] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#C4704F]" />
            <span>Conversão para Reels 9:16 (1080×1920)</span>
          </h2>
        </div>

        <div className="border border-[#1F3D2B]/15 bg-[#FAF7F0] rounded-2xl p-6 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-[#142419]">
                Enquadramento 9:16 com corte de status bar (120px)
              </span>
              <span className="px-2.5 py-0.5 bg-[#EEF3EE] text-[#1F3D2B] text-[11px] font-semibold rounded-md border border-[#1F3D2B]/15">
                S23 Nativo
              </span>
            </div>
            <p className="text-xs text-[#1F3D2B]/75 max-w-2xl leading-relaxed">
              O Galaxy S23 grava em 1080×2340 pixels. Este comando faz o crop vertical exato para
              1080×1920 a 30 fps, escondendo a barra de status superior (offset Y=120) para
              conformidade total com o padrão visual do Instagram Reels.
            </p>
          </div>

          <button
            type="button"
            onClick={() => copyToClipboard(ffmpegReelsCmd, setCopiadoReels)}
            className={`h-12 px-6 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 border ${
              copiadoReels
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-[#C4704F] hover:bg-[#D98A6C] text-white border-[#C4704F] shadow-card hover:shadow-soft'
            }`}
          >
            {copiadoReels ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Copiado para a área de transferência!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Copiar comando Reels 9:16 (1080×1920)</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* 4. NOTA DE SEGURANÇA OPERACIONAL */}
      <div className="border border-[#C4704F]/30 bg-[#FFF9F6] rounded-2xl p-5 shadow-card flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#F4EAE4] text-[#C4704F] flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#C4704F] mb-1">
            Regra de Segurança Operacional (Guia de Gravação)
          </h4>
          <p className="text-xs font-medium text-[#142419] leading-relaxed">
            Nunca sobrescreva o vídeo bruto. Rode sempre os comandos do terminal em uma cópia.
            Mantenha os arquivos originais salvos na pasta{' '}
            <code className="bg-[#1F3D2B] text-[#FAF7F0] px-2 py-0.5 rounded text-xs font-mono">
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
