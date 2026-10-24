import type { RecordModel } from 'pocketbase'

export type FormatoProjeto = 'REELS 9:16' | 'YOUTUBE 16:9'
export type StatusProjeto = 'Em gravação' | 'Em edição' | 'Pronto para revisão' | 'Publicado'
export type PlataformaPostagem = 'Instagram Reels' | 'YouTube'
export type StatusPostagem = 'Agendada' | 'Publicada' | 'Atrasada'
export type Dispositivo = 'S23' | 'PC'
export type MetodoTransferencia = 'Cabo USB' | 'Quick Share' | 'scrcpy'
export type StatusTransferencia = 'Em andamento' | 'Concluído' | 'Falhou'

export type EtapaChecklist =
  | 'Cortado'
  | 'Legendado'
  | 'Colorido'
  | 'Áudio normalizado'
  | 'Exportado'
  | 'Postado'

export type ChecklistEdicao = Record<EtapaChecklist, boolean>

export interface ProjetoRecord extends RecordModel {
  nome: string
  formato: FormatoProjeto
  status: StatusProjeto
  progresso: number
  data_postagem?: string
  horario_postagem?: string
  checklist_edicao?: ChecklistEdicao
  owner: string
}

export interface EdicaoPresetRecord extends RecordModel {
  name: string
  command: string
  description?: string
  owner: string
}

export interface PostagemRecord extends RecordModel {
  projeto: string
  data_programada: string
  horario: string
  plataforma: PlataformaPostagem
  status: StatusPostagem
  owner: string
  expand?: {
    projeto?: ProjetoRecord
  }
}

export interface TransferenciaRecord extends RecordModel {
  arquivo: string
  origem: Dispositivo
  destino: Dispositivo
  metodo: MetodoTransferencia
  status: StatusTransferencia
  owner: string
}

export interface TarefaRapidaRecord extends RecordModel {
  descricao: string
  concluida: boolean
  ordem?: number
  owner: string
}

export type TipoMidia = 'Áudio' | 'Vídeo' | 'Música' | 'Efeito sonoro'

export interface BibliotecaMidiaRecord extends RecordModel {
  titulo: string
  tipo: TipoMidia
  categoria: string
  descricao?: string
  duracao?: string
  url?: string
  tags?: string
  favorito?: boolean
  arquivo?: string
  owner: string
}
