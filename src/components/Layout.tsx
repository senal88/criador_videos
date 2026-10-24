import React, { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  Video,
  RefreshCw,
  LogOut,
  Menu,
  X,
  Play,
  Monitor,
  Plus,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createPostagem } from '@/services/postagens'
import { getProjetos } from '@/services/projetos'
import type { ProjetoRecord } from '@/types/database'
import { toast } from '@/hooks/use-toast'

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

  // Determinar o título da página
  const getPageTitle = () => {
    if (location.pathname === '/') return 'DASHBOARD'
    if (location.pathname.startsWith('/edicao')) return 'PAINEL DE EDIÇÃO'
    if (location.pathname.startsWith('/sincronizacao')) return 'SINCRONIZAÇÃO'
    return 'ALINE RESOLVE'
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
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
        description: 'É necessário vincular a postagem a um projeto.',
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
        description: 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#111] flex flex-col md:flex-row">
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between h-14 px-4 border-b-2 border-black bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#F5D90A] border-2 border-black flex items-center justify-center">
            <Play className="w-3.5 h-3.5 fill-black text-black" />
          </div>
          <span className="font-bold text-sm tracking-wider uppercase">ALINE RESOLVE</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 border-2 border-black bg-white active:bg-[#F5D90A]"
          aria-label="Abrir Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 bg-white h-full border-r-2 border-black flex flex-col justify-between p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center gap-2 pb-4 mb-4 border-b-2 border-black">
                <div className="w-8 h-8 bg-[#F5D90A] border-2 border-black flex items-center justify-center">
                  <Play className="w-4 h-4 fill-black text-black" />
                </div>
                <div>
                  <h2 className="font-bold text-sm tracking-wider uppercase">ALINE RESOLVE</h2>
                  <p className="text-[10px] text-[#555] tracking-widest font-medium">
                    PRODUÇÃO DE VÍDEOS
                  </p>
                </div>
              </div>

              <nav className="flex flex-col gap-3">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between p-3 font-bold uppercase text-xs border-2 border-black transition-all ${
                        isActive
                          ? 'bg-[#F5D90A] text-black'
                          : 'bg-white text-black hover:translate-x-1'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2">
                          <item.icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </div>
                        {isActive && <span>▸</span>}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t-2 border-black space-y-3">
              <div className="p-3 bg-[#F4F4F4] border-2 border-black">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold uppercase">WINDOWS (PC)</span>
                  <div className="w-2.5 h-2.5 bg-[#F5D90A] border border-black" />
                </div>
                <p className="text-[11px] text-[#555] truncate font-medium">
                  {user?.name || 'Aline Resolve'}
                </p>
              </div>

              <button
                onClick={logout}
                className="w-full h-10 border-2 border-black bg-white hover:bg-[#FDE8E8] text-xs font-bold uppercase flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR (FIXA 260px) */}
      <aside className="hidden md:flex flex-col justify-between w-[260px] shrink-0 min-h-screen border-r-2 border-black bg-white sticky top-0 h-screen p-5">
        <div>
          {/* Logo Bloco Preto com Texto Branco + Quadrado Amarelo */}
          <div className="p-3 bg-black text-white border-2 border-black mb-1 flex items-center gap-3">
            <div className="w-8 h-8 bg-[#F5D90A] border border-black flex items-center justify-center shrink-0">
              <Play className="w-4 h-4 fill-black text-black" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-wider leading-none">
                ALINE RESOLVE
              </h1>
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#555] mb-8 px-1">
            PRODUÇÃO DE VÍDEOS · INSTAGRAM
          </p>

          {/* Navegação */}
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-120 border-2 ${
                    isActive
                      ? 'bg-[#F5D90A] text-black border-black shadow-none'
                      : 'bg-white text-black border-transparent hover:border-black hover:translate-x-[2px]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5">
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <span className="text-sm font-black">▸</span>}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="space-y-3 pt-4 border-t-2 border-black">
          <div className="p-3 bg-[#F4F4F4] border-2 border-black">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-[#111]" />
                <span className="text-[11px] font-bold uppercase tracking-wider">WINDOWS</span>
              </div>
              <div className="w-2.5 h-2.5 bg-[#F5D90A] border border-black" title="Conectado" />
            </div>
            <div className="text-[11px] font-bold uppercase text-[#111] truncate">
              {user?.name || 'Aline Resolve'}
            </div>
            <div className="text-[10px] text-[#555] truncate">
              {user?.email || 'luizfernandomoreirasena@gmail.com'}
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full h-10 border-2 border-black bg-white hover:bg-[#FDE8E8] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER FIXO 64px, BORDA INFERIOR PRETA 2px */}
        <header className="h-16 border-b-2 border-black bg-white px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-[0.02em] text-[#111]">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Seletor de período do cronograma */}
            <select
              aria-label="Filtrar período do cronograma"
              className="h-10 px-3 bg-white text-[#111] border-2 border-black text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#F5D90A] cursor-pointer hidden sm:block"
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
              <option value="todos">Todos</option>
            </select>

            {/* Botão Nova Postagem */}
            <button
              onClick={handleOpenNovaPostagem}
              className="h-10 px-4 bg-[#F5D90A] hover:bg-[#ffe31a] active:translate-y-[1px] text-black border-2 border-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nova postagem</span>
            </button>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL (COM PADDING GENEROSO DE 24px) */}
        <main className="flex-1 p-6 md:p-8 bg-white overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* DIALOG DE NOVA POSTAGEM */}
      <Dialog open={novaPostagemOpen} onOpenChange={setNovaPostagemOpen}>
        <DialogContent className="border-2 border-black bg-white p-6 max-w-md rounded-none shadow-[6px_6px_0px_0px_#111]">
          <DialogHeader className="border-b-2 border-black pb-3">
            <DialogTitle className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 bg-[#F5D90A] border border-black flex items-center justify-center text-xs font-black">
                +
              </span>
              <span>Agendar Nova Postagem</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreatePostagem} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                Projeto Vinculado
              </label>
              <select
                required
                value={selectedProjeto}
                onChange={(e) => setSelectedProjeto(e.target.value)}
                className="w-full h-11 px-3 border-2 border-black bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F5D90A]"
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
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                  Data Programada
                </label>
                <input
                  type="date"
                  required
                  value={dataProgramada}
                  onChange={(e) => setDataProgramada(e.target.value)}
                  className="w-full h-11 px-3 border-2 border-black bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F5D90A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                  Horário
                </label>
                <input
                  type="text"
                  required
                  placeholder="10:00"
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                  className="w-full h-11 px-3 border-2 border-black bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F5D90A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                Plataforma de Publicação
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPlataforma('Instagram Reels')}
                  className={`h-10 text-xs font-bold uppercase border-2 border-black ${
                    plataforma === 'Instagram Reels'
                      ? 'bg-[#F5D90A] text-black'
                      : 'bg-white text-black'
                  }`}
                >
                  Instagram Reels
                </button>
                <button
                  type="button"
                  onClick={() => setPlataforma('YouTube')}
                  className={`h-10 text-xs font-bold uppercase border-2 border-black ${
                    plataforma === 'YouTube' ? 'bg-[#F5D90A] text-black' : 'bg-white text-black'
                  }`}
                >
                  YouTube 16:9
                </button>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-black flex gap-3">
              <button
                type="button"
                onClick={() => setNovaPostagemOpen(false)}
                className="flex-1 h-11 border-2 border-black bg-white font-bold uppercase text-xs hover:bg-[#F4F4F4]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-11 border-2 border-black bg-[#F5D90A] font-bold uppercase text-xs hover:bg-[#ffe31a] disabled:opacity-50"
              >
                {isSubmitting ? 'Agendando...' : 'Confirmar'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Layout
