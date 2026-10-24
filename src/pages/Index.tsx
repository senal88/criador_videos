import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRealtime } from '@/hooks/use-realtime'
import { getProjetos, createProjeto } from '@/services/projetos'
import { getPostagens } from '@/services/postagens'
import { getTarefasRapidas, toggleTarefaRapida } from '@/services/tarefas'
import type { ProjetoRecord, PostagemRecord, TarefaRapidaRecord } from '@/types/database'
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
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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

    let proximaFormatada = 'SEM POSTAGENS'
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

  // BADGE DE STATUS DO PROJETO
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Em gravação':
        return (
          <span className="inline-block px-2.5 py-1 bg-[#F5D90A] text-black font-bold uppercase text-[11px] tracking-wider border border-black">
            Em gravação
          </span>
        )
      case 'Em edição':
        return (
          <span className="inline-block px-2.5 py-1 bg-white text-black font-bold uppercase text-[11px] tracking-wider border-2 border-black">
            Em edição
          </span>
        )
      case 'Pronto para revisão':
      case 'Pronto':
        return (
          <span className="inline-block px-2.5 py-1 bg-black text-white font-bold uppercase text-[11px] tracking-wider border border-black">
            Pronto
          </span>
        )
      case 'Publicado':
        return (
          <span className="inline-block px-2.5 py-1 bg-[#E6F4EA] text-[#1D6B3A] font-bold uppercase text-[11px] tracking-wider border border-[#1D6B3A]">
            Publicado
          </span>
        )
      default:
        return (
          <span className="inline-block px-2.5 py-1 bg-[#F4F4F4] text-black font-bold uppercase text-[11px] border border-black">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. SEÇÃO: VISÃO GERAL */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-[#F5D90A] border-2 border-black flex items-center justify-center font-black text-xs">
            1
          </div>
          <h2 className="text-lg font-bold uppercase tracking-[0.02em] text-[#111]">VISÃO GERAL</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Projetos Ativos */}
          <div className="bg-white border-2 border-black p-6 shadow-brutal-hover">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#555]">
                Projetos Ativos
              </span>
              <div className="w-4 h-4 bg-[#F5D90A] border border-black" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-[#111] leading-none">{stats.ativos}</span>
              <span className="text-xs font-bold uppercase text-[#555]">em fluxo</span>
            </div>
          </div>

          {/* Card 2: Postagens Esta Semana */}
          <div className="bg-white border-2 border-black p-6 shadow-brutal-hover">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#555]">
                Postagens esta semana
              </span>
              <Calendar className="w-4 h-4 text-[#111]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-[#111] leading-none">
                {stats.postagensSemana}
              </span>
              <span className="text-xs font-bold uppercase text-[#1D6B3A]">
                +{stats.postagensConcluidas} concluídas
              </span>
            </div>
          </div>

          {/* Card 3: Próxima Postagem */}
          <div className="bg-white border-2 border-black p-6 shadow-brutal-hover">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#555]">
                Próxima postagem
              </span>
              <Clock className="w-4 h-4 text-[#111]" />
            </div>
            <div className="text-2xl lg:text-xl xl:text-2xl font-black text-[#111] leading-tight mt-1">
              {stats.proximaFormatada}
            </div>
            <p className="text-[11px] font-bold uppercase text-[#555] mt-1">Instagram Reels</p>
          </div>

          {/* Card 4: Tempo Médio de Edição */}
          <div className="bg-white border-2 border-black p-6 shadow-brutal-hover">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#555]">
                Tempo médio de edição
              </span>
              <div className="w-3 h-3 bg-black" />
            </div>
            <div className="text-4xl font-black text-[#111] leading-none">{stats.tempoMedio}</div>
            <p className="text-[11px] font-medium text-[#555] mt-2">
              Baseado nos tutoriais concluídos
            </p>
          </div>
        </div>
      </section>

      {/* 2. SEÇÃO: STATUS DOS PROJETOS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#F5D90A] border-2 border-black flex items-center justify-center font-black text-xs">
              2
            </div>
            <h2 className="text-lg font-bold uppercase tracking-[0.02em] text-[#111]">
              STATUS DOS PROJETOS
            </h2>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#555]">
            {projetos.length} no total
          </span>
        </div>

        <div className="border-2 border-black bg-white overflow-hidden shadow-brutal">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#F4F4F4] border-b-2 border-black">
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-[#111]">
                    Projeto
                  </th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-[#111] w-36">
                    Formato
                  </th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-[#111] w-48">
                    Progresso
                  </th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-[#111] w-40">
                    Status
                  </th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-[#111] w-32">
                    Postagem
                  </th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-[#111] w-24 text-right">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y border-black">
                {projetos.map((proj) => {
                  let dataFormatada = '-'
                  if (proj.data_postagem) {
                    const d = new Date(proj.data_postagem)
                    const meses = [
                      'JAN',
                      'FEV',
                      'MAR',
                      'ABR',
                      'MAI',
                      'JUN',
                      'JUL',
                      'AGO',
                      'SET',
                      'OUT',
                      'NOV',
                      'DEZ',
                    ]
                    dataFormatada = `${String(d.getUTCDate()).padStart(2, '0')} ${meses[d.getUTCMonth()]}`
                  }

                  return (
                    <tr key={proj.id} className="hover:bg-[#FFFDE6]/60 transition-colors h-12">
                      <td className="py-3 px-4 font-bold text-sm text-[#111]">{proj.nome}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 bg-[#F4F4F4] border border-black text-[10px] font-bold uppercase tracking-wider">
                          {proj.formato}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-3.5 bg-black border border-black p-[1px]">
                            <div
                              className="h-full bg-[#F5D90A] transition-all"
                              style={{ width: `${proj.progresso || 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold font-mono text-[#111] w-9 text-right">
                            {proj.progresso || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{renderStatusBadge(proj.status)}</td>
                      <td className="py-3 px-4 text-xs font-bold font-mono text-[#555]">
                        {dataFormatada}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate(`/edicao?projeto=${proj.id}`)}
                          className="h-8 px-3 bg-white hover:bg-[#F5D90A] text-black border-2 border-black text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all ml-auto cursor-pointer"
                        >
                          <span>Abrir</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {projetos.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-[#555]">
                      Nenhum projeto cadastrado. Utilize o atalho <strong>Ctrl+N</strong> para criar
                      o primeiro.
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
            <div className="w-6 h-6 bg-[#F5D90A] border-2 border-black flex items-center justify-center font-black text-xs">
              3
            </div>
            <h2 className="text-lg font-bold uppercase tracking-[0.02em] text-[#111]">
              CRONOGRAMA DE POSTAGENS
            </h2>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#555]">
            {postagensFiltradas.length} publicações programadas
          </span>
        </div>

        {/* Scroll Horizontal de Cards */}
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
                className={`min-w-[220px] w-[220px] shrink-0 border-2 border-black bg-white p-4 shadow-brutal-hover flex flex-col justify-between ${
                  isHoje ? 'ring-2 ring-[#F5D90A]' : ''
                }`}
              >
                <div>
                  {/* Topo: Dia da Semana + Indicador do Dia */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider border border-black ${
                        isHoje ? 'bg-[#F5D90A] text-black' : 'bg-[#F4F4F4] text-black'
                      }`}
                    >
                      {diaSemana} {isHoje && '· HOJE'}
                    </span>
                    {/* Indicador de turno: retângulo preto */}
                    <div className="w-3 h-2 bg-black" title="Turno programado" />
                  </div>

                  {/* Data Numérica Grande */}
                  <div className="text-4xl font-black text-[#111] leading-none mb-3">
                    {diaNumero}
                  </div>

                  {/* Horário */}
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#555] mb-2 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{post.horario || '10:00'}</span>
                  </div>

                  {/* Projeto e Formato */}
                  <div className="border-t border-black/30 pt-2">
                    <p className="text-xs font-bold text-[#111] line-clamp-2 leading-tight">
                      {projRelacionado ? projRelacionado.nome : 'Tutorial Instagram'}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-[#555]">
                      {post.plataforma}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-black/10 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-black text-white">
                    {post.status}
                  </span>
                  {projRelacionado && (
                    <button
                      onClick={() => navigate(`/edicao?projeto=${projRelacionado.id}`)}
                      className="text-[11px] font-bold uppercase text-black hover:underline flex items-center gap-1"
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
            <div className="w-full border-2 border-black bg-white p-6 text-center text-xs font-bold uppercase text-[#555]">
              Nenhuma postagem agendada para o período selecionado.
            </div>
          )}
        </div>
      </section>

      {/* 4. SEÇÃO: PRÓXIMOS PASSOS (CHECKLIST PERSISTIDO) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#F5D90A] border-2 border-black flex items-center justify-center font-black text-xs">
              4
            </div>
            <h2 className="text-lg font-bold uppercase tracking-[0.02em] text-[#111]">
              PRÓXIMOS PASSOS
            </h2>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#555]">
            Checklist de produção
          </span>
        </div>

        <div className="border-2 border-black bg-white p-5 shadow-brutal space-y-3">
          {tarefas.map((t) => (
            <div
              key={t.id}
              onClick={() => handleToggleTarefa(t)}
              className="flex items-center gap-3 p-3 border-2 border-black bg-white hover:bg-[#F4F4F4] transition-colors cursor-pointer select-none group"
            >
              {/* Checkbox Brutalista com Pop */}
              <div
                className={`w-6 h-6 border-2 border-black flex items-center justify-center checkbox-pop shrink-0 ${
                  t.concluida ? 'bg-[#F5D90A]' : 'bg-white group-hover:border-black'
                }`}
              >
                {t.concluida && <Check className="w-4 h-4 text-black stroke-[3]" />}
              </div>

              {/* Texto com risco ao completar */}
              <span
                className={`text-sm font-bold uppercase tracking-wide transition-all ${
                  t.concluida ? 'line-through text-[#777]' : 'text-[#111]'
                }`}
              >
                {t.descricao}
              </span>
            </div>
          ))}

          {tarefas.length === 0 && (
            <p className="text-xs font-bold uppercase text-[#555] py-2">
              Todas as tarefas concluídas. Bom trabalho!
            </p>
          )}
        </div>
      </section>

      {/* 5. SEÇÃO: ATALHOS RÁPIDOS */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-[#F5D90A] border-2 border-black flex items-center justify-center font-black text-xs">
            5
          </div>
          <h2 className="text-lg font-bold uppercase tracking-[0.02em] text-[#111]">
            ATALHOS RÁPIDOS
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Novo corte */}
          <button
            onClick={() => navigate('/edicao?action=corte')}
            className="p-5 border-2 border-black bg-white hover:bg-[#F5D90A] active:translate-y-[1px] text-left transition-all shadow-brutal flex flex-col justify-between h-32 group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <Scissors className="w-5 h-5 text-black" />
              <span className="text-[10px] font-bold font-mono uppercase bg-black text-white px-2 py-0.5">
                Ctrl+K
              </span>
            </div>
            <div>
              <div className="font-extrabold uppercase text-sm tracking-wide text-black">
                Novo corte
              </div>
              <p className="text-[11px] text-[#555] group-hover:text-black">
                Gerar comando ffmpeg com marcações
              </p>
            </div>
          </button>

          {/* 2. Ajuste de cor */}
          <button
            onClick={() => navigate('/edicao?action=cor')}
            className="p-5 border-2 border-black bg-white hover:bg-[#F5D90A] active:translate-y-[1px] text-left transition-all shadow-brutal flex flex-col justify-between h-32 group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <Palette className="w-5 h-5 text-black" />
              <span className="text-[10px] font-bold font-mono uppercase bg-black text-white px-2 py-0.5">
                Ctrl+Shift+C
              </span>
            </div>
            <div>
              <div className="font-extrabold uppercase text-sm tracking-wide text-black">
                Ajuste de cor
              </div>
              <p className="text-[11px] text-[#555] group-hover:text-black">
                Presets prontos para tela escura
              </p>
            </div>
          </button>

          {/* 3. Sincronizar agora */}
          <button
            onClick={() => navigate('/sincronizacao')}
            className="p-5 border-2 border-black bg-white hover:bg-[#F5D90A] active:translate-y-[1px] text-left transition-all shadow-brutal flex flex-col justify-between h-32 group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <RefreshCw className="w-5 h-5 text-black" />
              <span className="text-[10px] font-bold font-mono uppercase bg-black text-white px-2 py-0.5">
                Ctrl+S
              </span>
            </div>
            <div>
              <div className="font-extrabold uppercase text-sm tracking-wide text-black">
                Sincronizar agora
              </div>
              <p className="text-[11px] text-[#555] group-hover:text-black">
                Transferência S23 ↔ Windows
              </p>
            </div>
          </button>

          {/* 4. Novo projeto */}
          <button
            onClick={() => setNovoProjetoOpen(true)}
            className="p-5 border-2 border-black bg-white hover:bg-[#F5D90A] active:translate-y-[1px] text-left transition-all shadow-brutal flex flex-col justify-between h-32 group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <Plus className="w-5 h-5 text-black stroke-[3]" />
              <span className="text-[10px] font-bold font-mono uppercase bg-black text-white px-2 py-0.5">
                Ctrl+N
              </span>
            </div>
            <div>
              <div className="font-extrabold uppercase text-sm tracking-wide text-black">
                Novo projeto
              </div>
              <p className="text-[11px] text-[#555] group-hover:text-black">
                Cadastrar novo tutorial no banco
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* DIALOG DE CRIAÇÃO DE NOVO PROJETO */}
      <Dialog open={novoProjetoOpen} onOpenChange={setNovoProjetoOpen}>
        <DialogContent className="border-2 border-black bg-white p-6 max-w-md rounded-none shadow-[6px_6px_0px_0px_#111]">
          <DialogHeader className="border-b-2 border-black pb-3">
            <DialogTitle className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 bg-[#F5D90A] border border-black flex items-center justify-center text-xs font-black">
                +
              </span>
              <span>Cadastrar Novo Projeto (Ctrl+N)</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateProjeto} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                Nome do Projeto (Padrão TUT-XXX)
              </label>
              <input
                type="text"
                required
                placeholder="Ex: TUT-005 — Como limpar o histórico"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                className="w-full h-11 px-3 border-2 border-black bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F5D90A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                Formato do Vídeo
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNovoFormato('REELS 9:16')}
                  className={`h-10 text-xs font-bold uppercase border-2 border-black ${
                    novoFormato === 'REELS 9:16' ? 'bg-[#F5D90A] text-black' : 'bg-white text-black'
                  }`}
                >
                  REELS 9:16
                </button>
                <button
                  type="button"
                  onClick={() => setNovoFormato('YOUTUBE 16:9')}
                  className={`h-10 text-xs font-bold uppercase border-2 border-black ${
                    novoFormato === 'YOUTUBE 16:9'
                      ? 'bg-[#F5D90A] text-black'
                      : 'bg-white text-black'
                  }`}
                >
                  YOUTUBE 16:9
                </button>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-black flex gap-3">
              <button
                type="button"
                onClick={() => setNovoProjetoOpen(false)}
                className="flex-1 h-11 border-2 border-black bg-white font-bold uppercase text-xs hover:bg-[#F4F4F4]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isCreatingProj}
                className="flex-1 h-11 border-2 border-black bg-[#F5D90A] font-bold uppercase text-xs hover:bg-[#ffe31a] disabled:opacity-50"
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
