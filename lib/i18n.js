export const LOCALES = ['es', 'en', 'pt', 'fr'];
export const DEFAULT_LOCALE = 'es';
export const LOCALE_COOKIE = 'lr-lang';

export const LOCALE_META = {
  es: { label: 'ES', name: 'Español', og: 'es_ES', intl: 'es-ES' },
  en: { label: 'EN', name: 'English', og: 'en_US', intl: 'en-GB' },
  pt: { label: 'PT', name: 'Português', og: 'pt_PT', intl: 'pt-PT' },
  fr: { label: 'FR', name: 'Français', og: 'fr_FR', intl: 'fr-FR' },
};

export function isLocale(v) {
  return LOCALES.includes(v);
}

/** Localized href. Spanish (default) lives at the root, others under /en, /pt, /fr. */
export function href(lang, path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (!lang || lang === DEFAULT_LOCALE) return clean;
  return clean === '/' ? `/${lang}` : `/${lang}${clean}`;
}

/** Strip a locale prefix from a pathname: /en/noticias → /noticias */
export function stripLocale(pathname) {
  const seg = pathname.split('/')[1];
  if (isLocale(seg)) {
    const rest = pathname.slice(seg.length + 1);
    return rest || '/';
  }
  return pathname || '/';
}

export const ENTITY_TYPES = ['characters', 'locations', 'vehicles', 'facts', 'trailers', 'theories'];
export const EVIDENCE = ['CONFIRMED', 'OBSERVED', 'REPORTED', 'SPECULATION', 'DEBUNKED'];

