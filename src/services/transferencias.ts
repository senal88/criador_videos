import pb from '@/lib/pocketbase/client'
import type { TransferenciaRecord } from '@/types/database'

export const getTransferencias = async (): Promise<TransferenciaRecord[]> => {
  return pb.collection('transferencias').getFullList<TransferenciaRecord>({
    sort: '-created',
  })
}

export const createTransferencia = async (
  data: Partial<TransferenciaRecord>,
): Promise<TransferenciaRecord> => {
  const currentUserId = pb.authStore.record?.id
  return pb.collection('transferencias').create<TransferenciaRecord>({
    ...data,
    owner: currentUserId,
    status: data.status ?? 'Em andamento',
  })
}

export const updateTransferencia = async (
  id: string,
  data: Partial<TransferenciaRecord>,
): Promise<TransferenciaRecord> => {
  return pb.collection('transferencias').update<TransferenciaRecord>(id, data)
}
