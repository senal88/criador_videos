migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('biblioteca_midia')

    if (!col.fields.getByName('tags')) {
      col.fields.add(
        new TextField({
          name: 'tags',
        }),
      )
    }

    app.save(col)

    // Atualizar os itens seed existentes com tags em português caso estejam vazias
    const records = app.findRecordsByFilter(
      'biblioteca_midia',
      "tags = '' || tags = null",
      '-created',
      50,
      0,
    )
    for (const rec of records) {
      const titulo = rec.getString('titulo').toLowerCase()
      if (titulo.includes('vinheta')) {
        rec.set('tags', 'vinheta, abertura, marca, identidade, acolhimento')
      } else if (titulo.includes('cuidado')) {
        rec.set('tags', 'trilha, piano, calmo, saúde, rotina, acolhedor')
      } else if (titulo.includes('notificação')) {
        rec.set('tags', 'efeito, chime, remédio, lembrete, aviso')
      } else if (titulo.includes('transição')) {
        rec.set('tags', 'efeito, página, transição, organização, direitos')
      } else if (titulo.includes('otimista')) {
        rec.set('tags', 'música, violão, leve, dicas, autonomia')
      } else if (titulo.includes('abertura') && titulo.includes('logo')) {
        rec.set('tags', 'vídeo, reels, vertical, intro, logo')
      } else if (titulo.includes('aviso')) {
        rec.set('tags', 'efeito, sino, prazos, alerta, direitos')
      } else if (titulo.includes('ambience')) {
        rec.set('tags', 'áudio, cordas, emoção, família, conforto')
      } else {
        rec.set('tags', 'geral, aline resolve')
      }
      app.save(rec)
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('biblioteca_midia')
      const tagsField = col.fields.getByName('tags')
      if (tagsField) {
        col.fields.removeByName('tags')
        app.save(col)
      }
    } catch (_) {}
  },
)
