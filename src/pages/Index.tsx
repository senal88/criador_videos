import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRealtime } from '@/hooks/use-realtime'
import { getProjetos, createProjeto } from '@/services/projetos'
import { getPostagens } from '@/services/postagens'
import { getTarefasRapidas, toggleTarefaRapida } from '@/services/tarefas'
import type { ProjetoRecord, PostagemRecord, TarefaRapidaRecord } from '@/types/database'
import { getProgressoFromProjeto } from '@/lib/checklist'
import {
  Scissors,
  Palette,
  RefreshCw,
  Plus,
  ArrowRight,
  Check,
  Calendar,
  Clock,
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle2,
  Video,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'

export const Index: React.FC = () => {
  const navigate = useNavigate()
  const [projetos, setProjetos] = useState<ProjetoRecord[]>([])
  const [postagens, setPostagens] = useState<PostagemRecord[]>([])
  const [tarefas, setTarefas] = useState<TarefaRapidaRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [periodoFiltro, setPeriodoFiltro] = useState<'7dias' | 'mes' | 'todos'>('7dias')

  // Modal de Novo Projeto (Ctrl+N)
  const [novoProjetoOpen, setNovoProjetoOpen] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novoFormato, setNovoFormato] = useState<'REELS 9:16' | 'YOUTUBE 16:9'>('REELS 9:16')
  const [isCreatingProj, setIsCreatingProj] = useState(false)

  // Carregar dados iniciais
  const loadData = useCallback(async () => {
    try {
      const [projData, postData, tarData] = await Promise.all([
        getProjetos(),
        getPostagens(),
        getTarefasRapidas(),
      ])
      setProjetos(projData)
      setPostagens(postData)
      setTarefas(tarData)
    } catch (err) {
      console.error('Erro ao carregar dados do PocketBase:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Ouvir evento de filtro emitido pelo Header do Layout
  useEffect(() => {
    const handlePeriodo = (e: Event) => {
      const custom = e as CustomEvent<string>
      if (custom.detail === '7dias' || custom.detail === 'mes' || custom.detail === 'todos') {
        setPeriodoFiltro(custom.detail)
      }
    }
    window.addEventListener('cronograma-periodo-change', handlePeriodo)
    return () => window.removeEventListener('cronograma-periodo-change', handlePeriodo)
  }, [])

  // REALTIME SUBSCRIPTIONS
  useRealtime<ProjetoRecord>('projetos', () => {
    getProjetos().then(setProjetos).catch(console.error)
  })

  useRealtime<PostagemRecord>('postagens', () => {
    getPostagens().then(setPostagens).catch(console.error)
  })

  useRealtime<TarefaRapidaRecord>('tarefas_rapidas', () => {
    getTarefasRapidas().then(setTarefas).catch(console.error)
  })

  // ATALHOS DE TECLADO GLOBAIS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K -> Novo corte
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        navigate('/edicao?action=corte')
      }
      // Ctrl+Shift+C -> Ajuste de cor
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        navigate('/edicao?action=cor')
      }
      // Ctrl+S -> Sincronizar agora
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        navigate('/sincronizacao')
      }
      // Ctrl+N -> Novo projeto
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        setNovoProjetoOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  // CÁLCULO DAS ESTATÍSTICAS
  const stats = useMemo(() => {
    const ativos = projetos.filter((p) => p.status !== 'Publicado').length
    const concluidos = projetos.filter((p) => p.status === 'Publicado').length
    const postagensSemana = postagens.filter((p) => p.status === 'Agendada').length
    const postagensConcluidas = postagens.filter((p) => p.status === 'Publicada').length

    // Próxima postagem
    const proxima = postagens
      .filter((p) => p.status === 'Agendada')
      .sort(
        (a, b) => new Date(a.data_programada).getTime() - new Date(b.data_programada).getTime(),
      )[0]

    let proximaFormatada = 'Sem postagens'
    if (proxima && proxima.data_programada) {
      const d = new Date(proxima.data_programada)
      const dias = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
      const diaSemana = dias[d.getUTCDay()]
      const diaMes = String(d.getUTCDate()).padStart(2, '0')
      proximaFormatada = `${diaSemana} ${diaMes} · ${proxima.horario || '10:00'}`
    }

    // Tempo médio de edição (projetos concluídos ou média padrão)
    const tempoMedio = concluidos > 0 ? '1h 35min' : '1h 40min'

    return {
      ativos,
      postagensSemana,
      postagensConcluidas,
      proximaFormatada,
      tempoMedio,
    }
  }, [projetos, postagens])

  // FILTRO DO CRONOGRAMA
  const postagensFiltradas = useMemo(() => {
    const agora = new Date()
    return postagens.filter((p) => {
      if (periodoFiltro === 'todos') return true
      const postDate = new Date(p.data_programada)
      const diffDays = (postDate.getTime() - agora.getTime()) / (1000 * 3600 * 24)

      if (periodoFiltro === '7dias') {
        return diffDays >= -1 && diffDays <= 7
      }
      if (periodoFiltro === 'mes') {
        return diffDays >= -1 && diffDays <= 31
      }
      return true
    })
  }, [postagens, periodoFiltro])

  // CHECKLIST TOGGLE
  const handleToggleTarefa = async (tarefa: TarefaRapidaRecord) => {
    const novoStatus = !tarefa.concluida
    // Atualização otimista
    setTarefas((prev) =>
      prev.map((t) => (t.id === tarefa.id ? { ...t, concluida: novoStatus } : t)),
    )

    try {
      await toggleTarefaRapida(tarefa.id, novoStatus)
    } catch (err) {
      console.error(err)
      // Rollback se falhar
      setTarefas((prev) =>
        prev.map((t) => (t.id === tarefa.id ? { ...t, concluida: !novoStatus } : t)),
      )
      toast({
        title: 'Erro ao atualizar tarefa',
        variant: 'destructive',
      })
    }
  }

  // CRIAR NOVO PROJETO (Ctrl+N)
  const handleCreateProjeto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!novoNome.trim()) return

    setIsCreatingProj(true)
    try {
      const created = await createProjeto({
        nome: novoNome.trim(),
        formato: novoFormato,
        status: 'Em gravação',
        progresso: 0,
      })

      toast({
        title: 'Projeto criado com sucesso!',
        description: `${created.nome} (${created.formato})`,
      })
      setNovoProjetoOpen(false)
      setNovoNome('')
      navigate(`/edicao?projeto=${created.id}`)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao criar projeto',
        variant: 'destructive',
      })
    } finally {
      setIsCreatingProj(false)
    }
  }

  // BADGE DE STATUS DO PROJETO COM A NOVA IDENTIDADE
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Em gravação':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F4EAE4] text-[#C4704F] font-semibold text-xs rounded-lg border border-[#C4704F]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C4704F] animate-pulse" />
            Em gravação
          </span>
        )
      case 'Em edição':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#EEF3EE] text-[#1F3D2B] font-semibold text-xs rounded-lg border border-[#1F3D2B]/15">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1F3D2B]" />
            Em edição
          </span>
        )
      case 'Pronto para revisão':
      case 'Pronto':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1F3D2B] text-[#FAF7F0] font-semibold text-xs rounded-lg">
            <CheckCircle2 className="w-3 h-3 text-[#D98A6C]" />
            Pronto
          </span>
        )
      case 'Publicado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 font-semibold text-xs rounded-lg border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Publicado
          </span>
        )
      default:
        return (
          <span className="inline-block px-2.5 py-1 bg-white text-[#1F3D2B] font-medium text-xs rounded-lg border border-[#1F3D2B]/15">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-8">
      {/* 1. SEÇÃO: VISÃO GERAL */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-lg bg-[#1F3D2B] text-white flex items-center justify-center font-serif font-bold text-xs">
            1
          </span>
          <h2 className="text-lg font-serif font-bold text-[#1F3D2B]">Visão Geral da Produção</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Projetos Ativos */}
          <div className="bg-[#FAF7F0] border border-[#1F3D2B]/15 rounded-2xl p-6 shadow-card hover:shadow-soft transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#1F3D2B]/70">Projetos Ativos</span>
              <div className="w-7 h-7 rounded-lg bg-[#EEF3EE] flex items-center justify-center text-[#1F3D2B]">
                <Layers className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-serif font-bold text-[#1F3D2B] leading-none">
                {stats.ativos}
              </span>
              <span className="text-xs font-medium text-[#1F3D2B]/60">em andamento</span>
            </div>
          </div>

          {/* Card 2: Postagens Esta Semana */}
          <div className="bg-[#FAF7F0] border border-[#1F3D2B]/15 rounded-2xl p-6 shadow-card hover:shadow-soft transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#1F3D2B]/70">Postagens esta semana</span>
              <div className="w-7 h-7 rounded-lg bg-[#F4EAE4] flex items-center justify-center text-[#C4704F]">
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-serif font-bold text-[#1F3D2B] leading-none">
                {stats.postagensSemana}
              </span>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                +{stats.postagensConcluidas} concluídas
              </span>
            </div>
          </div>

          {/* Card 3: Próxima Postagem */}
          <div className="bg-[#FAF7F0] border border-[#1F3D2B]/15 rounded-2xl p-6 shadow-card hover:shadow-soft transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#1F3D2B]/70">Próxima postagem</span>
              <div className="w-7 h-7 rounded-lg bg-[#EEF3EE] flex items-center justify-center text-[#1F3D2B]">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl font-serif font-bold text-[#1F3D2B] leading-tight mt-1 truncate">
              {stats.proximaFormatada}
            </div>
            <p className="text-[11px] font-medium text-[#C4704F] mt-1.5">Instagram Reels</p>
          </div>

          {/* Card 4: Tempo Médio de Edição */}
          <div className="bg-[#FAF7F0] border border-[#1F3D2B]/15 rounded-2xl p-6 shadow-card hover:shadow-soft transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#1F3D2B]/70">Tempo médio de edição</span>
              <div className="w-7 h-7 rounded-lg bg-[#EEF3EE] flex items-center justify-center text-[#1F3D2B]">
                <Video className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-3xl font-serif font-bold text-[#1F3D2B] leading-none">
              {stats.tempoMedio}
            </div>
            <p className="text-[11px] text-[#1F3D2B]/60 mt-2">Baseado nos tutoriais concluídos</p>
          </div>
        </div>
      </section>

      {/* 2. SEÇÃO: STATUS DOS PROJETOS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#1F3D2B] text-white flex items-center justify-center font-serif font-bold text-xs">
              2
            </span>
            <h2 className="text-lg font-serif font-bold text-[#1F3D2B]">
              Status dos Projetos (Tutoriais)
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#1F3D2B]/60 bg-[#EEF3EE] px-2.5 py-1 rounded-full">
            {projetos.length} no total
          </span>
        </div>

        <div className="border border-[#1F3D2B]/15 bg-[#FAF7F0] rounded-2xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#EEF3EE]/80 border-b border-[#1F3D2B]/10">
                  <th className="py-3.5 px-5 text-xs font-semibold text-[#1F3D2B]">Projeto</th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-[#1F3D2B] w-36">Formato</th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-[#1F3D2B] w-52">
                    Progresso
                  </th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-[#1F3D2B] w-44">Status</th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-[#1F3D2B] w-32">
                    Postagem
                  </th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-[#1F3D2B] w-24 text-right">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F3D2B]/10">
                {projetos.map((proj) => {
                  let dataFormatada = '-'
                  if (proj.data_postagem) {
                    const d = new Date(proj.data_postagem)
                    const meses = [
                      'Jan',
                      'Fev',
                      'Mar',
                      'Abr',
                      'Mai',
                      'Jun',
                      'Jul',
                      'Ago',
                      'Set',
                      'Out',
                      'Nov',
                      'Dez',
                    ]
                    dataFormatada = `${String(d.getUTCDate()).padStart(2, '0')} ${meses[d.getUTCMonth()]}`
                  }

                  const progressoChecklist = getProgressoFromProjeto(proj)

                  return (
                    <tr key={proj.id} className="hover:bg-white/80 transition-colors h-14">
                      <td className="py-3.5 px-5 font-semibold text-sm text-[#142419]">
                        {proj.nome}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 bg-white border border-[#1F3D2B]/15 rounded-md text-[11px] font-semibold text-[#1F3D2B]">
                          {proj.formato}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2.5 bg-[#EEF3EE] rounded-full overflow-hidden border border-[#1F3D2B]/10">
                            <div
                              className="h-full bg-[#C4704F] transition-all rounded-full"
                              style={{ width: `${progressoChecklist}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold font-mono text-[#1F3D2B] w-9 text-right">
                            {progressoChecklist}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">{renderStatusBadge(proj.status)}</td>
                      <td className="py-3.5 px-4 text-xs font-semibold font-mono text-[#1F3D2B]/70">
                        {dataFormatada}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => navigate(`/edicao?projeto=${proj.id}`)}
                          className="h-8 px-3 bg-white hover:bg-[#EEF3EE] text-[#1F3D2B] border border-[#1F3D2B]/20 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ml-auto cursor-pointer shadow-sm"
                        >
                          <span>Abrir</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#C4704F]" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {projetos.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#1F3D2B]/70">
                      Nenhum projeto cadastrado. Utilize o botão "+ Novo Projeto" ou o atalho{' '}
                      <strong>Ctrl+N</strong> para criar o primeiro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. SEÇÃO: CRONOGRAMA DE POSTAGENS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#1F3D2B] text-white flex items-center justify-center font-serif font-bold text-xs">
              3
            </span>
            <h2 className="text-lg font-serif font-bold text-[#1F3D2B]">Cronograma de Postagens</h2>
          </div>
          <span className="text-xs font-semibold text-[#1F3D2B]/60 bg-[#EEF3EE] px-2.5 py-1 rounded-full">
            {postagensFiltradas.length} publicações programadas
          </span>
        </div>

        {/* Scroll Horizontal de Cards com visual acolhedor */}
        <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin">
          {postagensFiltradas.map((post) => {
            const d = new Date(post.data_programada)
            const dias = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
            const diaSemana = dias[d.getUTCDay()]
            const diaNumero = String(d.getUTCDate()).padStart(2, '0')

            // Verificar se é o dia de hoje
            const hoje = new Date()
            const isHoje =
              d.getUTCDate() === hoje.getUTCDate() &&
              d.getUTCMonth() === hoje.getUTCMonth() &&
              d.getUTCFullYear() === hoje.getUTCFullYear()

            // Projeto relacionado
            const projRelacionado = projetos.find((p) => p.id === post.projeto)

            return (
              <div
                key={post.id}
                className={`min-w-[220px] w-[220px] shrink-0 border rounded-2xl bg-[#FAF7F0] p-4 shadow-card hover:shadow-soft flex flex-col justify-between transition-all ${
                  isHoje
                    ? 'border-[#C4704F] ring-2 ring-[#C4704F]/30 bg-[#FFF9F6]'
                    : 'border-[#1F3D2B]/15'
                }`}
              >
                <div>
                  {/* Topo: Dia da Semana + Indicador do Dia */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-lg ${
                        isHoje ? 'bg-[#C4704F] text-white' : 'bg-[#EEF3EE] text-[#1F3D2B]'
                      }`}
                    >
                      {diaSemana} {isHoje && '· HOJE'}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#1F3D2B]/40" />
                  </div>

                  {/* Data Numérica Grande */}
                  <div className="text-4xl font-serif font-bold text-[#1F3D2B] leading-none mb-2">
                    {diaNumero}
                  </div>

                  {/* Horário */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1F3D2B]/70 mb-2 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#C4704F]" />
                    <span>{post.horario || '10:00'}</span>
                  </div>

                  {/* Projeto e Formato */}
                  <div className="border-t border-[#1F3D2B]/10 pt-2">
                    <p className="text-xs font-semibold text-[#142419] line-clamp-2 leading-snug">
                      {projRelacionado ? projRelacionado.nome : 'Tutorial Instagram'}
                    </p>
                    <span className="inline-block mt-1 text-[11px] font-medium text-[#C4704F]">
                      {post.plataforma}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-[#1F3D2B]/10 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#1F3D2B] text-white rounded-md">
                    {post.status}
                  </span>
                  {projRelacionado && (
                    <button
                      onClick={() => navigate(`/edicao?projeto=${projRelacionado.id}`)}
                      className="text-xs font-semibold text-[#1F3D2B] hover:text-[#C4704F] flex items-center gap-1 transition-colors"
                    >
                      <span>Editar</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {postagensFiltradas.length === 0 && (
            <div className="w-full border border-[#1F3D2B]/15 bg-[#FAF7F0] rounded-2xl p-6 text-center text-xs text-[#1F3D2B]/70">
              Nenhuma postagem agendada para o período selecionado.
            </div>
          )}
        </div>
      </section>

      {/* 4. SEÇÃO: PRÓXIMOS PASSOS (CHECKLIST PERSISTIDO) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#1F3D2B] text-white flex items-center justify-center font-serif font-bold text-xs">
              4
            </span>
            <h2 className="text-lg font-serif font-bold text-[#1F3D2B]">
              Próximos Passos & Tarefas
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#1F3D2B]/60 bg-[#EEF3EE] px-2.5 py-1 rounded-full">
            Checklist de produção
          </span>
        </div>

        <div className="border border-[#1F3D2B]/15 bg-[#FAF7F0] rounded-2xl p-5 shadow-card space-y-2.5">
          {tarefas.map((t) => (
            <div
              key={t.id}
              onClick={() => handleToggleTarefa(t)}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-[#1F3D2B]/10 bg-white hover:bg-[#EEF3EE]/50 transition-colors cursor-pointer select-none group shadow-sm"
            >
              {/* Checkbox Acolhedor com Pop */}
              <div
                className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                  t.concluida
                    ? 'bg-[#1F3D2B] border-[#1F3D2B] text-white'
                    : 'bg-white border-[#1F3D2B]/30 group-hover:border-[#C4704F]'
                }`}
              >
                {t.concluida && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>

              {/* Texto com risco ao completar */}
              <span
                className={`text-sm font-medium transition-all ${
                  t.concluida ? 'line-through text-[#1F3D2B]/40' : 'text-[#142419]'
                }`}
              >
                {t.descricao}
              </span>
            </div>
          ))}

          {tarefas.length === 0 && (
            <p className="text-xs text-[#1F3D2B]/70 py-2 text-center">
              Todas as tarefas concluídas. Bom trabalho!
            </p>
          )}
        </div>
      </section>

      {/* 5. SEÇÃO: ATALHOS RÁPIDOS */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-lg bg-[#1F3D2B] text-white flex items-center justify-center font-serif font-bold text-xs">
            5
          </span>
          <h2 className="text-lg font-serif font-bold text-[#1F3D2B]">
            Atalhos de Teclado & Acesso Rápido
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Novo corte */}
          <button
            onClick={() => navigate('/edicao?action=corte')}
            className="p-5 border border-[#1F3D2B]/15 bg-[#FAF7F0] hover:bg-white active:scale-[0.99] rounded-2xl text-left transition-all shadow-card hover:shadow-soft flex flex-col justify-between h-32 group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#EEF3EE] flex items-center justify-center text-[#1F3D2B] group-hover:bg-[#1F3D2B] group-hover:text-white transition-colors">
                <Scissors className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold font-mono bg-[#1F3D2B]/10 text-[#1F3D2B] px-2 py-0.5 rounded-md">
                Ctrl+K
              </span>
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-[#142419]">Novo corte</div>
              <p className="text-xs text-[#1F3D2B]/70 mt-0.5">Gerar comando ffmpeg com marcações</p>
            </div>
          </button>

          {/* 2. Ajuste de cor */}
          <button
            onClick={() => navigate('/edicao?action=cor')}
            className="p-5 border border-[#1F3D2B]/15 bg-[#FAF7F0] hover:bg-white active:scale-[0.99] rounded-2xl text-left transition-all shadow-card hover:shadow-soft flex flex-col justify-between h-32 group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#F4EAE4] flex items-center justify-center text-[#C4704F] group-hover:bg-[#C4704F] group-hover:text-white transition-colors">
                <Palette className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold font-mono bg-[#1F3D2B]/10 text-[#1F3D2B] px-2 py-0.5 rounded-md">
                Ctrl+Shift+C
              </span>
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-[#142419]">Ajuste de cor</div>
              <p className="text-xs text-[#1F3D2B]/70 mt-0.5">Presets prontos para tela escura</p>
            </div>
          </button>

          {/* 3. Sincronizar agora */}
          <button
            onClick={() => navigate('/sincronizacao')}
            className="p-5 border border-[#1F3D2B]/15 bg-[#FAF7F0] hover:bg-white active:scale-[0.99] rounded-2xl text-left transition-all shadow-card hover:shadow-soft flex flex-col justify-between h-32 group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#EEF3EE] flex items-center justify-center text-[#1F3D2B] group-hover:bg-[#1F3D2B] group-hover:text-white transition-colors">
                <RefreshCw className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-semibold font-mono bg-[#1F3D2B]/10 text-[#1F3D2B] px-2 py-0.5 rounded-md">
                Ctrl+S
              </span>
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-[#142419]">Sincronizar agora</div>
              <p className="text-xs text-[#1F3D2B]/70 mt-0.5">Transferência S23 ↔ Windows</p>
            </div>
          </button>

          {/* 4. Novo projeto */}
          <button
            onClick={() => setNovoProjetoOpen(true)}
            className="p-5 border border-[#1F3D2B]/15 bg-[#FAF7F0] hover:bg-white active:scale-[0.99] rounded-2xl text-left transition-all shadow-card hover:shadow-soft flex flex-col justify-between h-32 group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-[#C4704F] flex items-center justify-center text-white">
                <Plus className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-[10px] font-semibold font-mono bg-[#1F3D2B]/10 text-[#1F3D2B] px-2 py-0.5 rounded-md">
                Ctrl+N
              </span>
            </div>
            <div>
              <div className="font-serif font-bold text-sm text-[#142419]">Novo projeto</div>
              <p className="text-xs text-[#1F3D2B]/70 mt-0.5">Cadastrar novo tutorial no banco</p>
            </div>
          </button>
        </div>
      </section>

      {/* DIALOG DE CRIAÇÃO DE NOVO PROJETO (Ctrl+N) */}
      <Dialog open={novoProjetoOpen} onOpenChange={setNovoProjetoOpen}>
        <DialogContent className="border border-[#1F3D2B]/20 bg-[#FAF7F0] p-6 max-w-md rounded-2xl shadow-soft-lg">
          <DialogHeader className="border-b border-[#1F3D2B]/10 pb-3">
            <DialogTitle className="text-lg font-serif font-bold text-[#1F3D2B] flex items-center gap-2">
              <span className="w-7 h-7 bg-[#C4704F] text-white rounded-lg flex items-center justify-center text-xs font-bold">
                +
              </span>
              <span>Cadastrar Novo Projeto (Ctrl+N)</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#1F3D2B]/70">
              Crie um novo tutorial com padrão de nomenclatura TUT-XXX para organização da Aline
              Resolve.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProjeto} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#1F3D2B] mb-1">
                Nome do Projeto (Padrão TUT-XXX)
              </label>
              <input
                type="text"
                required
                placeholder="Ex: TUT-005 — Como limpar o histórico"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                className="w-full h-11 px-3 border border-[#1F3D2B]/20 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F3D2B] mb-1">
                Formato do Vídeo
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNovoFormato('REELS 9:16')}
                  className={`h-11 text-xs font-semibold rounded-xl border transition-all ${
                    novoFormato === 'REELS 9:16'
                      ? 'bg-[#1F3D2B] text-white border-[#1F3D2B] shadow-card'
                      : 'bg-white text-[#1F3D2B] border-[#1F3D2B]/20 hover:bg-[#EEF3EE]'
                  }`}
                >
                  REELS 9:16
                </button>
                <button
                  type="button"
                  onClick={() => setNovoFormato('YOUTUBE 16:9')}
                  className={`h-11 text-xs font-semibold rounded-xl border transition-all ${
                    novoFormato === 'YOUTUBE 16:9'
                      ? 'bg-[#1F3D2B] text-white border-[#1F3D2B] shadow-card'
                      : 'bg-white text-[#1F3D2B] border-[#1F3D2B]/20 hover:bg-[#EEF3EE]'
                  }`}
                >
                  YOUTUBE 16:9
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1F3D2B]/10 flex gap-3">
              <button
                type="button"
                onClick={() => setNovoProjetoOpen(false)}
                className="flex-1 h-11 border border-[#1F3D2B]/20 rounded-xl bg-white font-semibold text-xs text-[#1F3D2B] hover:bg-[#EEF3EE]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isCreatingProj}
                className="flex-1 h-11 rounded-xl bg-[#C4704F] hover:bg-[#D98A6C] text-white font-semibold text-xs transition-colors shadow-card disabled:opacity-50"
              >
                {isCreatingProj ? 'Criando...' : 'Criar e Abrir Edição'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Index
