export const LOCALES = ['en', 'es'];
/** English is the main language: it lives at the root. Spanish lives under /es. */
export const DEFAULT_LOCALE = 'en';
export const LOCALE_COOKIE = 'lr-lang';

export const LOCALE_META = {
  en: { label: 'EN', name: 'English', og: 'en_US', intl: 'en-US' },
  es: { label: 'ES', name: 'Español', og: 'es_ES', intl: 'es-ES' },
};

export function isLocale(v) {
  return LOCALES.includes(v);
}

/** Localized href. English (default) lives at the root, Spanish under /es. */
export function href(lang, path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (!lang || lang === DEFAULT_LOCALE) return clean;
  return clean === '/' ? `/${lang}` : `/${lang}${clean}`;
}

/** Strip a locale prefix from a pathname: /es/news → /news */
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
      vehicles: 'Todos los vehículos vistos en GTA VI, de los confirmados a los observados, cada uno con su nivel de evidencia.',
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
      vehicles: 'Every vehicle seen in GTA VI so far, from confirmed to observed, each with its evidence level.',
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

};

export function getDictionary(lang) {
  return dictionaries[isLocale(lang) ? lang : DEFAULT_LOCALE];
}

/** Pick a localized value: requested language → English → Spanish → first non-empty. Accepts plain strings too. */
export function pick(value, lang) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value !== 'object') return String(value);
  const isEmpty = (v) => v === undefined || v === null || (typeof v === 'string' && !v.trim()) || (typeof v === 'object' && isEmptyDoc(v));
  if (!isEmpty(value[lang])) return value[lang];
  if (!isEmpty(value[DEFAULT_LOCALE])) return value[DEFAULT_LOCALE];
  for (const l of LOCALES) if (!isEmpty(value[l])) return value[l];
  for (const v of Object.values(value)) if (!isEmpty(v)) return v; // legacy pt/fr values
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
  return new Intl.DateTimeFormat(LOCALE_META[lang]?.intl || 'en-US', { timeZone: 'UTC', ...opts }).format(d);
}

export function readingMinutes(docOrText) {
  const text = typeof docOrText === 'string' ? docOrText : docToText(docOrText);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
