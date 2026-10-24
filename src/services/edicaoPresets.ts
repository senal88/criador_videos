import pb from '@/lib/pocketbase/client'
import type { EdicaoPresetRecord } from '@/types/database'

export async function getEdicaoPresets(): Promise<EdicaoPresetRecord[]> {
  const records = await pb.collection('edicao_presets').getFullList<EdicaoPresetRecord>({
    sort: 'created',
  })
  return records
}

export async function createEdicaoPreset(data: {
  name: string
  command: string
  description?: string
}): Promise<EdicaoPresetRecord> {
  const currentUserId = pb.authStore.model?.id
  const record = await pb.collection('edicao_presets').create<EdicaoPresetRecord>({
    ...data,
    owner: currentUserId,
  })
  return record
}

export async function deleteEdicaoPreset(id: string): Promise<boolean> {
  await pb.collection('edicao_presets').delete(id)
  return true
}
