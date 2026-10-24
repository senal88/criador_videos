migrate(
  (app) => {
    const usersCollection = app.findCollectionByNameOrId('_pb_users_auth_')
    const usersId = usersCollection.id

    // 1. Criar coleção edicao_presets
    const presetsCollection = new Collection({
      name: 'edicao_presets',
      type: 'base',
      listRule: "@request.auth.id != '' && owner = @request.auth.id",
      viewRule: "@request.auth.id != '' && owner = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && owner = @request.auth.id",
      deleteRule: "@request.auth.id != '' && owner = @request.auth.id",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'command', type: 'text', required: true },
        { name: 'description', type: 'text' },
        {
          name: 'owner',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_edicao_presets_owner ON edicao_presets (owner)',
        'CREATE INDEX idx_edicao_presets_name ON edicao_presets (name)',
      ],
    })
    app.save(presetsCollection)

    // 2. Adicionar campo checklist_edicao na coleção projetos se não existir
    const projetosCol = app.findCollectionByNameOrId('projetos')
    if (!projetosCol.fields.getByName('checklist_edicao')) {
      projetosCol.fields.add(new JSONField({ name: 'checklist_edicao' }))
      app.save(projetosCol)
    }

    // 3. Seed dos 3 presets de cor para os usuários existentes (ou admin padrão)
    const seedPresets = [
      {
        name: 'Correção de branco',
        command:
          'ffmpeg -i entrada.mp4 -vf "colorbalance=rs=0.05:gs=-0.02:bs=-0.05" -c:a copy cor_balanceada.mp4',
        description:
          'Equilibra tons azulados da iluminação artificial e neutraliza a tela do celular.',
      },
      {
        name: 'Aumentar contraste',
        command:
          'ffmpeg -i entrada.mp4 -vf "eq=contrast=1.2:brightness=0.02" -c:a copy contraste_elevado.mp4',
        description:
          'Eleva a separação entre texto e fundo, essencial para telas com modo escuro ativado.',
      },
      {
        name: 'Vídeo com calor (tom acolhedor)',
        command:
          'ffmpeg -i entrada.mp4 -vf "colortemperature=temperature=6500" -c:a copy tom_quente.mp4',
        description:
          'Adiciona temperatura acolhedora para tutoriais humanizados com narração amigável.',
      },
    ]

    const users = app.findRecordsByFilter('_pb_users_auth_', '', '-created', 100, 0)
    for (const u of users) {
      for (const sp of seedPresets) {
        try {
          app.findFirstRecordByFilter('edicao_presets', `name = '${sp.name}' && owner = '${u.id}'`)
        } catch (_) {
          const rec = new Record(presetsCollection)
          rec.set('name', sp.name)
          rec.set('command', sp.command)
          rec.set('description', sp.description)
          rec.set('owner', u.id)
          app.save(rec)
        }
      }
    }
  },
  (app) => {
    try {
      const presetsCol = app.findCollectionByNameOrId('edicao_presets')
      app.delete(presetsCol)
    } catch (_) {}

    try {
      const projetosCol = app.findCollectionByNameOrId('projetos')
      const field = projetosCol.fields.getByName('checklist_edicao')
      if (field) {
        projetosCol.fields.remove(field)
        app.save(projetosCol)
      }
    } catch (_) {}
  },
)
