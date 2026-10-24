import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Search,
  Plus,
  Play,
  Pause,
  Star,
  Trash2,
  ExternalLink,
  Music,
  Video,
  Volume2,
  Film,
  Sparkles,
  Clock,
  Filter,
  ArrowUpDown,
  Tag,
  FolderOpen,
  CheckCircle2,
  Info,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import type { BibliotecaMidiaRecord, TipoMidia } from '@/types/database'
import { getMidias, createMidia, toggleFavoritoMidia, deleteMidia } from '@/services/biblioteca'
import pb from '@/lib/pocketbase/client'

export const Biblioteca: React.FC = () => {
  const [midias, setMidias] = useState<BibliotecaMidiaRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<TipoMidia | 'Todos'>('Todos')
  const [apenasFavoritos, setApenasFavoritos] = useState(false)
  const [ordenacao, setOrdenacao] = useState<'recentes' | 'antigos' | 'titulo'>('recentes')

  // Modal de cadastro
  const [modalOpen, setModalOpen] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [formTitulo, setFormTitulo] = useState('')
  const [formTipo, setFormTipo] = useState<TipoMidia>('Áudio')
  const [formCategoria, setFormCategoria] = useState('Trilha fundo')
  const [formDescricao, setFormDescricao] = useState('')
  const [formDuracao, setFormDuracao] = useState('')
  const [formUrl, setFormUrl] = useState('')
  const [formTags, setFormTags] = useState('')
  const [formFavorito, setFormFavorito] = useState(false)
  const [formArquivo, setFormArquivo] = useState<File | null>(null)

  // Modal de confirmação de exclusão
  const [itemParaExcluir, setItemParaExcluir] = useState<BibliotecaMidiaRecord | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  // Player de áudio embutido
  const [audioTocandoId, setAudioTocandoId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Carregar dados
  const carregarMidias = async () => {
    try {
      setLoading(true)
      const data = await getMidias({
        sort:
          ordenacao === 'recentes' ? '-created' : ordenacao === 'antigos' ? 'created' : 'titulo',
      })
      setMidias(data)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao carregar biblioteca',
        description: 'Não foi possível carregar os itens de mídia.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarMidias()
  }, [ordenacao])

  // Filtragem local instantânea por busca, tipo e favoritos
  const midiasFiltradas = useMemo(() => {
    return midias.filter((item) => {
      // Filtro tipo
      if (tipoFiltro !== 'Todos') {
        if (
          tipoFiltro === 'Áudio' &&
          item.tipo !== 'Áudio' &&
          item.tipo !== 'Música' &&
          item.tipo !== 'Efeito sonoro'
        ) {
          return false
        }
        if (tipoFiltro === 'Vídeo' && item.tipo !== 'Vídeo') {
          return false
        }
        if (tipoFiltro === 'Música' && item.tipo !== 'Música') {
          return false
        }
        if (tipoFiltro === 'Efeito sonoro' && item.tipo !== 'Efeito sonoro') {
          return false
        }
      }

      // Filtro favorito
      if (apenasFavoritos && !item.favorito) {
        return false
      }

      // Filtro busca (título, descrição, tags, categoria)
      if (busca.trim()) {
        const q = busca.toLowerCase().trim()
        const matchTitulo = item.titulo?.toLowerCase().includes(q)
        const matchDescricao = item.descricao?.toLowerCase().includes(q)
        const matchTags = item.tags?.toLowerCase().includes(q)
        const matchCategoria = item.categoria?.toLowerCase().includes(q)
        if (!matchTitulo && !matchDescricao && !matchTags && !matchCategoria) {
          return false
        }
      }

      return true
    })
  }, [midias, tipoFiltro, apenasFavoritos, busca])

  // Controlar player de áudio
  const handleTogglePlay = (item: BibliotecaMidiaRecord) => {
    const mediaUrl = item.arquivo ? pb.files.getURL(item, item.arquivo) : item.url
    if (!mediaUrl) {
      toast({
        title: 'Mídia sem áudio',
        description: 'Este item não possui URL ou arquivo anexado para reprodução.',
      })
      return
    }

    if (audioTocandoId === item.id) {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setAudioTocandoId(null)
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      const audio = new Audio(mediaUrl)
      audioRef.current = audio
      setAudioTocandoId(item.id)
      audio.play().catch((err) => {
        console.error('Erro ao reproduzir:', err)
        toast({
          title: 'Não foi possível reproduzir',
          description: 'O navegador bloqueou ou a URL não está acessível diretamente.',
          variant: 'destructive',
        })
        setAudioTocandoId(null)
      })
      audio.onended = () => setAudioTocandoId(null)
      audio.onerror = () => setAudioTocandoId(null)
    }
  }

  // Marcar / desmarcar favorito
  const handleToggleFavorito = async (item: BibliotecaMidiaRecord) => {
    try {
      const novoStatus = !item.favorito
      setMidias((prev) => prev.map((m) => (m.id === item.id ? { ...m, favorito: novoStatus } : m)))
      await toggleFavoritoMidia(item.id, !!item.favorito)
      toast({
        title: novoStatus ? 'Adicionado aos favoritos' : 'Removido dos favoritos',
        description: `"${item.titulo}" atualizado.`,
      })
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao favoritar',
        description: 'Tente novamente.',
        variant: 'destructive',
      })
      carregarMidias()
    }
  }

  // Cadastrar novo item
  const handleSalvarNovoItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitulo.trim()) {
      toast({
        title: 'Título obrigatório',
        description: 'Informe o título do item de mídia.',
        variant: 'destructive',
      })
      return
    }

    setSalvando(true)
    try {
      const novo = await createMidia({
        titulo: formTitulo.trim(),
        tipo: formTipo,
        categoria: formCategoria.trim() || 'Geral',
        descricao: formDescricao.trim() || undefined,
        duracao: formDuracao.trim() || undefined,
        url: formUrl.trim() || undefined,
        tags: formTags.trim() || undefined,
        favorito: formFavorito,
        arquivo: formArquivo || undefined,
      })

      setMidias((prev) => [novo, ...prev])
      setModalOpen(false)
      // Limpar form
      setFormTitulo('')
      setFormTipo('Áudio')
      setFormCategoria('Trilha fundo')
      setFormDescricao('')
      setFormDuracao('')
      setFormUrl('')
      setFormTags('')
      setFormFavorito(false)
      setFormArquivo(null)

      toast({
        title: 'Item cadastrado com sucesso!',
        description: `"${novo.titulo}" agora está disponível na biblioteca.`,
      })
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao cadastrar',
        description: 'Verifique as informações e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSalvando(false)
    }
  }

  // Confirmar exclusão
  const handleConfirmarExclusao = async () => {
    if (!itemParaExcluir) return
    setExcluindo(true)
    try {
      if (audioTocandoId === itemParaExcluir.id && audioRef.current) {
        audioRef.current.pause()
        setAudioTocandoId(null)
      }
      await deleteMidia(itemParaExcluir.id)
      setMidias((prev) => prev.filter((m) => m.id !== itemParaExcluir.id))
      toast({
        title: 'Item excluído',
        description: `"${itemParaExcluir.titulo}" foi removido da biblioteca.`,
      })
      setItemParaExcluir(null)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao excluir item',
        description: 'Não foi possível remover o item.',
        variant: 'destructive',
      })
    } finally {
      setExcluindo(false)
    }
  }

  // Ícone por tipo
  const getIconePorTipo = (tipo: TipoMidia) => {
    switch (tipo) {
      case 'Vídeo':
        return <Video className="w-4 h-4 text-[#C4704F]" />
      case 'Música':
        return <Music className="w-4 h-4 text-[#1F3D2B]" />
      case 'Efeito sonoro':
        return <Volume2 className="w-4 h-4 text-[#C4704F]" />
      case 'Áudio':
      default:
        return <Film className="w-4 h-4 text-[#1F3D2B]" />
    }
  }

  // Obter link real da mídia para download/abrir
  const getMediaUrl = (item: BibliotecaMidiaRecord) => {
    if (item.arquivo) {
      return pb.files.getURL(item, item.arquivo)
    }
    return item.url || ''
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* CABEÇALHO COM APRESENTAÇÃO E AÇÕES */}
      <div className="bg-[#FAF7F0] border border-[#1F3D2B]/15 rounded-2xl p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF3EE] border border-[#1F3D2B]/10 text-xs font-semibold text-[#1F3D2B] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C4704F]" />
            <span>Repositório de Áudio & Vídeo para Tutoriais</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#1F3D2B]">
            Biblioteca de Ativos Criativos
          </h2>
          <p className="text-xs text-[#1F3D2B]/70 mt-1 max-w-2xl">
            Acesse rapidamente vinhetas acolhedoras, trilhas com piano sereno, sons de notificação e
            vídeos de referência com o padrão e a delicadeza da marca Aline Resolve.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="h-11 px-5 bg-[#C4704F] hover:bg-[#D98A6C] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-card hover:shadow-soft shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Ativo</span>
        </button>
      </div>

      {/* BARRA DE CONTROLE: BUSCA + FILTROS + ORDENAÇÃO */}
      <div className="bg-[#FAF7F0] border border-[#1F3D2B]/15 rounded-2xl p-4 shadow-card space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Campo de Busca em Tempo Real */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#1F3D2B]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por título, tag, categoria ou descrição (ex: vinheta, piano, lembrete)..."
              className="w-full h-11 pl-10 pr-4 bg-white border border-[#1F3D2B]/20 rounded-xl text-xs text-[#142419] placeholder:text-[#1F3D2B]/40 focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
            />
            {busca && (
              <button
                onClick={() => setBusca('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#1F3D2B]/50 hover:text-[#1F3D2B] bg-[#EEF3EE] px-1.5 py-0.5 rounded"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Filtros por Tipo */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {(['Todos', 'Áudio', 'Vídeo', 'Música', 'Efeito sonoro'] as const).map((tipo) => (
              <button
                key={tipo}
                onClick={() => setTipoFiltro(tipo)}
                className={`h-9 px-3.5 rounded-xl text-xs font-semibold transition-all border ${
                  tipoFiltro === tipo
                    ? 'bg-[#1F3D2B] text-white border-[#1F3D2B] shadow-card'
                    : 'bg-white text-[#1F3D2B] border-[#1F3D2B]/20 hover:bg-[#EEF3EE]'
                }`}
              >
                {tipo}
              </button>
            ))}

            {/* Alternador de Favoritos */}
            <button
              onClick={() => setApenasFavoritos(!apenasFavoritos)}
              className={`h-9 px-3.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                apenasFavoritos
                  ? 'bg-[#C4704F] text-white border-[#C4704F] shadow-card'
                  : 'bg-white text-[#1F3D2B] border-[#1F3D2B]/20 hover:bg-[#EEF3EE]'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${apenasFavoritos ? 'fill-white' : 'text-[#C4704F]'}`}
              />
              <span>Favoritos</span>
            </button>

            {/* Ordenação */}
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-[11px] font-semibold text-[#1F3D2B]/60 hidden sm:inline">
                Ordenar:
              </span>
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value as any)}
                className="h-9 px-2.5 bg-white border border-[#1F3D2B]/20 rounded-xl text-xs font-medium text-[#1F3D2B] focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
              >
                <option value="recentes">Mais recentes</option>
                <option value="antigos">Mais antigos</option>
                <option value="titulo">Título A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resumo da filtragem */}
        <div className="flex items-center justify-between text-[11px] text-[#1F3D2B]/60 pt-2 border-t border-[#1F3D2B]/10">
          <div>
            Mostrando <strong className="text-[#1F3D2B]">{midiasFiltradas.length}</strong> de{' '}
            <strong className="text-[#1F3D2B]">{midias.length}</strong> ativos cadastrados
            {busca && <span> para "{busca}"</span>}
          </div>
          {apenasFavoritos && (
            <span className="text-[#C4704F] font-semibold flex items-center gap-1">
              <Star className="w-3 h-3 fill-[#C4704F]" /> Apenas favoritos ativos
            </span>
          )}
        </div>
      </div>

      {/* GRID DE CARDS DENSOS NO ESTOQUE ACOLHEDOR */}
      {loading ? (
        <div className="bg-[#FAF7F0] border border-[#1F3D2B]/15 rounded-2xl p-12 text-center shadow-card">
          <div className="w-8 h-8 border-3 border-[#1F3D2B] border-t-[#C4704F] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-[#1F3D2B]">Carregando acervo de mídias...</p>
        </div>
      ) : midiasFiltradas.length === 0 ? (
        <div className="bg-[#FAF7F0] border border-[#1F3D2B]/15 rounded-2xl p-12 text-center shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF3EE] text-[#1F3D2B] flex items-center justify-center mx-auto">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#1F3D2B]">Nenhum item encontrado</h3>
          <p className="text-xs text-[#1F3D2B]/70 max-w-md mx-auto">
            Não encontramos mídias correspondentes aos filtros selecionados. Tente ajustar o termo
            de busca ou limpar o filtro de favoritos.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            {(busca || tipoFiltro !== 'Todos' || apenasFavoritos) && (
              <button
                onClick={() => {
                  setBusca('')
                  setTipoFiltro('Todos')
                  setApenasFavoritos(false)
                }}
                className="h-9 px-4 rounded-xl border border-[#1F3D2B]/20 bg-white text-xs font-semibold text-[#1F3D2B] hover:bg-[#EEF3EE]"
              >
                Limpar Todos os Filtros
              </button>
            )}
            <button
              onClick={() => setModalOpen(true)}
              className="h-9 px-4 rounded-xl bg-[#C4704F] text-white text-xs font-semibold hover:bg-[#D98A6C]"
            >
              + Adicionar Novo Item
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {midiasFiltradas.map((item) => {
            const urlMidia = getMediaUrl(item)
            const isPlaying = audioTocandoId === item.id
            const tagsList = item.tags
              ? item.tags
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
              : []

            return (
              <div
                key={item.id}
                className="bg-[#FAF7F0] border border-[#1F3D2B]/15 rounded-2xl p-4 shadow-card hover:shadow-soft transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Linha decorativa no topo para itens favoritos */}
                {item.favorito && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C4704F] to-[#D98A6C]" />
                )}

                <div className="space-y-3">
                  {/* Badge de tipo, categoria e botão de favoritar */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EEF3EE] border border-[#1F3D2B]/10 text-[11px] font-bold text-[#1F3D2B]">
                        {getIconePorTipo(item.tipo)}
                        <span>{item.tipo}</span>
                      </span>
                      <span className="text-[11px] font-medium text-[#1F3D2B]/70 px-2 py-0.5 rounded-md bg-white border border-[#1F3D2B]/10">
                        {item.categoria}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleFavorito(item)}
                      aria-label={item.favorito ? 'Remover favorito' : 'Marcar favorito'}
                      className="p-1.5 rounded-lg text-[#1F3D2B]/40 hover:text-[#C4704F] transition-colors"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          item.favorito ? 'fill-[#C4704F] text-[#C4704F]' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Título & Descrição */}
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#142419] line-clamp-1 group-hover:text-[#1F3D2B] transition-colors">
                      {item.titulo}
                    </h3>
                    {item.descricao && (
                      <p className="text-xs text-[#1F3D2B]/75 mt-1 line-clamp-2 leading-relaxed">
                        {item.descricao}
                      </p>
                    )}
                  </div>

                  {/* Tags com visual limpo */}
                  {tagsList.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {tagsList.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F7F2E9] text-[#1F3D2B]/80 border border-[#1F3D2B]/10"
                        >
                          #{tag}
                        </span>
                      ))}
                      {tagsList.length > 3 && (
                        <span className="text-[10px] font-semibold text-[#1F3D2B]/50 px-1 py-0.5">
                          +{tagsList.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Rodapé do Card com Duração e Ações */}
                <div className="pt-4 mt-3 border-t border-[#1F3D2B]/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#1F3D2B]/60 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#1F3D2B]/50" />
                    <span>{item.duracao || '--:--'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Botão de Reprodução (para áudios/músicas/efeitos) */}
                    {item.tipo !== 'Vídeo' && urlMidia && (
                      <button
                        onClick={() => handleTogglePlay(item)}
                        className={`h-8 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isPlaying
                            ? 'bg-[#C4704F] text-white shadow-card animate-pulse'
                            : 'bg-white hover:bg-[#EEF3EE] text-[#1F3D2B] border border-[#1F3D2B]/15'
                        }`}
                        title={isPlaying ? 'Pausar áudio' : 'Ouvir prévia'}
                      >
                        {isPlaying ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current" />
                        )}
                        <span className="text-[11px]">{isPlaying ? 'Pausar' : 'Ouvir'}</span>
                      </button>
                    )}

                    {/* Botão de abrir/assistir vídeo se for vídeo */}
                    {item.tipo === 'Vídeo' && urlMidia && (
                      <a
                        href={urlMidia}
                        target="_blank"
                        rel="noreferrer"
                        className="h-8 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-white hover:bg-[#EEF3EE] text-[#1F3D2B] border border-[#1F3D2B]/15 transition-all"
                        title="Assistir clipe"
                      >
                        <Video className="w-3.5 h-3.5 text-[#C4704F]" />
                        <span className="text-[11px]">Ver Clipe</span>
                      </a>
                    )}

                    {/* Link externo / arquivo */}
                    {urlMidia && (
                      <a
                        href={urlMidia}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl text-[#1F3D2B]/60 hover:text-[#1F3D2B] hover:bg-white border border-transparent hover:border-[#1F3D2B]/15 transition-all"
                        title="Abrir URL ou Baixar Arquivo"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Excluir */}
                    <button
                      onClick={() => setItemParaExcluir(item)}
                      className="p-2 rounded-xl text-rose-600/70 hover:text-rose-700 hover:bg-rose-50 transition-all"
                      title="Excluir item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL DE CADASTRO DE NOVO ITEM */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="border border-[#1F3D2B]/20 bg-[#FAF7F0] p-6 max-w-lg rounded-2xl shadow-soft-lg">
          <DialogHeader className="border-b border-[#1F3D2B]/10 pb-4">
            <DialogTitle className="text-xl font-serif font-bold text-[#1F3D2B] flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#C4704F] text-white flex items-center justify-center text-sm font-bold">
                +
              </span>
              <span>Cadastrar Novo Ativo na Biblioteca</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#1F3D2B]/70">
              Adicione trilhas, vinhetas, efeitos ou vídeos de referência para uso nos tutoriais do
              Instagram e YouTube.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSalvarNovoItem} className="space-y-4 pt-3">
            <div>
              <label className="block text-xs font-semibold text-[#1F3D2B] mb-1">
                Título do Ativo *
              </label>
              <input
                type="text"
                required
                value={formTitulo}
                onChange={(e) => setFormTitulo(e.target.value)}
                placeholder="Ex: Trilha Conforto e Autonomia"
                className="w-full h-11 px-3 bg-white border border-[#1F3D2B]/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1F3D2B] mb-1">
                  Tipo de Mídia
                </label>
                <select
                  value={formTipo}
                  onChange={(e) => setFormTipo(e.target.value as TipoMidia)}
                  className="w-full h-11 px-3 bg-white border border-[#1F3D2B]/20 rounded-xl text-xs font-semibold text-[#1F3D2B] focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
                >
                  <option value="Áudio">Áudio Geral</option>
                  <option value="Vídeo">Vídeo (MP4/Clipe)</option>
                  <option value="Música">Música / Trilha</option>
                  <option value="Efeito sonoro">Efeito Sonoro (SFX)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F3D2B] mb-1">Categoria</label>
                <input
                  type="text"
                  required
                  value={formCategoria}
                  onChange={(e) => setFormCategoria(e.target.value)}
                  placeholder="Ex: Vinheta, Trilha fundo, Lembrete"
                  className="w-full h-11 px-3 bg-white border border-[#1F3D2B]/20 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1F3D2B] mb-1">
                  Duração (aprox.)
                </label>
                <input
                  type="text"
                  value={formDuracao}
                  onChange={(e) => setFormDuracao(e.target.value)}
                  placeholder="Ex: 0:15 ou 2:30"
                  className="w-full h-11 px-3 bg-white border border-[#1F3D2B]/20 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F3D2B] mb-1">
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="Ex: idosos, remédio, acolhedor"
                  className="w-full h-11 px-3 bg-white border border-[#1F3D2B]/20 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F3D2B] mb-1">
                Link de Acesso ou URL Externa
              </label>
              <input
                type="url"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://exemplo.com/audio.mp3"
                className="w-full h-11 px-3 bg-white border border-[#1F3D2B]/20 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F3D2B] mb-1">
                Ou Arquivo Direto (Opcional, max 50MB)
              </label>
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFormArquivo(e.target.files[0])
                  }
                }}
                className="w-full text-xs text-[#1F3D2B] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1F3D2B] file:text-white hover:file:bg-[#2E583E] cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F3D2B] mb-1">
                Descrição ou Dica de Aplicação
              </label>
              <textarea
                rows={2}
                value={formDescricao}
                onChange={(e) => setFormDescricao(e.target.value)}
                placeholder="Ex: Ideal para momentos de encerramento dos tutoriais de organização financeira."
                className="w-full p-3 bg-white border border-[#1F3D2B]/20 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="form-favorito"
                checked={formFavorito}
                onChange={(e) => setFormFavorito(e.target.checked)}
                className="w-4 h-4 rounded text-[#C4704F] accent-[#C4704F] cursor-pointer"
              />
              <label
                htmlFor="form-favorito"
                className="text-xs font-semibold text-[#1F3D2B] cursor-pointer flex items-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5 text-[#C4704F]" />
                Marcar como favorito desde já
              </label>
            </div>

            <div className="pt-4 border-t border-[#1F3D2B]/10 flex gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 h-11 rounded-xl border border-[#1F3D2B]/20 bg-white font-semibold text-xs text-[#1F3D2B] hover:bg-[#EEF3EE]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="flex-1 h-11 rounded-xl bg-[#C4704F] hover:bg-[#D98A6C] text-white font-semibold text-xs transition-colors shadow-card disabled:opacity-50"
              >
                {salvando ? 'Salvando...' : 'Salvar Ativo'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <Dialog
        open={!!itemParaExcluir}
        onOpenChange={(open) => {
          if (!open) setItemParaExcluir(null)
        }}
      >
        <DialogContent className="border border-rose-200 bg-[#FAF7F0] p-6 max-w-md rounded-2xl shadow-soft-lg">
          <DialogHeader className="border-b border-[#1F3D2B]/10 pb-4">
            <DialogTitle className="text-lg font-serif font-bold text-rose-700 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              <span>Confirmar Exclusão de Mídia</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#1F3D2B]/80 pt-2">
              Tem certeza que deseja remover o item{' '}
              <strong className="text-[#142419]">"{itemParaExcluir?.titulo}"</strong>? Esta ação é
              irreversível.
            </DialogDescription>
          </DialogHeader>

          <div className="pt-4 flex gap-3">
            <button
              onClick={() => setItemParaExcluir(null)}
              className="flex-1 h-11 rounded-xl border border-[#1F3D2B]/20 bg-white font-semibold text-xs text-[#1F3D2B] hover:bg-[#EEF3EE]"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmarExclusao}
              disabled={excluindo}
              className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-card disabled:opacity-50"
            >
              {excluindo ? 'Excluindo...' : 'Sim, Excluir Ativo'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Biblioteca
