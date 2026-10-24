migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const alineEmail = 'alinetorresresolve@gmail.com'

    // 1. Obter ou criar a usuária Aline Torres de forma idempotente
    let userRecord
    try {
      userRecord = app.findAuthRecordByEmail('_pb_users_auth_', alineEmail)
    } catch (_) {
      userRecord = new Record(users)
      userRecord.setEmail(alineEmail)
      userRecord.setPassword('Skip@Pass')
      userRecord.setVerified(true)
      userRecord.set('name', 'Aline Torres')
      app.save(userRecord)
    }

    const userId = userRecord.id
    const projetosCol = app.findCollectionByNameOrId('projetos')
    const postagensCol = app.findCollectionByNameOrId('postagens')
    const transferenciasCol = app.findCollectionByNameOrId('transferencias')
    const tarefasCol = app.findCollectionByNameOrId('tarefas_rapidas')
    const bibliotecaCol = app.findCollectionByNameOrId('biblioteca_midia')

    // 2. Projetos iniciais para a usuária Aline Torres ter conteúdo imediato caso queira
    const sampleProjetos = [
      {
        nome: 'TUT-001 — Aumentar letras do WhatsApp',
        formato: 'REELS 9:16',
        status: 'Em edição',
        progresso: 60,
        data_postagem: '2026-10-28 10:00:00.000Z',
        horario_postagem: '10:00',
      },
      {
        nome: 'TUT-002 — Trocar senha do app do banco',
        formato: 'REELS 9:16',
        status: 'Pronto para revisão',
        progresso: 90,
        data_postagem: '2026-10-29 18:00:00.000Z',
        horario_postagem: '18:00',
      },
      {
        nome: 'TUT-003 — Como organizar contatos no celular',
        formato: 'REELS 9:16',
        status: 'Em gravação',
        progresso: 15,
        data_postagem: '2026-10-31 11:30:00.000Z',
        horario_postagem: '11:30',
      },
      {
        nome: 'TUT-004 — Gravação com Facecam Circular no OBS',
        formato: 'YOUTUBE 16:9',
        status: 'Em gravação',
        progresso: 30,
        data_postagem: '2026-11-02 15:00:00.000Z',
        horario_postagem: '15:00',
      },
    ]

    const createdProjetos = []

    for (const item of sampleProjetos) {
      let proj
      try {
        proj = app.findFirstRecordByFilter(
          'projetos',
          `nome = '${item.nome}' && owner = '${userId}'`,
        )
      } catch (_) {
        proj = new Record(projetosCol)
        proj.set('nome', item.nome)
        proj.set('formato', item.formato)
        proj.set('status', item.status)
        proj.set('progresso', item.progresso)
        proj.set('data_postagem', item.data_postagem)
        proj.set('horario_postagem', item.horario_postagem)
        proj.set('owner', userId)
        app.save(proj)
      }
      createdProjetos.push(proj)
    }

    // 3. Postagens de exemplo vinculadas aos projetos
    const samplePostagens = [
      {
        projetoIdx: 0,
        data_programada: '2026-10-28 10:00:00.000Z',
        horario: '10:00',
        plataforma: 'Instagram Reels',
        status: 'Agendada',
      },
      {
        projetoIdx: 1,
        data_programada: '2026-10-29 18:00:00.000Z',
        horario: '18:00',
        plataforma: 'Instagram Reels',
        status: 'Agendada',
      },
      {
        projetoIdx: 2,
        data_programada: '2026-10-31 11:30:00.000Z',
        horario: '11:30',
        plataforma: 'Instagram Reels',
        status: 'Agendada',
      },
      {
        projetoIdx: 3,
        data_programada: '2026-11-02 15:00:00.000Z',
        horario: '15:00',
        plataforma: 'YouTube',
        status: 'Agendada',
      },
    ]

    for (const post of samplePostagens) {
      const projRecord = createdProjetos[post.projetoIdx]
      if (!projRecord) continue

      try {
        app.findFirstRecordByFilter(
          'postagens',
          `projeto = '${projRecord.id}' && data_programada ~ '${post.data_programada.slice(0, 10)}'`,
        )
      } catch (_) {
        const rec = new Record(postagensCol)
        rec.set('projeto', projRecord.id)
        rec.set('data_programada', post.data_programada)
        rec.set('horario', post.horario)
        rec.set('plataforma', post.plataforma)
        rec.set('status', post.status)
        rec.set('owner', userId)
        app.save(rec)
      }
    }

    // 4. Tarefas rápidas
    const sampleTarefas = [
      { descricao: 'Finalizar edição do TUT-003', concluida: false, ordem: 1 },
      { descricao: 'Gravar teste de 10s do TUT-004', concluida: false, ordem: 2 },
      { descricao: 'Transferir bruto S23 → PC via Cabo USB', concluida: true, ordem: 3 },
      { descricao: 'Revisar legenda linha por linha do TUT-001', concluida: false, ordem: 4 },
    ]

    for (const t of sampleTarefas) {
      try {
        app.findFirstRecordByFilter(
          'tarefas_rapidas',
          `descricao = '${t.descricao}' && owner = '${userId}'`,
        )
      } catch (_) {
        const rec = new Record(tarefasCol)
        rec.set('descricao', t.descricao)
        rec.set('concluida', t.concluida)
        rec.set('ordem', t.ordem)
        rec.set('owner', userId)
        app.save(rec)
      }
    }

    // 5. Transferências recentes
    const sampleTransferencias = [
      {
        arquivo: 'TUT-004_bruto.mp4',
        origem: 'S23',
        destino: 'PC',
        metodo: 'Cabo USB',
        status: 'Concluído',
      },
      {
        arquivo: 'TUT-003_audio_mono.wav',
        origem: 'S23',
        destino: 'PC',
        metodo: 'Quick Share',
        status: 'Concluído',
      },
    ]

    for (const tr of sampleTransferencias) {
      try {
        app.findFirstRecordByFilter(
          'transferencias',
          `arquivo = '${tr.arquivo}' && owner = '${userId}'`,
        )
      } catch (_) {
        const rec = new Record(transferenciasCol)
        rec.set('arquivo', tr.arquivo)
        rec.set('origem', tr.origem)
        rec.set('destino', tr.destino)
        rec.set('metodo', tr.metodo)
        rec.set('status', tr.status)
        rec.set('owner', userId)
        app.save(rec)
      }
    }

    // 6. Biblioteca de mídia para a Aline Torres
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
      try {
        app.findFirstRecordByFilter(
          'biblioteca_midia',
          `titulo = '${item.titulo}' && owner = '${userId}'`,
        )
      } catch (_) {
        const record = new Record(bibliotecaCol)
        record.set('titulo', item.titulo)
        record.set('tipo', item.tipo)
        record.set('categoria', item.categoria)
        record.set('descricao', item.descricao)
        record.set('duracao', item.duracao)
        record.set('url', item.url)
        record.set('favorito', item.favorito)
        record.set('owner', userId)
        app.save(record)
      }
    }
  },
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('_pb_users_auth_', 'alinetorresresolve@gmail.com')
      app.delete(user)
    } catch (_) {}
  },
)
