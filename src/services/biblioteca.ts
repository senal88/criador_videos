import pb from '@/lib/pocketbase/client'
import type { BibliotecaMidiaRecord, TipoMidia } from '@/types/database'

export async function getMidias(options?: {
  tipo?: TipoMidia | 'Todos'
  apenasFavoritos?: boolean
  busca?: string
  sort?: string
}): Promise<BibliotecaMidiaRecord[]> {
  const filters: string[] = []

  if (options?.tipo && options.tipo !== 'Todos') {
    filters.push(`tipo = '${options.tipo}'`)
  }

  if (options?.apenasFavoritos) {
    filters.push('favorito = true')
  }

  if (options?.busca && options.busca.trim()) {
    const q = options.busca.trim().replace(/'/g, "\\'")
    filters.push(`(titulo ~ '${q}' || descricao ~ '${q}' || tags ~ '${q}' || categoria ~ '${q}')`)
  }

  const sort = options?.sort || '-created'

  return await pb.collection('biblioteca_midia').getFullList<BibliotecaMidiaRecord>({
    filter: filters.length > 0 ? filters.join(' && ') : undefined,
    sort,
  })
}

export async function createMidia(data: {
  titulo: string
  tipo: TipoMidia
  categoria: string
  descricao?: string
  duracao?: string
  url?: string
  tags?: string
  favorito?: boolean
  arquivo?: File
}): Promise<BibliotecaMidiaRecord> {
  const user = pb.authStore.model
  if (!user) throw new Error('Usuário não autenticado')

  if (data.arquivo) {
    const formData = new FormData()
    formData.append('titulo', data.titulo)
    formData.append('tipo', data.tipo)
    formData.append('categoria', data.categoria)
    if (data.descricao) formData.append('descricao', data.descricao)
    if (data.duracao) formData.append('duracao', data.duracao)
    if (data.url) formData.append('url', data.url)
    if (data.tags) formData.append('tags', data.tags)
    formData.append('favorito', data.favorito ? 'true' : 'false')
    formData.append('arquivo', data.arquivo)
    formData.append('owner', user.id)

    return await pb.collection('biblioteca_midia').create<BibliotecaMidiaRecord>(formData)
  }

  return await pb.collection('biblioteca_midia').create<BibliotecaMidiaRecord>({
    ...data,
    owner: user.id,
  })
}

export async function toggleFavoritoMidia(
  id: string,
  favoritoAtual: boolean,
): Promise<BibliotecaMidiaRecord> {
  return await pb.collection('biblioteca_midia').update<BibliotecaMidiaRecord>(id, {
    favorito: !favoritoAtual,
  })
}

export async function updateMidia(
  id: string,
  data: Partial<Omit<BibliotecaMidiaRecord, 'id' | 'created' | 'updated' | 'owner'>>,
): Promise<BibliotecaMidiaRecord> {
  return await pb.collection('biblioteca_midia').update<BibliotecaMidiaRecord>(id, data)
}

export async function deleteMidia(id: string): Promise<boolean> {
  return await pb.collection('biblioteca_midia').delete(id)
}
