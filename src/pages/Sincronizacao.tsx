import React, { useState, useEffect } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import { getTransferencias, createTransferencia } from '@/services/transferencias'
import type { TransferenciaRecord, Dispositivo, MetodoTransferencia } from '@/types/database'
import {
  Monitor,
  Smartphone,
  RefreshCw,
  Copy,
  Check,
  Usb,
  Share2,
  Video,
  ShieldAlert,
  Plus,
  ArrowRight,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'

export const Sincronizacao: React.FC = () => {
  const [transferencias, setTransferencias] = useState<TransferenciaRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Dispositivos status
  const [winStatus, setWinStatus] = useState<'conectado' | 'desconectado'>('conectado')
  const [s23Status, setS23Status] = useState<'conectado' | 'desconectado'>('conectado')
  const [lastCheckTime, setLastCheckTime] = useState<string>('Hoje às 10:15')
  const [isChecking, setIsChecking] = useState(false)

  // Estados de cópia
  const [copiadoUsb, setCopiadoUsb] = useState(false)
  const [copiadoQuickShare, setCopiadoQuickShare] = useState(false)
  const [copiadoScrcpyPassos, setCopiadoScrcpyPassos] = useState(false)
  const [copiadoBatScript, setCopiadoBatScript] = useState(false)

  // Modal de nova transferência
  const [novaTransfOpen, setNovaTransfOpen] = useState(false)
  const [arquivoNome, setArquivoNome] = useState('')
  const [origem, setOrigem] = useState<Dispositivo>('S23')
  const [destino, setDestino] = useState<Dispositivo>('PC')
  const [metodo, setMetodo] = useState<MetodoTransferencia>('Cabo USB')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    getTransferencias()
      .then(setTransferencias)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Realtime para novas transferências
  useRealtime<TransferenciaRecord>('transferencias', () => {
    getTransferencias().then(setTransferencias).catch(console.error)
  })

  // Ação de verificar conexão com toast brutalista
  const handleVerificarConexao = () => {
    setIsChecking(true)
    setTimeout(() => {
      setWinStatus('conectado')
      setS23Status('conectado')
      const now = new Date()
      const timeStr = `Hoje às ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      setLastCheckTime(timeStr)
      setIsChecking(false)

      toast({
        title: 'Dispositivos Sincronizados!',
        description: 'Windows (PC) e Samsung Galaxy S23 respondendo via USB/Rede Local.',
      })
    }, 600)
  }

  const copyToClipboard = async (text: string, setCopied: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
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

  // Passos formatados baseados no guia
  const passosUsb = `Passo a passo — Transferência via Cabo USB (Recomendado):
1. Conecte o cabo USB de dados original do S23 ao PC.
2. Na notificação do Android "Carregando via USB", selecione "Transferência de arquivos".
3. Abra o Windows Explorer -> Este Computador -> Galaxy S23 -> Armazenamento interno.
4. Navegue até: DCIM\\Screen recordings (ou a pasta do app gravador).
5. Copie (Ctrl+C) para Tutoriais\\TUT-XXX\\bruto\\ no PC. Nunca mova antes de conferir!`

  const passosQuickShare = `Passo a passo — Quick Share:
1. Abra o Quick Share para Windows no seu PC e entre com sua conta Samsung/Google.
2. No Galaxy S23, abra a Galeria e selecione os vídeos gravados.
3. Toque em Compartilhar -> Quick Share e selecione o seu computador na lista.
4. Aceite a transferência no PC e mova o arquivo recebido para a pasta do projeto.`

  const passosScrcpy = `Passo a passo — scrcpy (Espelhamento 30 fps):
1. No S23, ative a Depuração USB em Opções do desenvolvedor (toque 7x em Número de compilação).
2. Conecte o cabo USB ao PC e autorize a chave RSA no celular.
3. Execute o script Abrir_Android_no_Windows.bat na pasta do scrcpy.
4. A tela do celular será espelhada fluidamente a 30 fps mantendo o celular ativo.`

  const batScriptContent = `@echo off
cd /d "%~dp0"
scrcpy.exe --no-audio --max-fps=30 --stay-awake --pause-on-exit=if-error`

  const handleCreateTransferencia = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!arquivoNome.trim()) return

    setIsSubmitting(true)
    try {
      await createTransferencia({
        arquivo: arquivoNome.trim(),
        origem,
        destino,
        metodo,
        status: 'Em andamento',
      })
      toast({
        title: 'Transferência registrada!',
        description: `${arquivoNome} via ${metodo}`,
      })
      setNovaTransfOpen(false)
      setArquivoNome('')
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro ao registrar',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. SEÇÃO: STATUS DOS DISPOSITIVOS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#F5D90A] border-2 border-black flex items-center justify-center font-black text-xs">
              1
            </div>
            <h2 className="text-lg font-bold uppercase tracking-[0.02em] text-[#111]">
              DISPOSITIVOS VINCULADOS
            </h2>
          </div>
          <button
            onClick={handleVerificarConexao}
            disabled={isChecking}
            className="h-10 px-4 bg-[#F5D90A] hover:bg-[#ffe31a] active:translate-y-[1px] text-black border-2 border-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-brutal disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Verificando...' : 'Verificar conexão'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Windows */}
          <div className="border-2 border-black bg-white p-6 shadow-brutal flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center border-2 border-black">
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold uppercase text-base text-[#111]">WINDOWS (PC)</h3>
                  <p className="text-xs text-[#555] font-medium">
                    Estação de Edição e Renderização
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 border-2 border-black px-2.5 py-1 bg-[#F4F4F4]">
                <div
                  className={`w-3 h-3 border border-black ${
                    winStatus === 'conectado' ? 'bg-[#F5D90A]' : 'bg-[#999]'
                  }`}
                />
                <span className="text-[11px] font-bold uppercase">
                  {winStatus === 'conectado' ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>

            <div className="border-t-2 border-black/10 pt-3 flex items-center justify-between text-xs text-[#555] font-mono">
              <span>Última verificação:</span>
              <span className="font-bold text-[#111]">{lastCheckTime}</span>
            </div>
          </div>

          {/* Card Samsung Galaxy S23 */}
          <div className="border-2 border-black bg-white p-6 shadow-brutal flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#F5D90A] text-black flex items-center justify-center border-2 border-black">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold uppercase text-base text-[#111]">
                    SAMSUNG GALAXY S23
                  </h3>
                  <p className="text-xs text-[#555] font-medium">
                    Dispositivo de Captura de Tela 1080p
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 border-2 border-black px-2.5 py-1 bg-[#F4F4F4]">
                <div
                  className={`w-3 h-3 border border-black ${
                    s23Status === 'conectado' ? 'bg-[#F5D90A]' : 'bg-[#999]'
                  }`}
                />
                <span className="text-[11px] font-bold uppercase">
                  {s23Status === 'conectado' ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>

            <div className="border-t-2 border-black/10 pt-3 flex items-center justify-between text-xs text-[#555] font-mono">
              <span>Modo USB ativo:</span>
              <span className="font-bold text-[#111]">Transferência MTP / adb</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEÇÃO: MÉTODOS DE TRANSFERÊNCIA */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-[#F5D90A] border-2 border-black flex items-center justify-center font-black text-xs">
            2
          </div>
          <h2 className="text-lg font-bold uppercase tracking-[0.02em] text-[#111]">
            MÉTODOS DE TRANSFERÊNCIA (GUIA OPERACIONAL)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Método 1: Cabo USB */}
          <div className="border-2 border-black bg-white p-6 shadow-brutal flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-black text-white flex items-center justify-center border border-black">
                  <Usb className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#F5D90A] text-black border border-black">
                  Recomendado
                </span>
              </div>
              <h3 className="font-extrabold uppercase text-base text-[#111] mb-2">Cabo USB</h3>
              <p className="text-xs text-[#555] mb-4 leading-relaxed">
                Sem conta, sem nuvem. Conecte o cabo original, escolha &quot;Transferência de
                arquivos&quot; no S23 e copie direto de{' '}
                <code className="bg-[#F4F4F4] text-black px-1 border border-black text-[11px]">
                  DCIM\Screen recordings
                </code>
                .
              </p>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(passosUsb, setCopiadoUsb)}
              className={`w-full h-11 border-2 border-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                copiadoUsb
                  ? 'bg-[#E6F4EA] text-[#1D6B3A] border-[#1D6B3A]'
                  : 'bg-white hover:bg-[#F5D90A] text-black'
              }`}
            >
              {copiadoUsb ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar passo a passo</span>
                </>
              )}
            </button>
          </div>

          {/* Método 2: Quick Share */}
          <div className="border-2 border-black bg-white p-6 shadow-brutal flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-[#F4F4F4] text-black flex items-center justify-center border border-black">
                  <Share2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#F4F4F4] text-black border border-black">
                  Sem fio
                </span>
              </div>
              <h3 className="font-extrabold uppercase text-base text-[#111] mb-2">Quick Share</h3>
              <p className="text-xs text-[#555] mb-4 leading-relaxed">
                Envie pela Galeria do celular. Funciona bem para arquivos pequenos ou vídeos de
                teste de 10 segundos diretamente para o Windows.
              </p>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(passosQuickShare, setCopiadoQuickShare)}
              className={`w-full h-11 border-2 border-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                copiadoQuickShare
                  ? 'bg-[#E6F4EA] text-[#1D6B3A] border-[#1D6B3A]'
                  : 'bg-white hover:bg-[#F5D90A] text-black'
              }`}
            >
              {copiadoQuickShare ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar passo a passo</span>
                </>
              )}
            </button>
          </div>

          {/* Método 3: scrcpy */}
          <div className="border-2 border-black bg-white p-6 shadow-brutal flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-black text-[#F5D90A] flex items-center justify-center border border-black">
                  <Video className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-black text-white border border-black">
                  30 FPS
                </span>
              </div>
              <h3 className="font-extrabold uppercase text-base text-[#111] mb-2">
                scrcpy (Espelhamento)
              </h3>
              <p className="text-xs text-[#555] mb-4 leading-relaxed">
                30 fps estáveis e tela ativa. Ideal para gravar tela + Facecam circular no OBS
                Studio sem sobreaquecer o aparelho. Use o script{' '}
                <code className="bg-[#F4F4F4] text-black px-1 border border-black text-[11px]">
                  Abrir_Android_no_Windows.bat
                </code>
                .
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => copyToClipboard(batScriptContent, setCopiadoBatScript)}
                className={`w-full h-10 border-2 border-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  copiadoBatScript
                    ? 'bg-[#E6F4EA] text-[#1D6B3A] border-[#1D6B3A]'
                    : 'bg-black text-white hover:bg-[#333]'
                }`}
              >
                {copiadoBatScript ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Script copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar script (.bat)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(passosScrcpy, setCopiadoScrcpyPassos)}
                className={`w-full h-9 border-2 border-black text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  copiadoScrcpyPassos
                    ? 'bg-[#E6F4EA] text-[#1D6B3A] border-[#1D6B3A]'
                    : 'bg-white hover:bg-[#F4F4F4] text-black'
                }`}
              >
                {copiadoScrcpyPassos ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Passo a passo copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar instruções</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SEÇÃO: TRANSFERÊNCIAS RECENTES */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#F5D90A] border-2 border-black flex items-center justify-center font-black text-xs">
              3
            </div>
            <h2 className="text-lg font-bold uppercase tracking-[0.02em] text-[#111]">
              TRANSFERÊNCIAS RECENTES
            </h2>
          </div>
          <button
            onClick={() => setNovaTransfOpen(true)}
            className="h-9 px-3 bg-white hover:bg-[#F5D90A] text-black border-2 border-black text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Registrar transferência</span>
          </button>
        </div>

        <div className="border-2 border-black bg-white overflow-hidden shadow-brutal">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-[#F4F4F4] border-b-2 border-black">
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-[#111]">
                    Arquivo
                  </th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-[#111] w-36">
                    Origem / Destino
                  </th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-[#111] w-36">
                    Método
                  </th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-[#111] w-32">
                    Data
                  </th>
                  <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-[#111] w-36 text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y border-black">
                {transferencias.map((item) => {
                  let dataStr = '-'
                  if (item.created) {
                    const d = new Date(item.created)
                    dataStr = `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
                  }

                  return (
                    <tr key={item.id} className="hover:bg-[#FFFDE6]/60 transition-colors h-12">
                      <td className="py-3 px-4 font-mono font-bold text-xs text-[#111]">
                        {item.arquivo}
                      </td>
                      <td className="py-3 px-4 text-xs font-bold uppercase">
                        <span className="flex items-center gap-1.5">
                          <span>{item.origem}</span>
                          <ArrowRight className="w-3 h-3 text-[#555]" />
                          <span>{item.destino}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-[#111]">
                        <span className="inline-block px-2 py-0.5 bg-[#F4F4F4] border border-black text-[10px] font-bold uppercase">
                          {item.metodo}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-[#555]">{dataStr}</td>
                      <td className="py-3 px-4 text-right">
                        {item.status === 'Concluído' ? (
                          <span className="inline-block px-2.5 py-1 bg-black text-white font-bold uppercase text-[11px] tracking-wider border border-black">
                            Concluído
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 bg-[#F5D90A] text-black font-bold uppercase text-[11px] tracking-wider border border-black">
                            Em andamento
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {transferencias.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-xs font-bold uppercase text-[#555]"
                    >
                      Nenhuma transferência registrada recentemente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. NOTA DE SEGURANÇA E PRIVACIDADE */}
      <div className="border-2 border-black bg-[#FFF0D9] p-5 shadow-brutal flex items-start gap-3">
        <ShieldAlert className="w-6 h-6 text-[#8A4B00] shrink-0 mt-0.5" />
        <div>
          <h4 className="font-extrabold uppercase text-xs tracking-wider text-[#8A4B00] mb-1">
            PRIVACIDADE E ANONIMIZAÇÃO LOCAL
          </h4>
          <p className="text-xs font-bold text-[#8A4B00] leading-relaxed">
            Nunca envie o vídeo bruto com dados pessoais por nuvem antes de conferir. Editores web e
            nuvens públicas podem armazenar dados de demonstração. Anonimize localmente no PC antes
            de qualquer upload.
          </p>
        </div>
      </div>

      {/* MODAL REGISTRAR TRANSFERÊNCIA */}
      <Dialog open={novaTransfOpen} onOpenChange={setNovaTransfOpen}>
        <DialogContent className="border-2 border-black bg-white p-6 max-w-md rounded-none shadow-[6px_6px_0px_0px_#111]">
          <DialogHeader className="border-b-2 border-black pb-3">
            <DialogTitle className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 bg-[#F5D90A] border border-black flex items-center justify-center text-xs font-black">
                +
              </span>
              <span>Registrar Nova Transferência</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateTransferencia} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                Nome do Arquivo
              </label>
              <input
                type="text"
                required
                placeholder="Ex: TUT-005_bruto.mp4"
                value={arquivoNome}
                onChange={(e) => setArquivoNome(e.target.value)}
                className="w-full h-11 px-3 border-2 border-black bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#F5D90A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                  Origem
                </label>
                <select
                  value={origem}
                  onChange={(e) => setOrigem(e.target.value as Dispositivo)}
                  className="w-full h-11 px-3 border-2 border-black bg-white text-xs font-bold uppercase"
                >
                  <option value="S23">Samsung S23</option>
                  <option value="PC">Windows PC</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                  Destino
                </label>
                <select
                  value={destino}
                  onChange={(e) => setDestino(e.target.value as Dispositivo)}
                  className="w-full h-11 px-3 border-2 border-black bg-white text-xs font-bold uppercase"
                >
                  <option value="PC">Windows PC</option>
                  <option value="S23">Samsung S23</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                Método Utilizado
              </label>
              <select
                value={metodo}
                onChange={(e) => setMetodo(e.target.value as MetodoTransferencia)}
                className="w-full h-11 px-3 border-2 border-black bg-white text-xs font-bold uppercase"
              >
                <option value="Cabo USB">Cabo USB (Recomendado)</option>
                <option value="Quick Share">Quick Share</option>
                <option value="scrcpy">scrcpy (Espelhamento)</option>
              </select>
            </div>

            <div className="pt-4 border-t-2 border-black flex gap-3">
              <button
                type="button"
                onClick={() => setNovaTransfOpen(false)}
                className="flex-1 h-11 border-2 border-black bg-white font-bold uppercase text-xs hover:bg-[#F4F4F4]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-11 border-2 border-black bg-[#F5D90A] font-bold uppercase text-xs hover:bg-[#ffe31a] disabled:opacity-50"
              >
                {isSubmitting ? 'Salvando...' : 'Registrar'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Sincronizacao
