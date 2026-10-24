import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getProjetos, updateProjeto } from '@/services/projetos'
import { getEdicaoPresets, createEdicaoPreset, deleteEdicaoPreset } from '@/services/edicaoPresets'
import type {
  ProjetoRecord,
  StatusProjeto,
  EtapaChecklist,
  ChecklistEdicao,
  EdicaoPresetRecord,
} from '@/types/database'
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
  Circle,
  Plus,
  Trash2,
  Volume2,
  Subtitles,
  Image as ImageIcon,
  FileCode,
  Download,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ItemCorte {
  id: string
  inicio: string
  fim: string
  rotulo: string
}

const ETAPAS_CHECKLIST_PADRAO: EtapaChecklist[] = [
  'Cortado',
  'Legendado',
  'Colorido',
  'Áudio normalizado',
  'Exportado',
  'Postado',
]

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

  // Checklist de edição do projeto
  const [checklist, setChecklist] = useState<ChecklistEdicao>({
    Cortado: false,
    Legendado: false,
    Colorido: false,
    'Áudio normalizado': false,
    Exportado: false,
    Postado: false,
  })
  const [isSavingChecklist, setIsSavingChecklist] = useState(false)

  // Presets do banco
  const [presets, setPresets] = useState<EdicaoPresetRecord[]>([])
  const [isLoadingPresets, setIsLoadingPresets] = useState(false)
  const [copiedPresetId, setCopiedPresetId] = useState<string | null>(null)

  // Modal / Form de Novo Preset
  const [novoPresetNome, setNovoPresetNome] = useState('')
  const [novoPresetComando, setNovoPresetComando] = useState('')
  const [novoPresetDescricao, setNovoPresetDescricao] = useState('')
  const [isSavingPreset, setIsSavingPreset] = useState(false)
  const [mostrarFormNovoPreset, setMostrarFormNovoPreset] = useState(false)

  // 1. Cortes simples existentes
  const [inicioSeg, setInicioSeg] = useState<string>('3')
  const [fimSeg, setFimSeg] = useState<string>('45')

  // 2. Cortes múltiplos
  const [nomeArquivoEntradaMulti, setNomeArquivoEntradaMulti] =
    useState<string>('pronto_para_editar.mp4')
  const [listaCortes, setListaCortes] = useState<ItemCorte[]>([
    { id: 'corte-1', inicio: '3', fim: '25', rotulo: 'abertura' },
    { id: 'corte-2', inicio: '28', fim: '55', rotulo: 'parte 2' },
  ])

  // Estados de feedback de cópia
  const [copiadoCorte, setCopiadoCorte] = useState(false)
  const [copiadoBatMulti, setCopiadoBatMulti] = useState(false)
  const [copiadoConversao, setCopiadoConversao] = useState(false)
  const [copiadoReels, setCopiadoReels] = useState(false)
  const [copiadoLoudnorm, setCopiadoLoudnorm] = useState(false)
  const [copiadoSrt, setCopiadoSrt] = useState(false)
  const [copiadoThumb, setCopiadoThumb] = useState(false)

  // Referência para focar em seções se chamado por atalhos
  const cortesRef = useRef<HTMLDivElement>(null)
  const presetsRef = useRef<HTMLDivElement>(null)
  const checklistRef = useRef<HTMLDivElement>(null)
  const guiaRef = useRef<HTMLDivElement>(null)

  // Carregar presets
  const loadPresets = async () => {
    setIsLoadingPresets(true)
    try {
      const data = await getEdicaoPresets()
      setPresets(data)
    } catch (e) {
      console.error('Erro ao carregar presets:', e)
    } finally {
      setIsLoadingPresets(false)
    }
  }

  // Carregar projetos
  useEffect(() => {
    getProjetos()
      .then((data) => {
        setProjetos(data)
        if (data.length > 0) {
          let chosen = data[0]
          if (projetoParam) {
            const match = data.find((p) => p.id === projetoParam)
            if (match) chosen = match
          }
          setSelectedProjetoId(chosen.id)
          setSelectedProjeto(chosen)
          setProgresso(chosen.progresso || 0)
          setStatus(chosen.status)
          initChecklistFromProjeto(chosen)
        }
      })
      .catch(console.error)

    loadPresets()
  }, [projetoParam])

  // Inicializa o checklist garantindo todas as chaves
  const initChecklistFromProjeto = (proj: ProjetoRecord) => {
    const raw = (proj.checklist_edicao || {}) as Partial<ChecklistEdicao>
    const filled: ChecklistEdicao = {
      Cortado: Boolean(raw.Cortado),
      Legendado: Boolean(raw.Legendado),
      Colorido: Boolean(raw.Colorido),
      'Áudio normalizado': Boolean(raw['Áudio normalizado']),
      Exportado: Boolean(raw.Exportado),
      Postado: Boolean(raw.Postado),
    }
    setChecklist(filled)
  }

  // Ações de atalho direto
  useEffect(() => {
    if (actionParam === 'corte') {
      cortesRef.current?.scrollIntoView({ behavior: 'smooth' })
    } else if (actionParam === 'cor' || actionParam === 'presets') {
      presetsRef.current?.scrollIntoView({ behavior: 'smooth' })
    } else if (actionParam === 'checklist') {
      checklistRef.current?.scrollIntoView({ behavior: 'smooth' })
    } else if (actionParam === 'guia') {
      guiaRef.current?.scrollIntoView({ behavior: 'smooth' })
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
        presetsRef.current?.scrollIntoView({ behavior: 'smooth' })
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
      initChecklistFromProjeto(found)
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

  // Toggle e persistência imediata de cada etapa do checklist
  const handleToggleChecklistEtapa = async (etapa: EtapaChecklist) => {
    if (!selectedProjeto) {
      toast({
        title: 'Selecione um projeto',
        description: 'Vincule as etapas a um projeto ativo antes de marcar o checklist.',
        variant: 'destructive',
      })
      return
    }

    const novoChecklist: ChecklistEdicao = {
      ...checklist,
      [etapa]: !checklist[etapa],
    }
    setChecklist(novoChecklist)

    // Calcular novo progresso proporcional às 6 etapas (100 / 6 ≈ 16.66% por etapa)
    const etapasConcluidas = Object.values(novoChecklist).filter(Boolean).length
    const novoProgresso = Math.round((etapasConcluidas / ETAPAS_CHECKLIST_PADRAO.length) * 100)

    let novoStatus = status
    if (etapasConcluidas === ETAPAS_CHECKLIST_PADRAO.length) {
      novoStatus = 'Publicado'
    } else if (etapasConcluidas >= 5) {
      novoStatus = 'Pronto para revisão'
    } else if (etapasConcluidas > 0) {
      novoStatus = 'Em edição'
    }

    setProgresso(novoProgresso)
    setStatus(novoStatus)

    setIsSavingChecklist(true)
    try {
      const updated = await updateProjeto(selectedProjeto.id, {
        checklist_edicao: novoChecklist,
        progresso: novoProgresso,
        status: novoStatus,
      })
      setSelectedProjeto(updated)
      setProjetos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    } catch (err) {
      console.error('Erro ao salvar checklist:', err)
      toast({
        title: 'Erro ao atualizar checklist',
        variant: 'destructive',
      })
    } finally {
      setIsSavingChecklist(false)
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

  // 1. Comando de corte ffmpeg simples existente
  const ffmpegCorteCmd = useMemo(() => {
    const start = formatSecondsToTime(inicioSeg)
    const end = formatSecondsToTime(fimSeg)
    return `ffmpeg -i pronto_para_editar.mp4 -ss ${start} -to ${end} -c:v libx264 -crf 18 -c:a aac corte.mp4`
  }, [inicioSeg, fimSeg])

  // 2. Manipulação de Cortes Múltiplos
  const handleAdicionarCorte = () => {
    const proximoNumero = listaCortes.length + 1
    const novoCorte: ItemCorte = {
      id: `corte-${Date.now()}`,
      inicio: '0',
      fim: '30',
      rotulo: `corte ${proximoNumero}`,
    }
    setListaCortes((prev) => [...prev, novoCorte])
  }

  const handleRemoverCorte = (id: string) => {
    if (listaCortes.length <= 1) {
      toast({
        title: 'Mínimo de 1 corte',
        description: 'Mantenha ao menos um corte na lista ou use o corte simples.',
      })
      return
    }
    setListaCortes((prev) => prev.filter((c) => c.id !== id))
  }

  const handleUpdateCorte = (id: string, field: keyof ItemCorte, value: string) => {
    setListaCortes((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  // Gera script .bat Windows para executar todos os cortes múltiplos de uma só vez
  const scriptBatMultiplo = useMemo(() => {
    const entrada = (nomeArquivoEntradaMulti || 'pronto_para_editar.mp4').trim()
    const baseName = entrada.replace(/\.[^/.]+$/, '') || 'video'

    let bat = `@echo off\r\n`
    bat += `rem ========================================================\r\n`
    bat += `rem Script de Cortes Multiplos FFmpeg - Aline Resolve\r\n`
    bat += `rem Arquivo de Entrada: ${entrada}\r\n`
    bat += `rem Total de cortes: ${listaCortes.length}\r\n`
    bat += `rem ========================================================\r\n\r\n`
    bat += `echo Iniciando cortes em lote...\r\n`
    bat += `if not exist "${entrada}" (\r\n`
    bat += `    echo [ERRO] O arquivo "${entrada}" nao foi encontrado na pasta atual!\r\n`
    bat += `    pause\r\n`
    bat += `    exit /b 1\r\n`
    bat += `)\r\n\r\n`

    listaCortes.forEach((item, index) => {
      const idx = index + 1
      const start = formatSecondsToTime(item.inicio)
      const end = formatSecondsToTime(item.fim)
      const sanitizedRotulo = item.rotulo
        ? item.rotulo.toLowerCase().replace(/[^a-z0-9_-]/g, '_')
        : `corte${idx}`
      const saida = `${baseName}_${sanitizedRotulo}.mp4`

      bat += `echo --------------------------------------------------------\r\n`
      bat += `echo [${idx}/${listaCortes.length}] Cortando: ${item.rotulo || `corte ${idx}`} (${start} ate ${end})\r\n`
      bat += `echo Gerando: ${saida}\r\n`
      bat += `ffmpeg -hide_banner -y -i "${entrada}" -ss ${start} -to ${end} -c:v libx264 -crf 18 -c:a aac "${saida}"\r\n`
      bat += `if %errorlevel% neq 0 (\r\n`
      bat += `    echo [AVISO] Ocorreu uma falha no corte ${idx}.\r\n`
      bat += `) else (\r\n`
      bat += `    echo [OK] Corte ${idx} finalizado com sucesso.\r\n`
      bat += `)\r\n\r\n`
    })

    bat += `echo ========================================================\r\n`
    bat += `echo Todos os ${listaCortes.length} cortes foram concluidos!\r\n`
    bat += `echo Pressione qualquer tecla para fechar esta janela.\r\n`
    bat += `pause >nul\r\n`
    return bat
  }, [nomeArquivoEntradaMulti, listaCortes])

  // Download do arquivo .bat gerado
  const handleDownloadBat = () => {
    const blob = new Blob([scriptBatMultiplo], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'cortar_todos_os_trechos.bat'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast({
      title: 'Download iniciado',
      description: 'Arquivo cortar_todos_os_trechos.bat salvo. Coloque-o na pasta do vídeo.',
    })
  }

  // Presets CRUD: Criar preset
  const handleCriarPreset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novoPresetNome.trim() || !novoPresetComando.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Informe o nome e o comando FFmpeg do preset.',
        variant: 'destructive',
      })
      return
    }

    setIsSavingPreset(true)
    try {
      const created = await createEdicaoPreset({
        name: novoPresetNome.trim(),
        command: novoPresetComando.trim(),
        description: novoPresetDescricao.trim() || undefined,
      })
      setPresets((prev) => [...prev, created])
      setNovoPresetNome('')
      setNovoPresetComando('')
      setNovoPresetDescricao('')
      setMostrarFormNovoPreset(false)
      toast({
        title: 'Preset salvo!',
        description: `Preset "${created.name}" adicionado com sucesso.`,
      })
    } catch (err) {
      console.error('Erro ao criar preset:', err)
      toast({
        title: 'Erro ao salvar preset',
        description: 'Verifique se está conectado e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSavingPreset(false)
    }
  }

  // Presets CRUD: Excluir preset
  const handleExcluirPreset = async (id: string, nome: string) => {
    if (!window.confirm(`Deseja realmente excluir o preset "${nome}"?`)) return
    try {
      await deleteEdicaoPreset(id)
      setPresets((prev) => prev.filter((p) => p.id !== id))
      toast({
        title: 'Preset excluído',
        description: `O preset "${nome}" foi removido.`,
      })
    } catch (err) {
      console.error('Erro ao excluir preset:', err)
      toast({
        title: 'Erro ao excluir preset',
        variant: 'destructive',
      })
    }
  }

  // Comando de conversão base do Guia (Seção 6.3)
  const ffmpegConversaoCmd =
    'ffmpeg -i bruto.mp4 -vf "crop=1080:1920:0:120,fps=30" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k pronto_para_editar.mp4'

  // Comando Reels completo 1080x1920 (crop offset 120 para barra de status)
  const ffmpegReelsCmd =
    'ffmpeg -i bruto.mp4 -vf "crop=1080:1920:0:120,fps=30" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k TUT_reels_1080x1920.mp4'

  // Novos comandos do Guia:
  // 1. Normalização de áudio (loudnorm)
  const ffmpegLoudnormCmd =
    'ffmpeg -i corte.mp4 -af "loudnorm=I=-16:TP=-1.5:LRA=11" -c:v copy -c:a aac -b:a 192k video_audio_normalizado.mp4'

  // 2. Legendas automáticas via arquivo .srt (burn-in legível para Reels)
  const ffmpegSrtCmd =
    'ffmpeg -i video_audio_normalizado.mp4 -vf "subtitles=legenda.srt:force_style=\'FontName=Arial,FontSize=18,Bold=1,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=3,Outline=2,Shadow=0,MarginV=140\'" -c:v libx264 -crf 18 -c:a copy video_legendado_reels.mp4'

  // 3. Extração de frame para thumbnail (alta qualidade JPEG)
  const ffmpegThumbCmd =
    'ffmpeg -ss 00:00:05 -i pronto_para_editar.mp4 -vframes 1 -q:v 2 thumbnail_alta_qualidade.jpg'

  // Contagem do progresso das etapas
  const etapasConcluidasCount = useMemo(() => {
    return ETAPAS_CHECKLIST_PADRAO.filter((e) => checklist[e]).length
  }, [checklist])

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
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

      {/* CHECKLIST DE EDIÇÃO POR PROJETO */}
      <section
        ref={checklistRef}
        className="border border-[#1F3D2B]/15 bg-[#FAF7F0] rounded-2xl p-6 shadow-card space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1F3D2B]/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#C4704F] text-white flex items-center justify-center font-serif font-bold text-xs">
                ✓
              </span>
              <h2 className="text-lg font-serif font-bold text-[#1F3D2B]">
                Checklist de Edição do Projeto
              </h2>
            </div>
            <p className="text-xs text-[#1F3D2B]/70 mt-1">
              {selectedProjeto ? (
                <>
                  Etapas padronizadas para o vídeo{' '}
                  <strong className="text-[#1F3D2B]">{selectedProjeto.nome}</strong>
                </>
              ) : (
                'Selecione um projeto para acompanhar as etapas de edição'
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isSavingChecklist && (
              <span className="text-[11px] font-medium text-[#C4704F] animate-pulse">
                Sincronizando...
              </span>
            )}
            <div className="flex items-center gap-2 bg-[#EEF3EE] px-3.5 py-1.5 rounded-xl border border-[#1F3D2B]/10">
              <span className="text-xs font-bold text-[#1F3D2B]">
                {etapasConcluidasCount} de {ETAPAS_CHECKLIST_PADRAO.length}
              </span>
              <span className="text-[11px] text-[#1F3D2B]/70 font-semibold">
                ({Math.round((etapasConcluidasCount / ETAPAS_CHECKLIST_PADRAO.length) * 100)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Barra de progresso visual */}
        <div className="space-y-1.5">
          <div className="w-full h-3 bg-[#EEF3EE] rounded-full overflow-hidden border border-[#1F3D2B]/10">
            <div
              className="h-full bg-gradient-to-r from-[#1F3D2B] to-[#C4704F] transition-all duration-300"
              style={{
                width: `${(etapasConcluidasCount / ETAPAS_CHECKLIST_PADRAO.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Grid dos itens do checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ETAPAS_CHECKLIST_PADRAO.map((etapa, idx) => {
            const isDone = Boolean(checklist[etapa])
            return (
              <button
                key={etapa}
                type="button"
                onClick={() => handleToggleChecklistEtapa(etapa)}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isDone
                    ? 'bg-[#1F3D2B] text-white border-[#1F3D2B] shadow-card'
                    : 'bg-white hover:bg-[#EEF3EE]/80 text-[#142419] border-[#1F3D2B]/15 hover:border-[#1F3D2B]/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-mono font-bold ${isDone ? 'text-[#D98A6C]' : 'text-[#1F3D2B]/60'}`}
                  >
                    0{idx + 1}
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#1F3D2B]/30" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold leading-tight block">{etapa}</span>
                  <span
                    className={`text-[10px] mt-0.5 block ${isDone ? 'text-white/80' : 'text-[#1F3D2B]/60'}`}
                  >
                    {isDone ? 'Concluído' : 'Pendente'}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* 1. SEÇÃO: CORTES RÁPIDOS & CORTES MÚLTIPLOS COM SCRIPT .BAT */}
      <div ref={cortesRef} className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#1F3D2B] text-white flex items-center justify-center font-serif font-bold text-xs">
              1
            </span>
            <h2 className="text-lg font-serif font-bold text-[#1F3D2B] flex items-center gap-2">
              <Scissors className="w-5 h-5 text-[#C4704F]" />
              <span>Gerador de Cortes (FFmpeg)</span>
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#1F3D2B]/70 hidden sm:block">
            Corte simples + Cortes múltiplos em lote (.bat)
          </span>
        </div>

        {/* SUBSEÇÃO A: CORTES MÚLTIPLOS COM .BAT ÚNICO */}
        <div className="border border-[#1F3D2B]/15 bg-[#FAF7F0] rounded-2xl p-6 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1F3D2B]/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-[#C4704F] text-white rounded-md text-[11px] font-bold uppercase tracking-wider">
                  Novo
                </span>
                <h3 className="font-serif font-bold text-base text-[#142419]">
                  Cortes Múltiplos — Script .bat para Windows
                </h3>
              </div>
              <p className="text-xs text-[#1F3D2B]/75 mt-1">
                Adicione quantos trechos quiser. O sistema gera um script <code>.bat</code> único
                que roda o FFmpeg para cada corte, criando arquivos separados (ex:{' '}
                <code>video_abertura.mp4</code>).
              </p>
            </div>

            <button
              type="button"
              onClick={handleAdicionarCorte}
              className="h-10 px-4 bg-[#1F3D2B] hover:bg-[#2E583E] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-card cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-[#D98A6C]" />
              <span>Adicionar corte</span>
            </button>
          </div>

          {/* Configuração do nome do arquivo base de entrada */}
          <div className="max-w-md">
            <label className="block text-xs font-semibold text-[#1F3D2B] mb-1.5">
              Arquivo de Entrada para o Script
            </label>
            <input
              type="text"
              value={nomeArquivoEntradaMulti}
              onChange={(e) => setNomeArquivoEntradaMulti(e.target.value)}
              className="w-full h-10 px-3 border border-[#1F3D2B]/20 rounded-xl bg-white font-mono text-xs font-semibold text-[#142419] focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
              placeholder="pronto_para_editar.mp4"
            />
            <span className="text-[11px] text-[#1F3D2B]/60 mt-1 block">
              Nome do arquivo que está na mesma pasta onde você vai rodar o <code>.bat</code>.
            </span>
          </div>

          {/* Lista de Cortes */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-[#1F3D2B]">
              Lista de Cortes ({listaCortes.length})
            </label>

            <div className="space-y-2.5">
              {listaCortes.map((corte, index) => {
                const baseName = (nomeArquivoEntradaMulti || 'video').replace(/\.[^/.]+$/, '')
                const sanitizedRotulo = corte.rotulo
                  ? corte.rotulo.toLowerCase().replace(/[^a-z0-9_-]/g, '_')
                  : `corte${index + 1}`
                const nomeSaida = `${baseName}_${sanitizedRotulo}.mp4`

                return (
                  <div
                    key={corte.id}
                    className="p-4 bg-white border border-[#1F3D2B]/15 rounded-xl shadow-card grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                  >
                    <div className="sm:col-span-1 flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-lg bg-[#EEF3EE] text-[#1F3D2B] font-mono text-xs font-bold flex items-center justify-center">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-semibold text-[#1F3D2B]/70 mb-1">
                        Rótulo / Sufixo (opcional)
                      </label>
                      <input
                        type="text"
                        value={corte.rotulo}
                        onChange={(e) => handleUpdateCorte(corte.id, 'rotulo', e.target.value)}
                        placeholder="ex: abertura, parte 2, dica 1"
                        className="w-full h-9 px-2.5 border border-[#1F3D2B]/20 rounded-lg bg-[#FAF7F0]/60 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#C4704F]"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-semibold text-[#1F3D2B]/70 mb-1">
                        Início ({formatSecondsToTime(corte.inicio)})
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          value={corte.inicio}
                          onChange={(e) => handleUpdateCorte(corte.id, 'inicio', e.target.value)}
                          className="w-full h-9 px-2.5 border border-[#1F3D2B]/20 rounded-lg bg-[#FAF7F0]/60 text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-[#C4704F]"
                          placeholder="Segundos"
                        />
                        <span className="text-[10px] text-[#1F3D2B]/60 font-mono">seg</span>
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-semibold text-[#1F3D2B]/70 mb-1">
                        Fim ({formatSecondsToTime(corte.fim)})
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          value={corte.fim}
                          onChange={(e) => handleUpdateCorte(corte.id, 'fim', e.target.value)}
                          className="w-full h-9 px-2.5 border border-[#1F3D2B]/20 rounded-lg bg-[#FAF7F0]/60 text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-[#C4704F]"
                          placeholder="Segundos"
                        />
                        <span className="text-[10px] text-[#1F3D2B]/60 font-mono">seg</span>
                      </div>
                    </div>

                    <div className="sm:col-span-1 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoverCorte(corte.id)}
                        className="p-2 text-[#1F3D2B]/50 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remover corte"
                        aria-label="Remover corte"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="sm:col-span-12 text-[11px] text-[#1F3D2B]/70 font-mono flex items-center gap-1.5 pt-1 border-t border-[#1F3D2B]/10">
                      <span className="font-sans font-semibold text-[#1F3D2B]">
                        Arquivo gerado:
                      </span>
                      <code className="text-[#C4704F]">{nomeSaida}</code>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Terminal / Bloco do Script .BAT */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-[#1F3D2B] flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-[#C4704F]" />
                <span>Script .bat gerado para Windows (executa todos em lote):</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadBat}
                  className="h-9 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all bg-white hover:bg-[#EEF3EE] text-[#1F3D2B] border border-[#1F3D2B]/20 shadow-sm cursor-pointer"
                  title="Baixar arquivo .bat para o Windows"
                >
                  <Download className="w-3.5 h-3.5 text-[#1F3D2B]" />
                  <span>Baixar .bat</span>
                </button>

                <button
                  type="button"
                  onClick={() => copyToClipboard(scriptBatMultiplo, setCopiadoBatMulti)}
                  className={`h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                    copiadoBatMulti
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-[#C4704F] hover:bg-[#D98A6C] text-white border-[#C4704F] shadow-sm'
                  }`}
                >
                  {copiadoBatMulti ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Script Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Script Inteiro</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-[#142419] text-[#FAF7F0] p-4 rounded-xl border border-[#1F3D2B]/20 overflow-x-auto font-mono text-xs select-all max-h-56">
              <pre className="whitespace-pre leading-relaxed">{scriptBatMultiplo}</pre>
            </div>
          </div>
        </div>

        {/* SUBSEÇÃO B: CORTE SIMPLES EXISTENTE (MANTIDO 100% FUNCIONANDO) */}
        <div className="border border-[#1F3D2B]/15 bg-[#FAF7F0] rounded-2xl p-6 shadow-card space-y-6">
          <div className="border-b border-[#1F3D2B]/10 pb-3">
            <h3 className="font-serif font-bold text-base text-[#142419] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C4704F]" />
              <span>Corte Rápido Simples (1 trecho imediato)</span>
            </h3>
            <p className="text-xs text-[#1F3D2B]/75 mt-0.5">
              Gera a linha única do FFmpeg para colar diretamente no terminal do Windows.
            </p>
          </div>

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

          {/* Terminal do corte simples */}
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

      {/* 2. SEÇÃO: PRESETS PERSONALIZÁVEIS PERSISTIDOS NO POCKETBASE */}
      <div ref={presetsRef} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#1F3D2B] text-white flex items-center justify-center font-serif font-bold text-xs">
              2
            </span>
            <h2 className="text-lg font-serif font-bold text-[#1F3D2B] flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#C4704F]" />
              <span>Presets Personalizáveis (PocketBase)</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setMostrarFormNovoPreset(!mostrarFormNovoPreset)}
            className="h-10 px-4 bg-[#C4704F] hover:bg-[#D98A6C] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-card cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{mostrarFormNovoPreset ? 'Fechar formulário' : 'Novo Preset'}</span>
          </button>
        </div>

        {/* Formulário para Adicionar Novo Preset */}
        {mostrarFormNovoPreset && (
          <form
            onSubmit={handleCriarPreset}
            className="bg-[#FAF7F0] border border-[#C4704F]/30 rounded-2xl p-5 shadow-card space-y-4"
          >
            <div className="border-b border-[#1F3D2B]/10 pb-2">
              <h3 className="font-serif font-bold text-sm text-[#142419]">
                Salvar Novo Preset Personalizado
              </h3>
              <p className="text-[11px] text-[#1F3D2B]/70">
                O preset será salvo no seu banco de dados e ficará disponível em qualquer acesso.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F3D2B] mb-1">
                  Nome do Preset *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Vinheta rápida 2s, Filtro Vintage"
                  value={novoPresetNome}
                  onChange={(e) => setNovoPresetNome(e.target.value)}
                  className="w-full h-10 px-3 border border-[#1F3D2B]/20 rounded-xl bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F3D2B] mb-1">
                  Descrição (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Aumenta saturação e contraste para vídeos externos"
                  value={novoPresetDescricao}
                  onChange={(e) => setNovoPresetDescricao(e.target.value)}
                  className="w-full h-10 px-3 border border-[#1F3D2B]/20 rounded-xl bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#1F3D2B] mb-1">
                  Comando FFmpeg Completo *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder='ffmpeg -i entrada.mp4 -vf "..." -c:a copy saida.mp4'
                  value={novoPresetComando}
                  onChange={(e) => setNovoPresetComando(e.target.value)}
                  className="w-full p-3 border border-[#1F3D2B]/20 rounded-xl bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMostrarFormNovoPreset(false)}
                className="h-10 px-4 rounded-xl border border-[#1F3D2B]/20 bg-white text-xs font-semibold text-[#1F3D2B] hover:bg-[#EEF3EE]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSavingPreset}
                className="h-10 px-5 rounded-xl bg-[#C4704F] hover:bg-[#D98A6C] text-white text-xs font-semibold shadow-card disabled:opacity-50"
              >
                {isSavingPreset ? 'Salvando...' : 'Salvar no Banco'}
              </button>
            </div>
          </form>
        )}

        {/* Lista de Presets em Cards */}
        {isLoadingPresets ? (
          <div className="p-8 text-center text-xs font-semibold text-[#1F3D2B]/60">
            Carregando presets...
          </div>
        ) : presets.length === 0 ? (
          <div className="p-8 bg-[#FAF7F0] border border-[#1F3D2B]/15 rounded-2xl text-center">
            <p className="text-xs text-[#1F3D2B]/70">Nenhum preset cadastrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {presets.map((preset) => {
              const isCopied = copiedPresetId === preset.id
              return (
                <div
                  key={preset.id}
                  className="border border-[#1F3D2B]/15 bg-[#FAF7F0] rounded-2xl p-5 shadow-card hover:shadow-soft transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-serif font-bold text-sm text-[#142419] leading-snug">
                        {preset.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleExcluirPreset(preset.id, preset.name)}
                        className="text-[#1F3D2B]/40 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                        title="Excluir preset"
                        aria-label="Excluir preset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {preset.description && (
                      <p className="text-xs text-[#1F3D2B]/75 mb-3 leading-relaxed">
                        {preset.description}
                      </p>
                    )}

                    <div className="bg-[#142419] text-[#FAF7F0] p-3 rounded-xl border border-[#1F3D2B]/20 font-mono text-[11px] overflow-x-auto mb-4 select-all">
                      <code>{preset.command}</code>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      copyToClipboard(preset.command, () => {
                        setCopiedPresetId(preset.id)
                        setTimeout(() => setCopiedPresetId(null), 1500)
                      })
                    }}
                    className={`w-full h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                      isCopied
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-white hover:bg-[#EEF3EE] text-[#1F3D2B] border-[#1F3D2B]/20 shadow-sm'
                    }`}
                  >
                    {isCopied ? (
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
              )
            })}
          </div>
        )}
      </div>

      {/* 3. SEÇÃO: MAIS COMANDOS DO GUIA DE GRAVAÇÃO (Áudio loudnorm, Legenda .srt, Thumbnail) */}
      <section ref={guiaRef} className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-6 h-6 rounded-lg bg-[#1F3D2B] text-white flex items-center justify-center font-serif font-bold text-xs">
            3
          </span>
          <h2 className="text-lg font-serif font-bold text-[#1F3D2B] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C4704F]" />
            <span>Comandos Especializados do Guia</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card A: Normalização de áudio (loudnorm) */}
          <div className="border border-[#1F3D2B]/15 bg-[#FAF7F0] rounded-2xl p-5 shadow-card hover:shadow-soft transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#C4704F]" />
                  <h3 className="font-serif font-bold text-sm text-[#142419]">
                    Normalização de Áudio (loudnorm)
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-[#EEF3EE] rounded-md text-[#1F3D2B] border border-[#1F3D2B]/10">
                  -16 LUFS
                </span>
              </div>
              <p className="text-xs text-[#1F3D2B]/75 mb-3 leading-relaxed">
                Padroniza o volume da voz para -16 LUFS (padrão ideal para Instagram Reels e YouTube
                Shorts), evitando áudio baixo ou estourado.
              </p>
              <div className="bg-[#142419] text-[#FAF7F0] p-3 rounded-xl border border-[#1F3D2B]/20 font-mono text-[11px] overflow-x-auto mb-4 select-all">
                <code>{ffmpegLoudnormCmd}</code>
              </div>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(ffmpegLoudnormCmd, setCopiadoLoudnorm)}
              className={`w-full h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                copiadoLoudnorm
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white hover:bg-[#EEF3EE] text-[#1F3D2B] border-[#1F3D2B]/20 shadow-sm'
              }`}
            >
              {copiadoLoudnorm ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#C4704F]" />
                  <span>Copiar loudnorm</span>
                </>
              )}
            </button>
          </div>

          {/* Card B: Legendas automáticas .srt com force_style Reels */}
          <div className="border border-[#1F3D2B]/15 bg-[#FAF7F0] rounded-2xl p-5 shadow-card hover:shadow-soft transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Subtitles className="w-4 h-4 text-[#C4704F]" />
                  <h3 className="font-serif font-bold text-sm text-[#142419]">
                    Burn-in de Legendas (.srt)
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-[#EEF3EE] rounded-md text-[#1F3D2B] border border-[#1F3D2B]/10">
                  force_style
                </span>
              </div>
              <p className="text-xs text-[#1F3D2B]/75 mb-3 leading-relaxed">
                Aplica a legenda do arquivo <code>legenda.srt</code> gravada diretamente no vídeo
                com borda preta espessa e margem vertical segura para Reels (não corta nos botões).
              </p>
              <div className="bg-[#142419] text-[#FAF7F0] p-3 rounded-xl border border-[#1F3D2B]/20 font-mono text-[11px] overflow-x-auto mb-4 select-all">
                <code>{ffmpegSrtCmd}</code>
              </div>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(ffmpegSrtCmd, setCopiadoSrt)}
              className={`w-full h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                copiadoSrt
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white hover:bg-[#EEF3EE] text-[#1F3D2B] border-[#1F3D2B]/20 shadow-sm'
              }`}
            >
              {copiadoSrt ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#C4704F]" />
                  <span>Copiar legenda .srt</span>
                </>
              )}
            </button>
          </div>

          {/* Card C: Extração de thumbnail em alta qualidade */}
          <div className="border border-[#1F3D2B]/15 bg-[#FAF7F0] rounded-2xl p-5 shadow-card hover:shadow-soft transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#C4704F]" />
                  <h3 className="font-serif font-bold text-sm text-[#142419]">
                    Thumbnail em Alta Qualidade
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-[#EEF3EE] rounded-md text-[#1F3D2B] border border-[#1F3D2B]/10">
                  -q:v 2 JPEG
                </span>
              </div>
              <p className="text-xs text-[#1F3D2B]/75 mb-3 leading-relaxed">
                Extrai exatamente 1 frame nítido aos 5 segundos de vídeo (<code>-ss 00:00:05</code>)
                em resolução total para a capa do tutorial ou capa do Instagram.
              </p>
              <div className="bg-[#142419] text-[#FAF7F0] p-3 rounded-xl border border-[#1F3D2B]/20 font-mono text-[11px] overflow-x-auto mb-4 select-all">
                <code>{ffmpegThumbCmd}</code>
              </div>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(ffmpegThumbCmd, setCopiadoThumb)}
              className={`w-full h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                copiadoThumb
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white hover:bg-[#EEF3EE] text-[#1F3D2B] border-[#1F3D2B]/20 shadow-sm'
              }`}
            >
              {copiadoThumb ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#C4704F]" />
                  <span>Copiar extração de thumb</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 4. SEÇÃO: CONVERSÃO PARA REELS */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-lg bg-[#1F3D2B] text-white flex items-center justify-center font-serif font-bold text-xs">
            4
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

      {/* 5. NOTA DE SEGURANÇA OPERACIONAL */}
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
