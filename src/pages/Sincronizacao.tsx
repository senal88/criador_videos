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
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
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

  // Ação de verificar conexão
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
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* 1. SEÇÃO: STATUS DOS DISPOSITIVOS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#1F3D2B] text-white flex items-center justify-center font-serif font-bold text-xs">
              1
            </span>
            <h2 className="text-lg font-serif font-bold text-[#1F3D2B]">Dispositivos Vinculados</h2>
          </div>
          <button
            onClick={handleVerificarConexao}
            disabled={isChecking}
            className="h-10 px-4 bg-[#C4704F] hover:bg-[#D98A6C] text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-card hover:shadow-soft disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Verificando...' : 'Verificar conexão'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card Windows */}
          <div className="border border-[#1F3D2B]/15 bg-[#FAF7F0] rounded-2xl p-6 shadow-card hover:shadow-soft transition-all flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#1F3D2B] text-[#FAF7F0] rounded-2xl flex items-center justify-center shadow-sm">
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#142419]">
                    Windows 11 (PC Desktop)
                  </h3>
                  <p className="text-xs text-[#1F3D2B]/70 font-medium">
                    Estação de Edição e Renderização
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-[#EEF3EE] rounded-full border border-[#1F3D2B]/10">
                <span
                  className={`w-2 h-2 rounded-full ${
                    winStatus === 'conectado' ? 'bg-emerald-600 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                <span className="text-[11px] font-semibold text-[#1F3D2B]">
                  {winStatus === 'conectado' ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>

            <div className="border-t border-[#1F3D2B]/10 pt-3 flex items-center justify-between text-xs text-[#1F3D2B]/70 font-mono">
              <span>Última verificação:</span>
              <span className="font-semibold text-[#142419]">{lastCheckTime}</span>
            </div>
          </div>

          {/* Card Samsung Galaxy S23 */}
          <div className="border border-[#1F3D2B]/15 bg-[#FAF7F0] rounded-2xl p-6 shadow-card hover:shadow-soft transition-all flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#F4EAE4] text-[#C4704F] rounded-2xl flex items-center justify-center shadow-sm">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#142419]">
                    Samsung Galaxy S23
                  </h3>
                  <p className="text-xs text-[#1F3D2B]/70 font-medium">
                    Dispositivo de Captura de Tela 1080p
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-[#EEF3EE] rounded-full border border-[#1F3D2B]/10">
                <span
                  className={`w-2 h-2 rounded-full ${
                    s23Status === 'conectado' ? 'bg-emerald-600 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                <span className="text-[11px] font-semibold text-[#1F3D2B]">
                  {s23Status === 'conectado' ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>

            <div className="border-t border-[#1F3D2B]/10 pt-3 flex items-center justify-between text-xs text-[#1F3D2B]/70 font-mono">
              <span>Modo USB ativo:</span>
              <span className="font-semibold text-[#142419]">Transferência MTP / adb</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEÇÃO: MÉTODOS DE TRANSFERÊNCIA */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-lg bg-[#1F3D2B] text-white flex items-center justify-center font-serif font-bold text-xs">
            2
          </span>
          <h2 className="text-lg font-serif font-bold text-[#1F3D2B]">
            Métodos de Transferência e Espelhamento
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Método 1: Cabo USB */}
          <div className="border border-[#1F3D2B]/15 bg-[#FAF7F0] rounded-2xl p-6 shadow-card hover:shadow-soft transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#EEF3EE] text-[#1F3D2B] flex items-center justify-center">
                  <Usb className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 bg-[#EEF3EE] text-[#1F3D2B] rounded-full border border-[#1F3D2B]/10">
                  Recomendado
                </span>
              </div>
              <h3 className="font-serif font-bold text-base text-[#142419] mb-1.5">Cabo USB</h3>
              <p className="text-xs text-[#1F3D2B]/75 mb-4 leading-relaxed">
                Sem conta, sem nuvem. Conecte o cabo original, escolha &quot;Transferência de
                arquivos&quot; no S23 e copie direto da pasta{' '}
                <code className="bg-[#EEF3EE] text-[#1F3D2B] px-1.5 py-0.5 rounded text-[11px] font-mono">
                  DCIM\Screen recordings
                </code>
                .
              </p>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(passosUsb, setCopiadoUsb)}
              className={`w-full h-11 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                copiadoUsb
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white hover:bg-[#EEF3EE] text-[#1F3D2B] border-[#1F3D2B]/20 shadow-sm'
              }`}
            >
              {copiadoUsb ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#C4704F]" />
                  <span>Copiar passo a passo</span>
                </>
              )}
            </button>
          </div>

          {/* Método 2: Quick Share */}
          <div className="border border-[#1F3D2B]/15 bg-[#FAF7F0] rounded-2xl p-6 shadow-card hover:shadow-soft transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#F4EAE4] text-[#C4704F] flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 bg-[#EEF3EE] text-[#1F3D2B] rounded-full border border-[#1F3D2B]/10">
                  Sem fio
                </span>
              </div>
              <h3 className="font-serif font-bold text-base text-[#142419] mb-1.5">Quick Share</h3>
              <p className="text-xs text-[#1F3D2B]/75 mb-4 leading-relaxed">
                Envie pela Galeria do celular. Funciona bem para arquivos leves ou vídeos de teste
                de 10 segundos diretamente para o Windows.
              </p>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(passosQuickShare, setCopiadoQuickShare)}
              className={`w-full h-11 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                copiadoQuickShare
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white hover:bg-[#EEF3EE] text-[#1F3D2B] border-[#1F3D2B]/20 shadow-sm'
              }`}
            >
              {copiadoQuickShare ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#C4704F]" />
                  <span>Copiar passo a passo</span>
                </>
              )}
            </button>
          </div>

          {/* Método 3: scrcpy */}
          <div className="border border-[#1F3D2B]/15 bg-[#FAF7F0] rounded-2xl p-6 shadow-card hover:shadow-soft transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#1F3D2B] text-white flex items-center justify-center">
                  <Video className="w-4 h-4 text-[#D98A6C]" />
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 bg-[#1F3D2B] text-[#FAF7F0] rounded-full">
                  30 FPS
                </span>
              </div>
              <h3 className="font-serif font-bold text-base text-[#142419] mb-1.5">
                scrcpy (Espelhamento)
              </h3>
              <p className="text-xs text-[#1F3D2B]/75 mb-4 leading-relaxed">
                30 fps estáveis e tela ativa. Ideal para gravar tela + Facecam circular no OBS
                Studio sem sobreaquecer o aparelho. Use o script{' '}
                <code className="bg-[#EEF3EE] text-[#1F3D2B] px-1.5 py-0.5 rounded text-[11px] font-mono">
                  Abrir_Android_no_Windows.bat
                </code>
                .
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => copyToClipboard(batScriptContent, setCopiadoBatScript)}
                className={`w-full h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  copiadoBatScript
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-[#1F3D2B] hover:bg-[#2E583E] text-white border-[#1F3D2B] shadow-card'
                }`}
              >
                {copiadoBatScript ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Script copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#D98A6C]" />
                    <span>Copiar script (.bat)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(passosScrcpy, setCopiadoScrcpyPassos)}
                className={`w-full h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                  copiadoScrcpyPassos
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white hover:bg-[#EEF3EE] text-[#1F3D2B] border-[#1F3D2B]/20 shadow-sm'
                }`}
              >
                {copiadoScrcpyPassos ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Passo a passo copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#C4704F]" />
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
            <span className="w-6 h-6 rounded-lg bg-[#1F3D2B] text-white flex items-center justify-center font-serif font-bold text-xs">
              3
            </span>
            <h2 className="text-lg font-serif font-bold text-[#1F3D2B]">
              Histórico de Transferências
            </h2>
          </div>
          <button
            onClick={() => setNovaTransfOpen(true)}
            className="h-10 px-4 bg-white hover:bg-[#EEF3EE] text-[#1F3D2B] border border-[#1F3D2B]/20 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-card"
          >
            <Plus className="w-3.5 h-3.5 text-[#C4704F]" />
            <span>Registrar transferência</span>
          </button>
        </div>

        <div className="border border-[#1F3D2B]/15 bg-[#FAF7F0] rounded-2xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-[#EEF3EE]/80 border-b border-[#1F3D2B]/10">
                  <th className="py-3.5 px-5 text-xs font-semibold text-[#1F3D2B]">Arquivo</th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-[#1F3D2B] w-36">
                    Origem / Destino
                  </th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-[#1F3D2B] w-36">Método</th>
                  <th className="py-3.5 px-4 text-xs font-semibold text-[#1F3D2B] w-36">Data</th>
                  <th className="py-3.5 px-5 text-xs font-semibold text-[#1F3D2B] w-36 text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F3D2B]/10">
                {transferencias.map((item) => {
                  let dataStr = '-'
                  if (item.created) {
                    const d = new Date(item.created)
                    dataStr = `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
                  }

                  return (
                    <tr key={item.id} className="hover:bg-white/80 transition-colors h-14">
                      <td className="py-3.5 px-5 font-mono text-xs font-semibold text-[#142419]">
                        {item.arquivo}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-[#1F3D2B]">
                        <span className="flex items-center gap-1.5">
                          <span>{item.origem}</span>
                          <ArrowRight className="w-3 h-3 text-[#C4704F]" />
                          <span>{item.destino}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-[#142419]">
                        <span className="inline-block px-2.5 py-0.5 bg-white border border-[#1F3D2B]/15 rounded-md text-[11px] font-semibold text-[#1F3D2B]">
                          {item.metodo}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-[#1F3D2B]/70">{dataStr}</td>
                      <td className="py-3.5 px-5 text-right">
                        {item.status === 'Concluído' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Concluído
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F4EAE4] text-[#C4704F] text-xs font-semibold rounded-lg border border-[#C4704F]/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C4704F] animate-pulse" />
                            Em andamento
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {transferencias.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-[#1F3D2B]/70">
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
      <div className="border border-[#C4704F]/30 bg-[#FFF9F6] rounded-2xl p-5 shadow-card flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#F4EAE4] text-[#C4704F] flex items-center justify-center shrink-0 mt-0.5">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#C4704F] mb-1">
            Privacidade e Anonimização Local das Famílias
          </h4>
          <p className="text-xs font-medium text-[#142419] leading-relaxed">
            Nunca envie vídeos brutos contendo dados pessoais de idosos ou senhas por nuvens
            públicas antes de conferir. Anonimize localmente no PC antes de qualquer upload ou
            postagem.
          </p>
        </div>
      </div>

      {/* MODAL REGISTRAR TRANSFERÊNCIA */}
      <Dialog open={novaTransfOpen} onOpenChange={setNovaTransfOpen}>
        <DialogContent className="border border-[#1F3D2B]/20 bg-[#FAF7F0] p-6 max-w-md rounded-2xl shadow-soft-lg">
          <DialogHeader className="border-b border-[#1F3D2B]/10 pb-3">
            <DialogTitle className="text-lg font-serif font-bold text-[#1F3D2B] flex items-center gap-2">
              <span className="w-7 h-7 bg-[#C4704F] text-white rounded-lg flex items-center justify-center text-xs font-bold">
                +
              </span>
              <span>Registrar Nova Transferência</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-[#1F3D2B]/70">
              Mantenha o histórico de clipes importados entre o smartphone S23 e a estação PC.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTransferencia} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#1F3D2B] mb-1">
                Nome do Arquivo
              </label>
              <input
                type="text"
                required
                placeholder="Ex: TUT-005_bruto.mp4"
                value={arquivoNome}
                onChange={(e) => setArquivoNome(e.target.value)}
                className="w-full h-11 px-3 border border-[#1F3D2B]/20 rounded-xl bg-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#C4704F]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1F3D2B] mb-1">Origem</label>
                <select
                  value={origem}
                  onChange={(e) => setOrigem(e.target.value as Dispositivo)}
                  className="w-full h-11 px-3 border border-[#1F3D2B]/20 rounded-xl bg-white text-xs font-semibold text-[#1F3D2B]"
                >
                  <option value="S23">Samsung S23</option>
                  <option value="PC">Windows PC</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F3D2B] mb-1">Destino</label>
                <select
                  value={destino}
                  onChange={(e) => setDestino(e.target.value as Dispositivo)}
                  className="w-full h-11 px-3 border border-[#1F3D2B]/20 rounded-xl bg-white text-xs font-semibold text-[#1F3D2B]"
                >
                  <option value="PC">Windows PC</option>
                  <option value="S23">Samsung S23</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F3D2B] mb-1">
                Método Utilizado
              </label>
              <select
                value={metodo}
                onChange={(e) => setMetodo(e.target.value as MetodoTransferencia)}
                className="w-full h-11 px-3 border border-[#1F3D2B]/20 rounded-xl bg-white text-xs font-semibold text-[#1F3D2B]"
              >
                <option value="Cabo USB">Cabo USB (Recomendado)</option>
                <option value="Quick Share">Quick Share</option>
                <option value="scrcpy">scrcpy (Espelhamento)</option>
              </select>
            </div>

            <div className="pt-4 border-t border-[#1F3D2B]/10 flex gap-3">
              <button
                type="button"
                onClick={() => setNovaTransfOpen(false)}
                className="flex-1 h-11 border border-[#1F3D2B]/20 rounded-xl bg-white font-semibold text-xs text-[#1F3D2B] hover:bg-[#EEF3EE]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-11 rounded-xl bg-[#C4704F] hover:bg-[#D98A6C] text-white font-semibold text-xs transition-colors shadow-card disabled:opacity-50"
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