const dictionaries = {
  es: {
    meta: {
      siteName: 'Leonida Records',
      tagline: 'El archivo independiente de GTA VI',
      description: 'Archivo, base de datos y publicación independiente sobre Grand Theft Auto VI: personajes, lugares, vehículos, datos y noticias, siempre enlazados a su fuente.',
    },
    nav: {
      home: 'Inicio', explore: 'Explorar', characters: 'Personajes', locations: 'Lugares', vehicles: 'Vehículos',
      news: 'Noticias', media: 'Media', timeline: 'Cronología', sources: 'Fuentes', search: 'Buscar',
      menu: 'Menú', close: 'Cerrar', language: 'Idioma', skip: 'Saltar al contenido', archive: 'Archivo', more: 'Más',
    },
    types: {
      characters: 'Personajes', locations: 'Lugares', vehicles: 'Vehículos', facts: 'Datos', trailers: 'Vídeos', theories: 'Teorías', news: 'Noticias',
    },
    typeSingular: {
      characters: 'Personaje', locations: 'Lugar', vehicles: 'Vehículo', facts: 'Dato', trailers: 'Vídeo', theories: 'Teoría', news: 'Noticia',
    },
    typeIntro: {
      characters: 'Quién es quién en Leonida, según el material oficial.',
      locations: 'Ciudades, cayos y parques nombrados por Rockstar.',
      vehicles: 'Coches y barcos confirmados en ediciones y reservas.',
      facts: 'Datos verificados, cada uno con su fuente.',
      trailers: 'Tráilers y vídeos oficiales, en orden.',
      theories: 'Especulación de la comunidad, separada de los hechos.',
    },
    evidence: {
      CONFIRMED: { label: 'Confirmado', text: 'Rockstar lo ha dicho de forma oficial.' },
      OBSERVED: { label: 'Observado', text: 'Se ve directamente en material oficial, sin declaración explícita.' },
      REPORTED: { label: 'Reportado', text: 'Lo publica una fuente externa identificada; no está confirmado por Rockstar.' },
      SPECULATION: { label: 'Especulación', text: 'Teoría de la comunidad. No es un hecho.' },
      DEBUNKED: { label: 'Desmentido', text: 'La evidencia disponible lo contradice.' },
    },
    relations: {
      partner: ['Pareja de', 'Pareja de'], 'works-in': ['Trabaja en', 'Lugar de trabajo de'], 'appears-in': ['Aparece en', 'Escenario de'],
      'located-in': ['Está en', 'Incluye'], 'based-in': ['Con base en', 'Base de'], employs: ['Da trabajo a', 'Trabaja para'],
      friend: ['Amigo de', 'Amigo de'], associate: ['Socio de', 'Socio de'], signed: ['Ha fichado a', 'Fichado por'],
      features: ['Muestra a', 'Aparece en'], 'part-of': ['Forma parte de', 'Incluye'], family: ['Familia de', 'Familia de'],
      rival: ['Rival de', 'Rival de'], owns: ['Es dueño de', 'Pertenece a'], related: ['Relacionado con', 'Relacionado con'],
    },
    home: {
      heroLead: 'Todo lo que se sabe de GTA VI, ordenado como un archivo y contado como una revista. Cada dato apunta a su fuente.',
      ctaExplore: 'Entrar al archivo',
      ctaTimes: 'Leer The Leonida Times',
      release: 'Lanzamiento',
      daysLeft: (n) => (n === 1 ? 'Falta 1 día' : `Faltan ${n} días`),
      released: 'Ya disponible',
      records: 'Registros',
      sources: 'Fuentes',
      updated: 'Actualizado',
      unofficial: 'Proyecto de fans, no oficial',
      archiveTitle: 'El archivo',
      archiveLead: 'Cinco puertas de entrada al mismo mapa de datos.',
      recordsCount: (n) => `${n} registros`,
      featuredTitle: 'En portada',
      featuredLead: 'Las fichas que más se consultan esta semana.',
      openRecord: 'Abrir ficha',
      timesLead: 'Actualidad de Leonida, con la fuente siempre a la vista.',
      allNews: 'Todas las noticias',
      worldTitle: 'El mundo de Leonida',
      worldLead: 'El mapa interactivo de la comunidad y los lugares del archivo, en un solo sitio.',
      worldNote: 'Mapa ilustrativo: las posiciones son aproximadas y no reproducen el mapa del juego.',
      map: {
        communityTab: 'Mapa de la comunidad', archiveTab: 'Lugares del archivo',
        tag: 'Mapa comunitario · No oficial',
        title: 'Leonida, pieza a pieza',
        text: 'Un mapa interactivo hecho por fans a partir de tráileres, capturas y teorías. Explora zonas, lugares y comparaciones con Florida.',
        load: 'Cargar mapa aquí', open: 'Pantalla completa', close: 'Cerrar mapa',
        mobileHint: 'En el móvil se usa mejor a pantalla completa.',
        iframeTitle: 'Mapa interactivo de Leonida por State of Leonida',
        creditBefore: 'Mapa creado por la comunidad', creditAfter: '(Mapping Community). Se basa en material oficial y teorías: no es el mapa del juego ni está verificado por Leonida Records.',
        archiveNote: 'Mapa ilustrativo del archivo: posiciones aproximadas de los lugares con ficha.',
      },
      allLocations: 'Todos los lugares',
      mediaTitle: 'Media',
      mediaLead: 'Imágenes y vídeos oficiales, archivados con su crédito.',
      openGallery: 'Abrir la galería',
      latestTitle: 'Últimos registros',
      latestLead: 'Lo último que ha entrado o cambiado en el archivo.',
      seeTimeline: 'Ver la cronología',
    },
    times: {
      name: 'The Leonida Times',
      edition: 'Edición digital',
      motto: 'Noticias de Leonida, con fuente.',
      lead: 'Portada',
      latest: 'Lo último',
      more: 'Más historias',
      sections: 'Secciones',
      all: 'Todas',
      archive: 'Hemeroteca',
      archiveLead: 'Todas las noticias publicadas, por fecha.',
      readMore: 'Leer la noticia',
      minutes: (n) => `${n} min de lectura`,
      by: 'Por',
      source: 'Fuente',
      related: 'Sigue leyendo',
      inThisStory: 'En esta noticia',
      previous: 'Anterior',
      next: 'Siguiente',
      share: 'Compartir',
      copyLink: 'Copiar enlace',
      copied: 'Enlace copiado',
      tags: 'Etiquetas',
      empty: 'Todavía no hay noticias publicadas.',
      page: (n) => `Página ${n}`,
      newer: 'Más recientes',
      older: 'Más antiguas',
    },
    entity: {
      summary: 'Resumen',
      evidence: 'Evidencia',
      primarySource: 'Fuente principal',
      noSource: 'Sin fuente enlazada todavía.',
      openSource: 'Abrir fuente',
      facts: 'Datos',
      factsLead: 'Piezas de evidencia sueltas, cada una con su nivel y su fuente.',
      connections: 'Conexiones',
      connectionsLead: 'Cómo encaja esta ficha en el resto del archivo.',
      gallery: 'Galería',
      relatedNews: 'En las noticias',
      moreOfType: 'Más fichas',
      watch: 'Ver vídeo',
      record: 'Registro',
      type: 'Tipo',
      status: 'Estado',
      updated: 'Actualizado',
      published: 'Publicado',
      publisher: 'Editor',
      tags: 'Etiquetas',
    },
    explore: {
      title: 'Explorar el archivo',
      lead: 'Filtra por tipo y nivel de evidencia, o busca por nombre.',
      filterPlaceholder: 'Filtrar por nombre o etiqueta',
      all: 'Todo',
      allEvidence: 'Cualquier evidencia',
      results: (n) => (n === 1 ? '1 registro' : `${n} registros`),
      empty: 'Ningún registro coincide con estos filtros.',
      reset: 'Quitar filtros',
      apply: 'Filtrar',
    },
    search: {
      title: 'Buscar',
      placeholder: 'Jason, Vice City, tráiler, lanzamiento…',
      hint: 'Escribe al menos dos letras.',
      empty: (q) => `Nada para «${q}». Prueba con otro nombre o revisa la ortografía.`,
      results: (n) => (n === 1 ? '1 resultado' : `${n} resultados`),
      all: 'Todo',
      open: 'Abrir búsqueda',
      shortcut: 'Pulsa / para buscar',
      searching: 'Buscando…',
    },
    timeline: { title: 'Cronología', lead: 'Cada gran anuncio de GTA VI, en orden.', upcoming: 'Próximamente', open: 'Ver registro' },
    media: {
      title: 'Media', lead: 'Vídeos y capturas oficiales, con su crédito y enlazados a sus fichas.',
      videos: 'Vídeos', gallery: 'Galería', watchOn: 'Ver en YouTube', credit: 'Crédito', close: 'Cerrar', prev: 'Anterior', next: 'Siguiente', empty: 'La galería está vacía.',
    },
    sources: {
      title: 'Fuentes', lead: 'De dónde sale cada dato. Si no hay fuente, no es un hecho.',
      levels: 'Niveles de evidencia', linked: (n) => (n === 1 ? '1 registro enlazado' : `${n} registros enlazados`), visit: 'Visitar fuente',
    },
    footer: {
      about: 'Leonida Records es un proyecto de fans independiente. No está afiliado, respaldado ni patrocinado por Rockstar Games ni por Take-Two Interactive.',
      rights: 'Grand Theft Auto, GTA VI y las imágenes oficiales son propiedad de sus respectivos titulares. Se usan con fines informativos y siempre con crédito.',
      method: 'Método: cada registro indica su nivel de evidencia y su fuente.',
      editorial: 'Acceso editorial',
      top: 'Volver arriba',
      project: 'Proyecto',
      read: 'Leer',
    },
    notFound: { title: 'Esta ficha no existe.', lead: 'Puede que la hayan movido o que el enlace esté mal.', back: 'Volver al inicio' },
    common: { loading: 'Cargando…', error: 'Algo ha fallado.', retry: 'Reintentar' },
  },

  en: {
    meta: {
      siteName: 'Leonida Records',
      tagline: 'The independent GTA VI archive',
      description: 'An independent archive, database and publication about Grand Theft Auto VI: characters, locations, vehicles, facts and news — always linked to the source.',
    },
    nav: {
      home: 'Home', explore: 'Explore', characters: 'Characters', locations: 'Locations', vehicles: 'Vehicles',
      news: 'News', media: 'Media', timeline: 'Timeline', sources: 'Sources', search: 'Search',
      menu: 'Menu', close: 'Close', language: 'Language', skip: 'Skip to content', archive: 'Archive', more: 'More',
    },
    types: { characters: 'Characters', locations: 'Locations', vehicles: 'Vehicles', facts: 'Facts', trailers: 'Videos', theories: 'Theories', news: 'News' },
    typeSingular: { characters: 'Character', locations: 'Location', vehicles: 'Vehicle', facts: 'Fact', trailers: 'Video', theories: 'Theory', news: 'Story' },
    typeIntro: {
      characters: 'Who’s who in Leonida, according to official material.',
      locations: 'Cities, keys and parks named by Rockstar.',
      vehicles: 'Cars and boats confirmed in editions and pre-orders.',
      facts: 'Verified facts, each with its source.',
      trailers: 'Official trailers and videos, in order.',
      theories: 'Community speculation, kept apart from facts.',
    },
    evidence: {
      CONFIRMED: { label: 'Confirmed', text: 'Rockstar has stated it officially.' },
      OBSERVED: { label: 'Observed', text: 'Directly visible in official material, without an explicit statement.' },
      REPORTED: { label: 'Reported', text: 'Published by an identified outside source; not confirmed by Rockstar.' },
      SPECULATION: { label: 'Speculation', text: 'Community theory. Not a fact.' },
      DEBUNKED: { label: 'Debunked', text: 'Contradicted by the available evidence.' },
    },
    relations: {
      partner: ['Partner of', 'Partner of'], 'works-in': ['Works in', 'Workplace of'], 'appears-in': ['Appears in', 'Setting for'],
      'located-in': ['Located in', 'Includes'], 'based-in': ['Based in', 'Home base of'], employs: ['Employs', 'Works for'],
      friend: ['Friend of', 'Friend of'], associate: ['Associate of', 'Associate of'], signed: ['Signed', 'Signed by'],
      features: ['Features', 'Featured in'], 'part-of': ['Part of', 'Includes'], family: ['Family of', 'Family of'],
      rival: ['Rival of', 'Rival of'], owns: ['Owns', 'Owned by'], related: ['Related to', 'Related to'],
    },
    home: {
      heroLead: 'Everything known about GTA VI, filed like an archive and told like a magazine. Every fact points to its source.',
      ctaExplore: 'Enter the archive',
      ctaTimes: 'Read The Leonida Times',
      release: 'Release',
      daysLeft: (n) => (n === 1 ? '1 day to go' : `${n} days to go`),
      released: 'Out now',
      records: 'Records',
      sources: 'Sources',
      updated: 'Updated',
      unofficial: 'Unofficial fan project',
      archiveTitle: 'The archive',
      archiveLead: 'Five ways into the same map of data.',
      recordsCount: (n) => `${n} records`,
      featuredTitle: 'Front page',
      featuredLead: 'The records people are opening most this week.',
      openRecord: 'Open record',
      timesLead: 'News from Leonida, with the source always in view.',
      allNews: 'All news',
      worldTitle: 'The world of Leonida',
      worldLead: 'The community’s interactive map and the archive’s places, in one spot.',
      worldNote: 'Illustrative map: positions are approximate and do not reproduce the in-game map.',
      map: {
        communityTab: 'Community map', archiveTab: 'Archive places',
        tag: 'Community map · Unofficial',
        title: 'Leonida, piece by piece',
        text: 'A fan-made interactive map built from trailers, screenshots and theories. Explore areas, landmarks and real-life Florida comparisons.',
        load: 'Load map here', open: 'Full screen', close: 'Close map',
        mobileHint: 'On phones it works best in full screen.',
        iframeTitle: 'Interactive map of Leonida by State of Leonida',
        creditBefore: 'Map made by the', creditAfter: 'community (Mapping Community). Based on official material and theories: it is not the in-game map and is not verified by Leonida Records.',
        archiveNote: 'Illustrative archive map: approximate positions of places with a record.',
      },
      allLocations: 'All locations',
      mediaTitle: 'Media',
      mediaLead: 'Official images and videos, archived with credit.',
      openGallery: 'Open the gallery',
      latestTitle: 'Latest records',
      latestLead: 'What was most recently added or changed.',
      seeTimeline: 'See the timeline',
    },
    times: {
      name: 'The Leonida Times', edition: 'Digital edition', motto: 'News from Leonida, sourced.',
      lead: 'Front page', latest: 'Latest', more: 'More stories', sections: 'Sections', all: 'All',
      archive: 'Archive', archiveLead: 'Every published story, by date.', readMore: 'Read the story',
      minutes: (n) => `${n} min read`, by: 'By', source: 'Source', related: 'Keep reading', inThisStory: 'In this story',
      previous: 'Previous', next: 'Next', share: 'Share', copyLink: 'Copy link', copied: 'Link copied', tags: 'Tags',
      empty: 'No stories have been published yet.', page: (n) => `Page ${n}`, newer: 'Newer', older: 'Older',
    },
    entity: {
      summary: 'Summary', evidence: 'Evidence', primarySource: 'Primary source', noSource: 'No source linked yet.', openSource: 'Open source',
      facts: 'Facts', factsLead: 'Individual pieces of evidence, each with its level and source.',
      connections: 'Connections', connectionsLead: 'How this record fits into the rest of the archive.',
      gallery: 'Gallery', relatedNews: 'In the news', moreOfType: 'More records', watch: 'Watch video',
      record: 'Record', type: 'Type', status: 'Status', updated: 'Updated', published: 'Published', publisher: 'Publisher', tags: 'Tags',
    },
    explore: {
      title: 'Explore the archive', lead: 'Filter by type and evidence level, or search by name.',
      filterPlaceholder: 'Filter by name or tag', all: 'All', allEvidence: 'Any evidence',
      results: (n) => (n === 1 ? '1 record' : `${n} records`), empty: 'No records match these filters.', reset: 'Clear filters', apply: 'Filter',
    },
    search: {
      title: 'Search', placeholder: 'Jason, Vice City, trailer, release…', hint: 'Type at least two letters.',
      empty: (q) => `Nothing for “${q}”. Try another name or check the spelling.`,
      results: (n) => (n === 1 ? '1 result' : `${n} results`), all: 'All', open: 'Open search', shortcut: 'Press / to search', searching: 'Searching…',
    },
    timeline: { title: 'Timeline', lead: 'Every major GTA VI announcement, in order.', upcoming: 'Upcoming', open: 'Open record' },
    media: {
      title: 'Media', lead: 'Official videos and screenshots, credited and linked to their records.',
      videos: 'Videos', gallery: 'Gallery', watchOn: 'Watch on YouTube', credit: 'Credit', close: 'Close', prev: 'Previous', next: 'Next', empty: 'The gallery is empty.',
    },
    sources: {
      title: 'Sources', lead: 'Where every fact comes from. No source, no fact.',
      levels: 'Evidence levels', linked: (n) => (n === 1 ? '1 linked record' : `${n} linked records`), visit: 'Visit source',
    },
    footer: {
      about: 'Leonida Records is an independent fan project. It is not affiliated with, endorsed or sponsored by Rockstar Games or Take-Two Interactive.',
      rights: 'Grand Theft Auto, GTA VI and official imagery belong to their respective owners. They are used for information purposes and always credited.',
      method: 'Method: every record shows its evidence level and its source.',
      editorial: 'Editorial access', top: 'Back to top', project: 'Project', read: 'Read',
    },
    notFound: { title: 'This record doesn’t exist.', lead: 'It may have moved, or the link may be wrong.', back: 'Back to home' },
    common: { loading: 'Loading…', error: 'Something went wrong.', retry: 'Try again' },
  },

  pt: {
    meta: {
      siteName: 'Leonida Records',
      tagline: 'O arquivo independente de GTA VI',
      description: 'Arquivo, base de dados e publicação independente sobre Grand Theft Auto VI: personagens, locais, veículos, dados e notícias, sempre ligados à fonte.',
    },
    nav: {
      home: 'Início', explore: 'Explorar', characters: 'Personagens', locations: 'Locais', vehicles: 'Veículos',
      news: 'Notícias', media: 'Media', timeline: 'Cronologia', sources: 'Fontes', search: 'Pesquisar',
      menu: 'Menu', close: 'Fechar', language: 'Idioma', skip: 'Saltar para o conteúdo', archive: 'Arquivo', more: 'Mais',
    },
    types: { characters: 'Personagens', locations: 'Locais', vehicles: 'Veículos', facts: 'Dados', trailers: 'Vídeos', theories: 'Teorias', news: 'Notícias' },
    typeSingular: { characters: 'Personagem', locations: 'Local', vehicles: 'Veículo', facts: 'Dado', trailers: 'Vídeo', theories: 'Teoria', news: 'Notícia' },
    typeIntro: {
      characters: 'Quem é quem em Leonida, segundo o material oficial.',
      locations: 'Cidades, ilhas e parques nomeados pela Rockstar.',
      vehicles: 'Carros e barcos confirmados em edições e pré-reservas.',
      facts: 'Dados verificados, cada um com a sua fonte.',
      trailers: 'Trailers e vídeos oficiais, por ordem.',
      theories: 'Especulação da comunidade, separada dos factos.',
    },
    evidence: {
      CONFIRMED: { label: 'Confirmado', text: 'A Rockstar afirmou-o oficialmente.' },
      OBSERVED: { label: 'Observado', text: 'Visível diretamente em material oficial, sem declaração explícita.' },
      REPORTED: { label: 'Reportado', text: 'Publicado por uma fonte externa identificada; não confirmado pela Rockstar.' },
      SPECULATION: { label: 'Especulação', text: 'Teoria da comunidade. Não é um facto.' },
      DEBUNKED: { label: 'Desmentido', text: 'Contrariado pela evidência disponível.' },
    },
    relations: {
      partner: ['Parceiro de', 'Parceiro de'], 'works-in': ['Trabalha em', 'Local de trabalho de'], 'appears-in': ['Aparece em', 'Cenário de'],
      'located-in': ['Fica em', 'Inclui'], 'based-in': ['Sediado em', 'Base de'], employs: ['Emprega', 'Trabalha para'],
      friend: ['Amigo de', 'Amigo de'], associate: ['Sócio de', 'Sócio de'], signed: ['Contratou', 'Contratado por'],
      features: ['Mostra', 'Aparece em'], 'part-of': ['Faz parte de', 'Inclui'], family: ['Família de', 'Família de'],
      rival: ['Rival de', 'Rival de'], owns: ['É dono de', 'Pertence a'], related: ['Relacionado com', 'Relacionado com'],
    },
    home: {
      heroLead: 'Tudo o que se sabe sobre GTA VI, arquivado como um registo e contado como uma revista. Cada dado aponta para a sua fonte.',
      ctaExplore: 'Entrar no arquivo', ctaTimes: 'Ler The Leonida Times', release: 'Lançamento',
      daysLeft: (n) => (n === 1 ? 'Falta 1 dia' : `Faltam ${n} dias`), released: 'Já disponível',
      records: 'Registos', sources: 'Fontes', updated: 'Atualizado', unofficial: 'Projeto de fãs, não oficial',
      archiveTitle: 'O arquivo', archiveLead: 'Cinco portas de entrada para o mesmo mapa de dados.', recordsCount: (n) => `${n} registos`,
      featuredTitle: 'Em destaque', featuredLead: 'Os registos mais abertos esta semana.', openRecord: 'Abrir registo',
      timesLead: 'A atualidade de Leonida, com a fonte sempre à vista.', allNews: 'Todas as notícias',
      worldTitle: 'O mundo de Leonida', worldLead: 'O mapa interativo da comunidade e os locais do arquivo, num só sítio.',
      worldNote: 'Mapa ilustrativo: as posições são aproximadas e não reproduzem o mapa do jogo.', allLocations: 'Todos os locais',
      map: {
        communityTab: 'Mapa da comunidade', archiveTab: 'Locais do arquivo',
        tag: 'Mapa comunitário · Não oficial',
        title: 'Leonida, peça a peça',
        text: 'Um mapa interativo feito por fãs a partir de trailers, capturas e teorias. Explora zonas, locais e comparações com a Flórida.',
        load: 'Carregar mapa aqui', open: 'Ecrã inteiro', close: 'Fechar mapa',
        mobileHint: 'No telemóvel funciona melhor em ecrã inteiro.',
        iframeTitle: 'Mapa interativo de Leonida por State of Leonida',
        creditBefore: 'Mapa criado pela comunidade', creditAfter: '(Mapping Community). Baseia-se em material oficial e teorias: não é o mapa do jogo nem foi verificado pela Leonida Records.',
        archiveNote: 'Mapa ilustrativo do arquivo: posições aproximadas dos locais com ficha.',
      },
      mediaTitle: 'Media', mediaLead: 'Imagens e vídeos oficiais, arquivados com crédito.', openGallery: 'Abrir a galeria',
      latestTitle: 'Últimos registos', latestLead: 'O que entrou ou mudou mais recentemente.', seeTimeline: 'Ver a cronologia',
    },
    times: {
      name: 'The Leonida Times', edition: 'Edição digital', motto: 'Notícias de Leonida, com fonte.',
      lead: 'Primeira página', latest: 'Últimas', more: 'Mais histórias', sections: 'Secções', all: 'Todas',
      archive: 'Hemeroteca', archiveLead: 'Todas as notícias publicadas, por data.', readMore: 'Ler a notícia',
      minutes: (n) => `${n} min de leitura`, by: 'Por', source: 'Fonte', related: 'Continua a ler', inThisStory: 'Nesta notícia',
      previous: 'Anterior', next: 'Seguinte', share: 'Partilhar', copyLink: 'Copiar ligação', copied: 'Ligação copiada', tags: 'Etiquetas',
      empty: 'Ainda não há notícias publicadas.', page: (n) => `Página ${n}`, newer: 'Mais recentes', older: 'Mais antigas',
    },
    entity: {
      summary: 'Resumo', evidence: 'Evidência', primarySource: 'Fonte principal', noSource: 'Ainda sem fonte ligada.', openSource: 'Abrir fonte',
      facts: 'Dados', factsLead: 'Peças de evidência individuais, cada uma com o seu nível e fonte.',
      connections: 'Ligações', connectionsLead: 'Como este registo encaixa no resto do arquivo.',
      gallery: 'Galeria', relatedNews: 'Nas notícias', moreOfType: 'Mais registos', watch: 'Ver vídeo',
      record: 'Registo', type: 'Tipo', status: 'Estado', updated: 'Atualizado', published: 'Publicado', publisher: 'Editor', tags: 'Etiquetas',
    },
    explore: {
      title: 'Explorar o arquivo', lead: 'Filtra por tipo e nível de evidência, ou pesquisa por nome.',
      filterPlaceholder: 'Filtrar por nome ou etiqueta', all: 'Tudo', allEvidence: 'Qualquer evidência',
      results: (n) => (n === 1 ? '1 registo' : `${n} registos`), empty: 'Nenhum registo corresponde a estes filtros.', reset: 'Limpar filtros', apply: 'Filtrar',
    },
    search: {
      title: 'Pesquisar', placeholder: 'Jason, Vice City, trailer, lançamento…', hint: 'Escreve pelo menos duas letras.',
      empty: (q) => `Nada para «${q}». Tenta outro nome ou verifica a ortografia.`,
      results: (n) => (n === 1 ? '1 resultado' : `${n} resultados`), all: 'Tudo', open: 'Abrir pesquisa', shortcut: 'Carrega em / para pesquisar', searching: 'A pesquisar…',
    },
    timeline: { title: 'Cronologia', lead: 'Cada grande anúncio de GTA VI, por ordem.', upcoming: 'Em breve', open: 'Ver registo' },
    media: {
      title: 'Media', lead: 'Vídeos e capturas oficiais, com crédito e ligados aos registos.',
      videos: 'Vídeos', gallery: 'Galeria', watchOn: 'Ver no YouTube', credit: 'Crédito', close: 'Fechar', prev: 'Anterior', next: 'Seguinte', empty: 'A galeria está vazia.',
    },
    sources: {
      title: 'Fontes', lead: 'De onde vem cada dado. Sem fonte, não é facto.',
      levels: 'Níveis de evidência', linked: (n) => (n === 1 ? '1 registo ligado' : `${n} registos ligados`), visit: 'Visitar fonte',
    },
    footer: {
      about: 'Leonida Records é um projeto de fãs independente. Não está afiliado, apoiado nem patrocinado pela Rockstar Games ou pela Take-Two Interactive.',
      rights: 'Grand Theft Auto, GTA VI e as imagens oficiais pertencem aos respetivos titulares. São usadas para fins informativos e sempre com crédito.',
      method: 'Método: cada registo indica o seu nível de evidência e a sua fonte.',
      editorial: 'Acesso editorial', top: 'Voltar ao topo', project: 'Projeto', read: 'Ler',
    },
    notFound: { title: 'Este registo não existe.', lead: 'Pode ter sido movido ou a ligação pode estar errada.', back: 'Voltar ao início' },
    common: { loading: 'A carregar…', error: 'Algo correu mal.', retry: 'Tentar de novo' },
  },

  fr: {
    meta: {
      siteName: 'Leonida Records',
      tagline: 'L’archive indépendante de GTA VI',
      description: 'Archive, base de données et publication indépendante sur Grand Theft Auto VI : personnages, lieux, véhicules, données et actualités, toujours reliés à leur source.',
    },
    nav: {
      home: 'Accueil', explore: 'Explorer', characters: 'Personnages', locations: 'Lieux', vehicles: 'Véhicules',
      news: 'Actualités', media: 'Médias', timeline: 'Chronologie', sources: 'Sources', search: 'Rechercher',
      menu: 'Menu', close: 'Fermer', language: 'Langue', skip: 'Aller au contenu', archive: 'Archive', more: 'Plus',
    },
    types: { characters: 'Personnages', locations: 'Lieux', vehicles: 'Véhicules', facts: 'Données', trailers: 'Vidéos', theories: 'Théories', news: 'Actualités' },
    typeSingular: { characters: 'Personnage', locations: 'Lieu', vehicles: 'Véhicule', facts: 'Donnée', trailers: 'Vidéo', theories: 'Théorie', news: 'Article' },
    typeIntro: {
      characters: 'Qui est qui à Leonida, d’après le matériel officiel.',
      locations: 'Villes, îles et parcs nommés par Rockstar.',
      vehicles: 'Voitures et bateaux confirmés dans les éditions et précommandes.',
      facts: 'Des données vérifiées, chacune avec sa source.',
      trailers: 'Bandes-annonces et vidéos officielles, dans l’ordre.',
      theories: 'Spéculations de la communauté, séparées des faits.',
    },
    evidence: {
      CONFIRMED: { label: 'Confirmé', text: 'Rockstar l’a déclaré officiellement.' },
      OBSERVED: { label: 'Observé', text: 'Visible directement dans le matériel officiel, sans déclaration explicite.' },
      REPORTED: { label: 'Signalé', text: 'Publié par une source externe identifiée ; non confirmé par Rockstar.' },
      SPECULATION: { label: 'Spéculation', text: 'Théorie de la communauté. Ce n’est pas un fait.' },
      DEBUNKED: { label: 'Démenti', text: 'Contredit par les preuves disponibles.' },
    },
    relations: {
      partner: ['Partenaire de', 'Partenaire de'], 'works-in': ['Travaille à', 'Lieu de travail de'], 'appears-in': ['Apparaît à', 'Décor de'],
      'located-in': ['Situé à', 'Comprend'], 'based-in': ['Basé à', 'Base de'], employs: ['Emploie', 'Travaille pour'],
      friend: ['Ami de', 'Ami de'], associate: ['Associé de', 'Associé de'], signed: ['A signé', 'Signé par'],
      features: ['Montre', 'Apparaît dans'], 'part-of': ['Fait partie de', 'Comprend'], family: ['Famille de', 'Famille de'],
      rival: ['Rival de', 'Rival de'], owns: ['Possède', 'Appartient à'], related: ['Lié à', 'Lié à'],
    },
    home: {
      heroLead: 'Tout ce que l’on sait de GTA VI, classé comme une archive et raconté comme un magazine. Chaque donnée renvoie à sa source.',
      ctaExplore: 'Entrer dans l’archive', ctaTimes: 'Lire The Leonida Times', release: 'Sortie',
      daysLeft: (n) => (n === 1 ? 'J-1' : `J-${n}`), released: 'Disponible',
      records: 'Dossiers', sources: 'Sources', updated: 'Mis à jour', unofficial: 'Projet de fans non officiel',
      archiveTitle: 'L’archive', archiveLead: 'Cinq entrées vers la même carte de données.', recordsCount: (n) => `${n} dossiers`,
      featuredTitle: 'À la une', featuredLead: 'Les dossiers les plus consultés cette semaine.', openRecord: 'Ouvrir le dossier',
      timesLead: 'L’actualité de Leonida, la source toujours en vue.', allNews: 'Toutes les actualités',
      worldTitle: 'Le monde de Leonida', worldLead: 'La carte interactive de la communauté et les lieux de l’archive, au même endroit.',
      worldNote: 'Carte illustrative : les positions sont approximatives et ne reproduisent pas la carte du jeu.', allLocations: 'Tous les lieux',
      map: {
        communityTab: 'Carte de la communauté', archiveTab: 'Lieux de l’archive',
        tag: 'Carte communautaire · Non officielle',
        title: 'Leonida, pièce par pièce',
        text: 'Une carte interactive créée par des fans à partir des bandes-annonces, captures et théories. Explorez zones, lieux et comparaisons avec la Floride.',
        load: 'Charger la carte ici', open: 'Plein écran', close: 'Fermer la carte',
        mobileHint: 'Sur mobile, elle s’utilise mieux en plein écran.',
        iframeTitle: 'Carte interactive de Leonida par State of Leonida',
        creditBefore: 'Carte créée par la communauté', creditAfter: '(Mapping Community). Basée sur le matériel officiel et des théories : ce n’est pas la carte du jeu et elle n’est pas vérifiée par Leonida Records.',
        archiveNote: 'Carte illustrative de l’archive : positions approximatives des lieux fichés.',
      },
      mediaTitle: 'Médias', mediaLead: 'Images et vidéos officielles, archivées avec leur crédit.', openGallery: 'Ouvrir la galerie',
      latestTitle: 'Derniers dossiers', latestLead: 'Ce qui a été ajouté ou modifié récemment.', seeTimeline: 'Voir la chronologie',
    },
    times: {
      name: 'The Leonida Times', edition: 'Édition numérique', motto: 'L’actualité de Leonida, sourcée.',
      lead: 'À la une', latest: 'Dernières nouvelles', more: 'Autres articles', sections: 'Rubriques', all: 'Toutes',
      archive: 'Archives', archiveLead: 'Tous les articles publiés, par date.', readMore: 'Lire l’article',
      minutes: (n) => `${n} min de lecture`, by: 'Par', source: 'Source', related: 'À lire aussi', inThisStory: 'Dans cet article',
      previous: 'Précédent', next: 'Suivant', share: 'Partager', copyLink: 'Copier le lien', copied: 'Lien copié', tags: 'Mots-clés',
      empty: 'Aucun article publié pour le moment.', page: (n) => `Page ${n}`, newer: 'Plus récents', older: 'Plus anciens',
    },
    entity: {
      summary: 'Résumé', evidence: 'Preuves', primarySource: 'Source principale', noSource: 'Aucune source liée pour l’instant.', openSource: 'Ouvrir la source',
      facts: 'Données', factsLead: 'Des preuves unitaires, chacune avec son niveau et sa source.',
      connections: 'Connexions', connectionsLead: 'Comment ce dossier s’inscrit dans le reste de l’archive.',
      gallery: 'Galerie', relatedNews: 'Dans l’actualité', moreOfType: 'Autres dossiers', watch: 'Voir la vidéo',
      record: 'Dossier', type: 'Type', status: 'Statut', updated: 'Mis à jour', published: 'Publié', publisher: 'Éditeur', tags: 'Mots-clés',
    },
    explore: {
      title: 'Explorer l’archive', lead: 'Filtrez par type et niveau de preuve, ou cherchez par nom.',
      filterPlaceholder: 'Filtrer par nom ou mot-clé', all: 'Tout', allEvidence: 'Toutes preuves',
      results: (n) => (n === 1 ? '1 dossier' : `${n} dossiers`), empty: 'Aucun dossier ne correspond à ces filtres.', reset: 'Effacer les filtres', apply: 'Filtrer',
    },
    search: {
      title: 'Rechercher', placeholder: 'Jason, Vice City, bande-annonce, sortie…', hint: 'Tapez au moins deux lettres.',
      empty: (q) => `Rien pour « ${q} ». Essayez un autre nom ou vérifiez l’orthographe.`,
      results: (n) => (n === 1 ? '1 résultat' : `${n} résultats`), all: 'Tout', open: 'Ouvrir la recherche', shortcut: 'Appuyez sur / pour rechercher', searching: 'Recherche…',
    },
    timeline: { title: 'Chronologie', lead: 'Chaque grande annonce de GTA VI, dans l’ordre.', upcoming: 'À venir', open: 'Voir le dossier' },
    media: {
      title: 'Médias', lead: 'Vidéos et captures officielles, créditées et reliées à leurs dossiers.',
      videos: 'Vidéos', gallery: 'Galerie', watchOn: 'Voir sur YouTube', credit: 'Crédit', close: 'Fermer', prev: 'Précédent', next: 'Suivant', empty: 'La galerie est vide.',
    },
    sources: {
      title: 'Sources', lead: 'D’où vient chaque donnée. Pas de source, pas de fait.',
      levels: 'Niveaux de preuve', linked: (n) => (n === 1 ? '1 dossier lié' : `${n} dossiers liés`), visit: 'Consulter la source',
    },
    footer: {
      about: 'Leonida Records est un projet de fans indépendant. Il n’est ni affilié, ni approuvé, ni sponsorisé par Rockstar Games ou Take-Two Interactive.',
      rights: 'Grand Theft Auto, GTA VI et les images officielles appartiennent à leurs propriétaires respectifs. Elles sont utilisées à titre informatif et toujours créditées.',
      method: 'Méthode : chaque dossier indique son niveau de preuve et sa source.',
      editorial: 'Accès éditorial', top: 'Retour en haut', project: 'Projet', read: 'Lire',
    },
    notFound: { title: 'Ce dossier n’existe pas.', lead: 'Il a peut-être été déplacé, ou le lien est erroné.', back: 'Retour à l’accueil' },
    common: { loading: 'Chargement…', error: 'Une erreur est survenue.', retry: 'Réessayer' },
  },
};

