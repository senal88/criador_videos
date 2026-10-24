import React, { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  Video,
  Library,
  RefreshCw,
  LogOut,
  Menu,
  X,
  Plus,
  Monitor,
  Heart,
  Calendar,
  Clock,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createPostagem } from '@/services/postagens'
import { getProjetos } from '@/services/projetos'
import type { ProjetoRecord } from '@/types/database'
import { toast } from '@/hooks/use-toast'
import BrandLogo from '@/components/BrandLogo'
import BrandBlock from '@/components/BrandBlock'

interface LayoutProps {
  onPeriodoChange?: (periodo: string) => void
}

export const Layout: React.FC<LayoutProps> = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [novaPostagemOpen, setNovaPostagemOpen] = useState(false)
  const [projetos, setProjetos] = useState<ProjetoRecord[]>([])
  const [selectedProjeto, setSelectedProjeto] = useState('')
  const [dataProgramada, setDataProgramada] = useState(new Date().toISOString().slice(0, 10))
  const [horario, setHorario] = useState('10:00')
  const [plataforma, setPlataforma] = useState<'Instagram Reels' | 'YouTube'>('Instagram Reels')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Determinar o título e subtítulo da página
  const getPageInfo = () => {
    if (location.pathname === '/') {
      return {
        title: 'Painel Geral',
        subtitle: 'Visão consolidada da criação de conteúdo e suporte às famílias',
      }
    }
    if (location.pathname.startsWith('/biblioteca')) {
      return {
        title: 'Biblioteca de Mídia',
        subtitle: 'Áudios, vinhetas, trilhas e clipes acolhedores para os tutoriais',
      }
    }
    if (location.pathname.startsWith('/edicao')) {
      return {
        title: 'Painel de Edição',
        subtitle: 'Cortes rápidos, presets de cor e comandos de vídeo formatados',
      }
    }
    if (location.pathname.startsWith('/sincronizacao')) {
      return {
        title: 'Sincronização de Dispositivos',
        subtitle: 'Transferência e espelhamento seguro entre Samsung S23 e PC Windows',
      }
    }
    return {
      title: 'Aline Resolve',
      subtitle: 'Organização, orientação e acompanhamento para idosos e famílias',
    }
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Biblioteca', path: '/biblioteca', icon: Library },
    { name: 'Edição', path: '/edicao', icon: Video },
    { name: 'Sincronização', path: '/sincronizacao', icon: RefreshCw },
  ]

  const handleOpenNovaPostagem = async () => {
    setNovaPostagemOpen(true)
    try {
      const projs = await getProjetos()
      setProjetos(projs)
      if (projs.length > 0 && !selectedProjeto) {
        setSelectedProjeto(projs[0].id)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreatePostagem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProjeto) {
      toast({
        title: 'Selecione um projeto',
        description: 'É necessário vincular a postagem a um projeto existente.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await createPostagem({
        projeto: selectedProjeto,
        data_programada: new Date(dataProgramada).toISOString(),
        horario,
        plataforma,
        status: 'Agendada',
      })

      toast({
        title: 'Postagem agendada!',
        description: `Agendada para ${dataProgramada} às ${horario}.`,
      })
      setNovaPostagemOpen(false)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao agendar postagem',
        description: 'Por favor, tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const pageInfo = getPageInfo()

  return (
    <div className="min-h-screen bg-[#F7F2E9] text-[#142419] flex flex-col md:flex-row">
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between h-16 px-4 border-b border-[#1F3D2B]/15 bg-[#FAF7F0] sticky top-0 z-50 shadow-card">
        <BrandLogo size="sm" />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl border border-[#1F3D2B]/15 bg-[#F7F2E9] text-[#1F3D2B] active:bg-[#E5ECE5]"
          aria-label="Abrir Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-80 bg-[#FAF7F0] h-full border-r border-[#1F3D2B]/15 flex flex-col justify-between p-5 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#1F3D2B]/10">
                <BrandLogo size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-[#1F3D2B]/70 hover:text-[#1F3D2B]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Bloco da Marca no Mobile */}
              <BrandBlock variant="sidebar" />

              <nav className="flex flex-col gap-2 pt-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1F3D2B]/60 px-3">
                  Navegação
                </span>
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-[#1F3D2B] text-[#FAF7F0] shadow-soft'
                          : 'text-[#1F3D2B] hover:bg-[#EEF3EE]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <item.icon
                            className={`w-4 h-4 ${isActive ? 'text-[#D98A6C]' : 'text-[#1F3D2B]'}`}
                          />
                          <span>{item.name}</span>
                        </div>
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#D98A6C]" />}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="pt-6 border-t border-[#1F3D2B]/10 space-y-3">
              <div className="p-3.5 rounded-xl bg-[#EEF3EE]/90 border border-[#1F3D2B]/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-[#1F3D2B]">Usuária Conectada</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                </div>
                <p className="text-xs font-semibold text-[#142419] truncate">
                  {user?.name || 'Aline Resolve'}
                </p>
                <p className="text-[11px] text-[#1F3D2B]/70 truncate">
                  {user?.email || 'luizfernandomoreirasena@gmail.com'}
                </p>
              </div>

              <button
                onClick={logout}
                className="w-full h-10 rounded-xl border border-[#1F3D2B]/15 bg-white hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold text-[#1F3D2B] flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Encerrar Sessão</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR (290px elegante e acolhedora) */}
      <aside className="hidden md:flex flex-col justify-between w-[290px] shrink-0 min-h-screen border-r border-[#1F3D2B]/15 bg-[#FAF7F0] sticky top-0 h-screen p-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Logo Aline Resolve */}
          <div className="pb-1">
            <BrandLogo size="md" />
          </div>

          {/* Bloco Oficial da Marca (Slogan + bullet points + contatos) */}
          <BrandBlock variant="sidebar" />

          {/* Navegação Principal */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1F3D2B]/60 px-3">
              Menu do Sistema
            </span>
            <nav className="flex flex-col gap-1.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[#1F3D2B] text-[#FAF7F0] shadow-soft'
                        : 'text-[#1F3D2B] hover:bg-[#EEF3EE]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <item.icon
                          className={`w-4 h-4 ${isActive ? 'text-[#D98A6C]' : 'text-[#1F3D2B]/80'}`}
                        />
                        <span>{item.name}</span>
                      </div>
                      {isActive && <span className="w-2 h-2 rounded-full bg-[#D98A6C]" />}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="space-y-3 pt-6 border-t border-[#1F3D2B]/10">
          <div className="p-3.5 rounded-2xl bg-[#EEF3EE]/80 border border-[#1F3D2B]/10">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-[#1F3D2B]" />
                <span className="text-[11px] font-bold text-[#1F3D2B]">WINDOWS · S23</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Ativo
              </span>
            </div>
            <div className="text-xs font-bold text-[#142419] truncate">
              {user?.name || 'Aline Resolve'}
            </div>
            <div className="text-[11px] text-[#1F3D2B]/70 truncate font-mono">
              {user?.email || 'luizfernandomoreirasena@gmail.com'}
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full h-10 rounded-xl border border-[#1F3D2B]/15 bg-white hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold text-[#1F3D2B] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER SUPERIOR */}
        <header className="h-20 border-b border-[#1F3D2B]/15 bg-[#FAF7F0]/90 backdrop-blur-md px-6 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-[#1F3D2B] tracking-tight">
              {pageInfo.title}
            </h1>
            <p className="text-xs text-[#1F3D2B]/70 hidden sm:block">{pageInfo.subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Seletor de período */}
            {location.pathname === '/' && (
              <select
                aria-label="Filtrar período do cronograma"
                className="h-10 px-3 bg-white text-[#1F3D2B] border border-[#1F3D2B]/20 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#C4704F] cursor-pointer hidden sm:block shadow-card"
                defaultValue="7dias"
                onChange={(e) => {
                  const event = new CustomEvent('cronograma-periodo-change', {
                    detail: e.target.value,
                  })
                  window.dispatchEvent(event)
                }}
              >
                <option value="7dias">Próximos 7 dias</option>
                <option value="mes">Este mês</option>
                <option value="todos">Todas as datas</option>
              </select>
            )}

            {/* Botão Nova Postagem */}
            <button
              onClick={handleOpenNovaPostagem}
              className="h-10 px-4 bg-[#C4704F] hover:bg-[#D98A6C] text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-card hover:shadow-soft cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Postagem</span>
            </button>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 p-6 md:p-8 bg-[#F7F2E9] overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* DIALOG DE NOVA POSTAGEM */}
      <Dialog open={novaPostagemOpen} onOpenChange={setNovaPostagemOpen}>
        <DialogContent className="border border-[#1F3D2B]/20 bg-[#FAF7F0] p-6 max-w-md rounded-2xl shadow-soft-lg">
          <DialogHeader className="border-b border-[#1F3D2B]/10 pb-4">
            <DialogTitle className="text-lg font-serif font-bold text-[#1F3D2B] flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#C4704F] text-white flex items-center justify-center text-sm font-bold">
                +
              </span>
              <span>Agendar Nova Postagem</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreatePostagem} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#1F3D2B] mb-1.5">
                Projeto Vinculado
              </label>
              <select
                required
                value={selectedProjeto}
                onChange={(e) => setSelectedProjeto(e.target.value)}
                className="w-full h-11 px-3 border border-[#1F3D2B]/20 rounded-xl bg-white text-sm font-medium text-[#142419] focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
              >
                {projetos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} ({p.formato})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1F3D2B] mb-1.5">
                  Data Programada
                </label>
                <input
                  type="date"
                  required
                  value={dataProgramada}
                  onChange={(e) => setDataProgramada(e.target.value)}
                  className="w-full h-11 px-3 border border-[#1F3D2B]/20 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F3D2B] mb-1.5">Horário</label>
                <input
                  type="text"
                  required
                  placeholder="10:00"
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                  className="w-full h-11 px-3 border border-[#1F3D2B]/20 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F3D2B] mb-1.5">
                Plataforma de Publicação
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPlataforma('Instagram Reels')}
                  className={`h-11 rounded-xl text-xs font-semibold border transition-all ${
                    plataforma === 'Instagram Reels'
                      ? 'bg-[#1F3D2B] text-white border-[#1F3D2B] shadow-card'
                      : 'bg-white text-[#1F3D2B] border-[#1F3D2B]/20 hover:bg-[#EEF3EE]'
                  }`}
                >
                  Instagram Reels
                </button>
                <button
                  type="button"
                  onClick={() => setPlataforma('YouTube')}
                  className={`h-11 rounded-xl text-xs font-semibold border transition-all ${
                    plataforma === 'YouTube'
                      ? 'bg-[#1F3D2B] text-white border-[#1F3D2B] shadow-card'
                      : 'bg-white text-[#1F3D2B] border-[#1F3D2B]/20 hover:bg-[#EEF3EE]'
                  }`}
                >
                  YouTube (16:9)
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1F3D2B]/10 flex gap-3">
              <button
                type="button"
                onClick={() => setNovaPostagemOpen(false)}
                className="flex-1 h-11 rounded-xl border border-[#1F3D2B]/20 bg-white font-semibold text-xs text-[#1F3D2B] hover:bg-[#EEF3EE]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-11 rounded-xl bg-[#C4704F] hover:bg-[#D98A6C] text-white font-semibold text-xs transition-colors shadow-card disabled:opacity-50"
              >
                {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Layout
