import pb from '@/lib/pocketbase/client'
import type { ProjetoRecord } from '@/types/database'
import { calculateProjetoProgresso } from '@/lib/checklist'

export const getProjetos = async (): Promise<ProjetoRecord[]> => {
  return pb.collection('projetos').getFullList<ProjetoRecord>({
    sort: '-created',
  })
}

export const getProjetoById = async (id: string): Promise<ProjetoRecord> => {
  return pb.collection('projetos').getOne<ProjetoRecord>(id)
}

export const createProjeto = async (data: Partial<ProjetoRecord>): Promise<ProjetoRecord> => {
  const currentUserId = pb.authStore.record?.id
  const progressoDerivado = calculateProjetoProgresso(data.checklist_edicao)
  return pb.collection('projetos').create<ProjetoRecord>({
    ...data,
    owner: currentUserId,
    progresso: progressoDerivado,
    status: data.status ?? 'Em gravação',
    formato: data.formato ?? 'REELS 9:16',
  })
}

export const updateProjeto = async (
  id: string,
  data: Partial<ProjetoRecord>,
): Promise<ProjetoRecord> => {
  const payload = { ...data }
  // Se checklist_edicao foi enviado no update, garantir que progresso sempre reflita o checklist
  if (data.checklist_edicao !== undefined) {
    payload.progresso = calculateProjetoProgresso(data.checklist_edicao)
  }
  return pb.collection('projetos').update<ProjetoRecord>(id, payload)
}

export const deleteProjeto = async (id: string): Promise<boolean> => {
  return pb.collection('projetos').delete(id)
}
