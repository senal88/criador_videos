migrate(
  (app) => {
    const collection = new Collection({
      name: 'biblioteca_midia',
      type: 'base',
      listRule: "@request.auth.id != '' && owner = @request.auth.id",
      viewRule: "@request.auth.id != '' && owner = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && owner = @request.auth.id",
      deleteRule: "@request.auth.id != '' && owner = @request.auth.id",
      fields: [
        { name: 'titulo', type: 'text', required: true },
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: ['Áudio', 'Vídeo', 'Música', 'Efeito sonoro'],
          maxSelect: 1,
        },
        { name: 'categoria', type: 'text', required: true },
        { name: 'descricao', type: 'text' },
        { name: 'duracao', type: 'text' },
        { name: 'url', type: 'text' },
        { name: 'favorito', type: 'bool' },
        {
          name: 'arquivo',
          type: 'file',
          maxSelect: 1,
          maxSize: 52428800,
        },
        {
          name: 'owner',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_biblioteca_owner ON biblioteca_midia (owner)',
        'CREATE INDEX idx_biblioteca_tipo ON biblioteca_midia (tipo)',
        'CREATE INDEX idx_biblioteca_favorito ON biblioteca_midia (favorito)',
      ],
    })

    app.save(collection)

    // Seed de itens para a usuária luizfernandomoreirasena@gmail.com
    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'luizfernandomoreirasena@gmail.com')
    } catch (_) {
      return
    }

    const itensSeed = [
      {
        titulo: 'Vinheta Oficial Aline Resolve',
        tipo: 'Áudio',
        categoria: 'Vinheta',
        descricao: 'Abertura oficial com acorde suave e assinatura da marca',
        duracao: '0:05',
        url: 'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3',
        favorito: true,
      },
      {
        titulo: 'Trilha Cuidado e Acolhimento',
        tipo: 'Música',
        categoria: 'Trilha fundo',
        descricao: 'Piano acústico calmo para vídeos de orientação, saúde e rotina do idoso',
        duracao: '2:14',
        url: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
        favorito: true,
      },
      {
        titulo: 'Notificação Suave de Lembrete',
        tipo: 'Efeito sonoro',
        categoria: 'Notificação',
        descricao: 'Chime sutil para destacar dicas de remédios, horários e agendamentos',
        duracao: '0:02',
        url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
        favorito: false,
      },
      {
        titulo: 'Transição Suave Virada de Página',
        tipo: 'Efeito sonoro',
        categoria: 'Transição',
        descricao: 'Som delicado de virar página para blocos de organização e direitos',
        duracao: '0:01',
        url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
        favorito: false,
      },
      {
        titulo: 'Trilha Instrumental Leve e Otimista',
        tipo: 'Música',
        categoria: 'Trilha fundo',
        descricao: 'Violão acústico suave para dicas práticas do dia a dia e autonomia',
        duracao: '1:45',
        url: 'https://assets.mixkit.co/music/preview/mixkit-positive-mind-551.mp3',
        favorito: false,
      },
      {
        titulo: 'Abertura Logo Aline Resolve (9:16)',
        tipo: 'Vídeo',
        categoria: 'Vinheta',
        descricao: 'Clipe animado vertical de 5 segundos com a identidade visual da marca',
        duracao: '0:05',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        favorito: true,
      },
      {
        titulo: 'Aviso Importante — Direitos & Prazos',
        tipo: 'Efeito sonoro',
        categoria: 'Destaque',
        descricao: 'Sino suave e elegante para chamar atenção para datas de órgãos públicos',
        duracao: '0:03',
        url: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
        favorito: false,
      },
      {
        titulo: 'Fundo Ambience Família e Conforto',
        tipo: 'Áudio',
        categoria: 'Trilha fundo',
        descricao: 'Textura acolhedora de cordas quentes para mensagens emotivas aos familiares',
        duracao: '2:50',
        url: 'https://assets.mixkit.co/music/preview/mixkit-relaxing-in-nature-522.mp3',
        favorito: true,
      },
    ]

    for (const item of itensSeed) {
      const record = new Record(collection)
      record.set('titulo', item.titulo)
      record.set('tipo', item.tipo)
      record.set('categoria', item.categoria)
      record.set('descricao', item.descricao)
      record.set('duracao', item.duracao)
      record.set('url', item.url)
      record.set('favorito', item.favorito)
      record.set('owner', user.id)
      app.save(record)
    }
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('biblioteca_midia')
    app.delete(collection)
  },
)
