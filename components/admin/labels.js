export const TYPE_LABELS = { characters: 'Personajes', locations: 'Lugares', vehicles: 'Vehículos', facts: 'Datos', trailers: 'Vídeos', theories: 'Teorías', news: 'Noticias' };
export const TYPE_SINGULAR = { characters: 'Personaje', locations: 'Lugar', vehicles: 'Vehículo', facts: 'Dato', trailers: 'Vídeo', theories: 'Teoría', news: 'Noticia' };
export const EVIDENCE_LABELS = { CONFIRMED: 'Confirmado', OBSERVED: 'Observado', REPORTED: 'Reportado', SPECULATION: 'Especulación', DEBUNKED: 'Desmentido' };
export const EVIDENCE_HELP = {
  CONFIRMED: 'Rockstar lo ha dicho de forma oficial.',
  OBSERVED: 'Se ve en material oficial, sin declaración explícita.',
  REPORTED: 'Lo publica una fuente externa identificada.',
  SPECULATION: 'Teoría de la comunidad. No es un hecho.',
  DEBUNKED: 'La evidencia disponible lo contradice.',
};
export const RELATION_LABELS = {
  partner: ['es pareja de', 'es pareja de'], 'works-in': ['trabaja en', 'es lugar de trabajo de'], 'appears-in': ['aparece en', 'es escenario de'],
  'located-in': ['está en', 'incluye'], 'based-in': ['tiene base en', 'es la base de'], employs: ['da trabajo a', 'trabaja para'],
  friend: ['es amigo de', 'es amigo de'], associate: ['es socio de', 'es socio de'], signed: ['ha fichado a', 'ha sido fichado por'],
  features: ['muestra a', 'aparece en'], 'part-of': ['forma parte de', 'incluye'], family: ['es familia de', 'es familia de'],
  rival: ['es rival de', 'es rival de'], owns: ['es dueño de', 'pertenece a'], related: ['está relacionado con', 'está relacionado con'],
};
export const PUBLIC_PATH = (type, slug) => `/${type}/${slug}`;
