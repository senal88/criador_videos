import pb from '@/lib/pocketbase/client'
import type { ProjetoRecord } from '@/types/database'

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
  return pb.collection('projetos').create<ProjetoRecord>({
    ...data,
    owner: currentUserId,
    progresso: data.progresso ?? 0,
    status: data.status ?? 'Em gravação',
    formato: data.formato ?? 'REELS 9:16',
  })
}

export const updateProjeto = async (
  id: string,
  data: Partial<ProjetoRecord>,
): Promise<ProjetoRecord> => {
  return pb.collection('projetos').update<ProjetoRecord>(id, data)
}

export const deleteProjeto = async (id: string): Promise<boolean> => {
  return pb.collection('projetos').delete(id)
}
