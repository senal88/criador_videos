import pb from '@/lib/pocketbase/client'
import type { TarefaRapidaRecord } from '@/types/database'

export const getTarefasRapidas = async (): Promise<TarefaRapidaRecord[]> => {
  return pb.collection('tarefas_rapidas').getFullList<TarefaRapidaRecord>({
    sort: 'ordem,created',
  })
}

export const toggleTarefaRapida = async (
  id: string,
  concluida: boolean,
): Promise<TarefaRapidaRecord> => {
  return pb.collection('tarefas_rapidas').update<TarefaRapidaRecord>(id, {
    concluida,
  })
}

export const createTarefaRapida = async (
  descricao: string,
  ordem?: number,
): Promise<TarefaRapidaRecord> => {
  const currentUserId = pb.authStore.record?.id
  return pb.collection('tarefas_rapidas').create<TarefaRapidaRecord>({
    descricao,
    concluida: false,
    ordem: ordem ?? 1,
    owner: currentUserId,
  })
}

export const deleteTarefaRapida = async (id: string): Promise<boolean> => {
  return pb.collection('tarefas_rapidas').delete(id)
}
