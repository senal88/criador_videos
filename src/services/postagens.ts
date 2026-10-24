import pb from '@/lib/pocketbase/client'
import type { PostagemRecord } from '@/types/database'

export const getPostagens = async (): Promise<PostagemRecord[]> => {
  return pb.collection('postagens').getFullList<PostagemRecord>({
    sort: 'data_programada',
    expand: 'projeto',
  })
}

export const createPostagem = async (data: Partial<PostagemRecord>): Promise<PostagemRecord> => {
  const currentUserId = pb.authStore.record?.id
  return pb.collection('postagens').create<PostagemRecord>({
    ...data,
    owner: currentUserId,
    status: data.status ?? 'Agendada',
  })
}

export const updatePostagem = async (
  id: string,
  data: Partial<PostagemRecord>,
): Promise<PostagemRecord> => {
  return pb.collection('postagens').update<PostagemRecord>(id, data)
}

export const deletePostagem = async (id: string): Promise<boolean> => {
  return pb.collection('postagens').delete(id)
}