export function getDictionary(lang) {
  return dictionaries[isLocale(lang) ? lang : DEFAULT_LOCALE];
}

/** Pick a localized value: requested language → Spanish → first non-empty. Accepts plain strings too. */
export function pick(value, lang) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value !== 'object') return String(value);
  const isEmpty = (v) => v === undefined || v === null || (typeof v === 'string' && !v.trim()) || (typeof v === 'object' && isEmptyDoc(v));
  if (!isEmpty(value[lang])) return value[lang];
  if (!isEmpty(value[DEFAULT_LOCALE])) return value[DEFAULT_LOCALE];
  for (const l of LOCALES) if (!isEmpty(value[l])) return value[l];
  return '';
}

export function isEmptyDoc(d) {
  if (!d || typeof d !== 'object') return true;
  if (d.type !== 'doc') return false;
  return !docToText(d).trim();
}

export function docToText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (node.type === 'text') return node.text || '';
  const inner = (node.content || []).map(docToText).join(node.type === 'doc' ? '\n' : '');
  return inner;
}

/** Which locales have a non-empty value for a localized field */
export function filledLocales(value) {
  if (!value || typeof value !== 'object') return [];
  return LOCALES.filter((l) => {
    const v = value[l];
    if (!v) return false;
    if (typeof v === 'string') return v.trim().length > 0;
    return !isEmptyDoc(v);
  });
}

export function formatDate(date, lang, opts = { day: 'numeric', month: 'long', year: 'numeric' }) {
  if (!date) return '';
  const d = typeof date === 'string' && date.length === 10 ? new Date(`${date}T12:00:00Z`) : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(LOCALE_META[lang]?.intl || 'es-ES', { timeZone: 'UTC', ...opts }).format(d);
}

export function readingMinutes(docOrText) {
  const text = typeof docOrText === 'string' ? docOrText : docToText(docOrText);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
