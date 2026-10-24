migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const defaultEmail = 'luizfernandomoreirasena@gmail.com'

    // 1. Obter ou criar o usuário seed
    let userRecord
    try {
      userRecord = app.findAuthRecordByEmail('_pb_users_auth_', defaultEmail)
    } catch (_) {
      userRecord = new Record(users)
      userRecord.setEmail(defaultEmail)
      userRecord.setPassword('Skip@Pass')
      userRecord.setVerified(true)
      userRecord.set('name', 'Aline Resolve')
      app.save(userRecord)
    }

    const userId = userRecord.id
    const projetosCol = app.findCollectionByNameOrId('projetos')
    const postagensCol = app.findCollectionByNameOrId('postagens')
    const transferenciasCol = app.findCollectionByNameOrId('transferencias')
    const tarefasCol = app.findCollectionByNameOrId('tarefas_rapidas')

    // 2. Criar projetos seed
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

    // 3. Postagens nos próximos dias vinculadas aos projetos
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
      {
        arquivo: 'TUT-005_teste_10s.mp4',
        origem: 'S23',
        destino: 'PC',
        metodo: 'scrcpy',
        status: 'Em andamento',
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
  },
  (app) => {
    // down rollback se necessário
  },
)
