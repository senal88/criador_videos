migrate(
  (app) => {
    const usersCollection = app.findCollectionByNameOrId('_pb_users_auth_')
    const usersId = usersCollection.id

    // 1. projetos
    const projetos = new Collection({
      name: 'projetos',
      type: 'base',
      listRule: "@request.auth.id != '' && owner = @request.auth.id",
      viewRule: "@request.auth.id != '' && owner = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && owner = @request.auth.id",
      deleteRule: "@request.auth.id != '' && owner = @request.auth.id",
      fields: [
        { name: 'nome', type: 'text', required: true },
        {
          name: 'formato',
          type: 'select',
          required: true,
          values: ['REELS 9:16', 'YOUTUBE 16:9'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['Em gravação', 'Em edição', 'Pronto para revisão', 'Publicado'],
          maxSelect: 1,
        },
        { name: 'progresso', type: 'number', min: 0, max: 100 },
        { name: 'data_postagem', type: 'date' },
        { name: 'horario_postagem', type: 'text' },
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
        'CREATE INDEX idx_projetos_status ON projetos (status)',
        'CREATE INDEX idx_projetos_owner ON projetos (owner)',
      ],
    })
    app.save(projetos)
    const projetosId = projetos.id

    // 2. postagens
    const postagens = new Collection({
      name: 'postagens',
      type: 'base',
      listRule: "@request.auth.id != '' && owner = @request.auth.id",
      viewRule: "@request.auth.id != '' && owner = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && owner = @request.auth.id",
      deleteRule: "@request.auth.id != '' && owner = @request.auth.id",
      fields: [
        {
          name: 'projeto',
          type: 'relation',
          required: true,
          collectionId: projetosId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'data_programada', type: 'date', required: true },
        { name: 'horario', type: 'text', required: true },
        {
          name: 'plataforma',
          type: 'select',
          required: true,
          values: ['Instagram Reels', 'YouTube'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['Agendada', 'Publicada', 'Atrasada'],
          maxSelect: 1,
        },
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
        'CREATE INDEX idx_postagens_data_programada ON postagens (data_programada)',
        'CREATE INDEX idx_postagens_status ON postagens (status)',
        'CREATE INDEX idx_postagens_owner ON postagens (owner)',
      ],
    })
    app.save(postagens)

    // 3. transferencias
    const transferencias = new Collection({
      name: 'transferencias',
      type: 'base',
      listRule: "@request.auth.id != '' && owner = @request.auth.id",
      viewRule: "@request.auth.id != '' && owner = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && owner = @request.auth.id",
      deleteRule: "@request.auth.id != '' && owner = @request.auth.id",
      fields: [
        { name: 'arquivo', type: 'text', required: true },
        { name: 'origem', type: 'select', required: true, values: ['S23', 'PC'], maxSelect: 1 },
        { name: 'destino', type: 'select', required: true, values: ['PC', 'S23'], maxSelect: 1 },
        {
          name: 'metodo',
          type: 'select',
          required: true,
          values: ['Cabo USB', 'Quick Share', 'scrcpy'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['Em andamento', 'Concluído', 'Falhou'],
          maxSelect: 1,
        },
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
        'CREATE INDEX idx_transferencias_status ON transferencias (status)',
        'CREATE INDEX idx_transferencias_owner ON transferencias (owner)',
      ],
    })
    app.save(transferencias)

    // 4. tarefas_rapidas
    const tarefasRapidas = new Collection({
      name: 'tarefas_rapidas',
      type: 'base',
      listRule: "@request.auth.id != '' && owner = @request.auth.id",
      viewRule: "@request.auth.id != '' && owner = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && owner = @request.auth.id",
      deleteRule: "@request.auth.id != '' && owner = @request.auth.id",
      fields: [
        { name: 'descricao', type: 'text', required: true },
        { name: 'concluida', type: 'bool' },
        { name: 'ordem', type: 'number' },
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
      indexes: ['CREATE INDEX idx_tarefas_owner ON tarefas_rapidas (owner)'],
    })
    app.save(tarefasRapidas)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('tarefas_rapidas'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('transferencias'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('postagens'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('projetos'))
    } catch (_) {}
  },
)
