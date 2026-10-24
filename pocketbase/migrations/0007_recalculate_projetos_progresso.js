migrate(
  (app) => {
    // Buscar todos os projetos cadastrados
    const projetos = app.findRecordsByFilter('projetos', '', '', 0, 0)
    const etapasPadrao = [
      'Cortado',
      'Legendado',
      'Colorido',
      'Áudio normalizado',
      'Exportado',
      'Postado',
    ]

    for (const proj of projetos) {
      let checklist = {}
      try {
        const rawJson = proj.getString('checklist_edicao')
        if (rawJson && rawJson !== 'null') {
          checklist = JSON.parse(rawJson) || {}
        }
      } catch (_) {
        checklist = {}
      }

      // Contar quantas das 6 etapas estão marcadas como verdadeiras
      let concluidas = 0
      for (const etapa of etapasPadrao) {
        if (checklist && checklist[etapa] === true) {
          concluidas++
        }
      }

      // Se não há nenhuma etapa marcada (ou checklist vazio), progresso é 0%
      const novoProgresso =
        concluidas > 0 ? Math.round((concluidas / etapasPadrao.length) * 100) : 0

      proj.set('progresso', novoProgresso)
      app.save(proj)
    }
  },
  (app) => {
    // Reversão opcional (não-destrutiva)
  },
)
