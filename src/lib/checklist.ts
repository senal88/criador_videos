import type {
  ChecklistEdicao,
  EtapaChecklist,
  ProjetoRecord,
  StatusProjeto,
} from '@/types/database'

export const ETAPAS_CHECKLIST_PADRAO: EtapaChecklist[] = [
  'Cortado',
  'Legendado',
  'Colorido',
  'Áudio normalizado',
  'Exportado',
  'Postado',
]

/**
 * Normaliza o checklist_edicao do projeto garantindo que todas as 6 etapas padrão existam como booleano.
 * Se o projeto não tiver checklist salvo (null/undefined/{}), retorna todas as etapas como false.
 */
export const normalizeChecklistEdicao = (
  raw?: Partial<ChecklistEdicao> | null,
): ChecklistEdicao => {
  const safe = raw || {}
  return {
    Cortado: Boolean(safe.Cortado),
    Legendado: Boolean(safe.Legendado),
    Colorido: Boolean(safe.Colorido),
    'Áudio normalizado': Boolean(safe['Áudio normalizado']),
    Exportado: Boolean(safe.Exportado),
    Postado: Boolean(safe.Postado),
  }
}

/**
 * Conta quantas etapas estão marcadas como concluídas (0 a 6).
 */
export const countEtapasConcluidas = (checklist?: Partial<ChecklistEdicao> | null): number => {
  if (!checklist) return 0
  return ETAPAS_CHECKLIST_PADRAO.filter((etapa) => Boolean(checklist[etapa])).length
}

/**
 * Calcula o percentual de progresso derivado exclusivamente das 6 etapas do checklist.
 * - 0 de 6 = 0%
 * - 1 de 6 = 17% (Math.round(1/6 * 100))
 * - 2 de 6 = 33%
 * - 3 de 6 = 50%
 * - 4 de 6 = 67%
 * - 5 de 6 = 83%
 * - 6 de 6 = 100%
 *
 * Se o projeto não possuir checklist_edicao ou for vazio, retorna 0% (sem inventar valores).
 */
export const calculateProjetoProgresso = (checklist?: Partial<ChecklistEdicao> | null): number => {
  const concluidas = countEtapasConcluidas(checklist)
  if (concluidas === 0) return 0
  return Math.round((concluidas / ETAPAS_CHECKLIST_PADRAO.length) * 100)
}

/**
 * Deriva o progresso diretamente de um ProjetoRecord.
 */
export const getProgressoFromProjeto = (
  projeto?: Pick<ProjetoRecord, 'checklist_edicao'> | null,
): number => {
  if (!projeto) return 0
  return calculateProjetoProgresso(projeto.checklist_edicao)
}

/**
 * Sugere o status do projeto baseado nas etapas concluídas do checklist:
 * - 6 etapas: 'Publicado'
 * - >= 5 etapas: 'Pronto para revisão'
 * - > 0 etapas: 'Em edição'
 * - 0 etapas: mantém status atual ou 'Em gravação'
 */
export const deriveStatusFromChecklist = (
  checklist: Partial<ChecklistEdicao> | null | undefined,
  currentStatus: StatusProjeto = 'Em gravação',
): StatusProjeto => {
  const concluidas = countEtapasConcluidas(checklist)
  if (concluidas === ETAPAS_CHECKLIST_PADRAO.length) {
    return 'Publicado'
  }
  if (concluidas >= 5) {
    return 'Pronto para revisão'
  }
  if (concluidas > 0) {
    return 'Em edição'
  }
  return currentStatus
}
