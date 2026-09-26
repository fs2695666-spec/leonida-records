// Leonida Records — initial content.
//
// This file is the single source of truth for the INITIAL content only:
//   * `npm run seed:generate` turns it into supabase/seed.sql
//   * the public site uses it as a read-only demo when Supabase is not configured
// Once Supabase is connected, all content lives in the database and is edited
// from /admin. You never need to edit this file to publish content.

const RS = 'https://www.rockstargames.com/VI/_next/static/media/';
const img = (file) => `${RS}${file}?akim=1&imdensity=1&imwidth=3840`;

export const IMAGES = {
  jasonLucia: img('Jason_and_Lucia_01.0naeahss9-1x6.jpg'),
  jasonLuciaWide: img('Jason_and_Lucia_01_landscape.12x2gvspcm_3m.jpg'),
  jasonLuciaMotel: img('Jason_and_Lucia_Motel_landscape.08edvuwtm-20v.jpg'),
  jason01: img('Jason_Duval_01.07m377xeb6jhq.jpg'),
  jason07: img('Jason_Duval_07.0ca326xbl~oyh.jpg'),
  cal: img('Cal_Hampton_landscape.17k7bnt3myg.2.jpg'),
  cal01: img('Cal_Hampton_01.0xlil231_osh4.jpg'),
  boobie: img('Boobie_Ike_landscape.0ldnbn87k-8mq.jpg'),
  drequan: img('DreQuan_Priest_landscape.0_b7hszyze6cy.jpg'),
  realDimez: img('Real_Dimez_landscape.0637akp_a5a_q.jpg'),
  raul: img('Raul_Bautista_landscape.11_3hd0fr69~j.jpg'),
  brian: img('Brian_Heder_landscape.0a-egj5b8yo1q.jpg'),
  viceCity: img('Vice_City_10.0f1q-xa_4q8r2.jpg'),
  keys: img('Leonida_Keys_06.0eapr3hbeyewx.jpg'),
  portGellhorn: img('Port_Gellhorn_06.13ghhmb440r6e.jpg'),
  ambrosia: img('Ambrosia_Postcard_landscape.0gd~9a41ia-rt.jpg'),
  grassrivers: img('Grassrivers_Postcard_landscape.15-10i39nhex2.jpg'),
  kalaga: img('Mount_Kalaga_National_Park_Postcard_landscape.0c1cb4ocq16n3.jpg'),
  cheetah: img('ULTIMATE_EDITION_GROTTI_CHEETAH_01.0a.wy3s_ogjey.jpg'),
  album: img('The_Album_Cover_Art_landscape.000ifb9a.j-gp.jpg'),
  cover: img('Official_Cover_Art_landscape.12.uu2irr.2_a.jpg'),
};

// Tiptap / ProseMirror document helper: strings → paragraphs, ['h2', text] → heading,
// ['quote', text] → blockquote.
export function doc(...blocks) {
  return {
    type: 'doc',
    content: blocks.map((b) => {
      if (Array.isArray(b) && b[0] === 'h2') return { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: b[1] }] };
      if (Array.isArray(b) && b[0] === 'quote') return { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: b[1] }] }] };
      return { type: 'paragraph', content: [{ type: 'text', text: b }] };
    }),
  };
}

export const sources = [
  { key: 'src-gta6', name: 'Grand Theft Auto VI', publisher: 'Rockstar Games', kind: 'Official website', published_at: '2026-09-24', url: 'https://www.rockstargames.com/VI' },
  { key: 'src-only-in-leonida', name: 'Only in Leonida', publisher: 'Rockstar Games', kind: 'Official character / world page', published_at: '2026-09-24', url: 'https://www.rockstargames.com/VI/only-in-leonida' },
  { key: 'src-extended-look', name: 'Grand Theft Auto VI: An Extended Look', publisher: 'Rockstar Games', kind: 'Official video page', published_at: '2026-08-27', url: 'https://www.rockstargames.com/VI/an-extended-look' },
  { key: 'src-videos', name: 'Grand Theft Auto VI — Videos', publisher: 'Rockstar Games', kind: 'Official media library', published_at: '2026-09-24', url: 'https://www.rockstargames.com/VI/media/videos' },
  { key: 'src-screens', name: 'Grand Theft Auto VI — Screenshots', publisher: 'Rockstar Games', kind: 'Official media library', published_at: '2026-09-24', url: 'https://www.rockstargames.com/VI/media/screenshots' },
  { key: 'src-album', name: 'Grand Theft Auto VI: The Album', publisher: 'Rockstar Games', kind: 'Newswire', published_at: '2026-09-17', url: 'https://www.rockstargames.com/newswire/article/7599a881942544/announcing-grand-theft-auto-vi-the-album-coming-november-19' },
  { key: 'src-editions', name: 'Grand Theft Auto VI — Editions', publisher: 'Rockstar Games', kind: 'Official editions page', published_at: '2026-09-24', url: 'https://www.rockstargames.com/VI/editions' },
  { key: 'src-support', name: 'Grand Theft Auto VI Platforms, Editions, and Versions', publisher: 'Rockstar Games Support', kind: 'Support article', published_at: '2026-08-18', url: 'https://support.rockstargames.com/articles/4QfG4FmZCf5W1gS8jy4UVT/grand-theft-auto-vi-platform-editions-and-versions' },
  { key: 'src-preorder', name: 'Pre-Order Grand Theft Auto VI on June 25', publisher: 'Rockstar Games', kind: 'Newswire', published_at: '2026-06-24', url: 'https://www.rockstargames.com/newswire/article/5171972o3ak5oa/pre-order-grand-theft-auto-vi-on-june-25' },
];

const character = (key, slug, n, title, image, featured, t) => ({
  key, type: 'characters', slug, status: 'CONFIRMED', featured, image, source: 'src-only-in-leonida',
  tags: ['character', ...(t.tags || [])],
  eyebrow: { es: `Personaje ${n}`, en: `Character ${n}`, pt: `Personagem ${n}`, fr: `Personnage ${n}` },
  title: { es: title }, short: t.short, desc: t.desc, quote: t.quote || {},
});

const place = (key, slug, n, title, image, status, featured, map, t) => ({
  key, type: 'locations', slug, status, featured, image, source: t.source || 'src-only-in-leonida',
  tags: ['location', ...(t.tags || [])], map,
  eyebrow: { es: `Lugar ${n}`, en: `Location ${n}`, pt: `Local ${n}`, fr: `Lieu ${n}` },
  title: t.title || { es: title }, short: t.short, desc: t.desc, quote: t.quote || {},
});

const vehicle = (key, slug, n, title, image, source, featured, t) => ({
  key, type: 'vehicles', slug, status: 'CONFIRMED', featured, image, source,
  tags: ['vehicle', ...(t.tags || [])],
  eyebrow: { es: `Vehículo ${n}`, en: `Vehicle ${n}`, pt: `Veículo ${n}`, fr: `Véhicule ${n}` },
  title: { es: title }, short: t.short, desc: t.desc, quote: {},
});

const fact = (key, slug, source, featured, t) => ({
  key, type: 'facts', slug, status: 'CONFIRMED', featured, image: t.image || null, source,
  tags: ['fact', ...(t.tags || [])],
  eyebrow: { es: 'Dato verificado', en: 'Verified fact', pt: 'Dado verificado', fr: 'Donnée vérifiée' },
  title: t.title, short: t.short, desc: t.desc, quote: {},
});

export const entities = [
  character('char-jason-duval', 'jason-duval', '001', 'Jason Duval', IMAGES.jason01, true, {
    tags: ['protagonist', 'keys'],
    short: {
      es: 'Uno de los dos protagonistas de GTA VI, ligado a los Keys y arrastrado a una historia criminal junto a Lucia.',
      en: 'One of GTA VI’s two protagonists, tied to the Keys and pulled into a crime story alongside Lucia.',
      pt: 'Um dos dois protagonistas de GTA VI, ligado aos Keys e arrastado para uma história criminosa ao lado de Lucia.',
      fr: 'L’un des deux protagonistes de GTA VI, lié aux Keys et entraîné dans une histoire criminelle aux côtés de Lucia.',
    },
    desc: {
      es: doc('Rockstar explica que Jason creció rodeado de estafadores y delincuentes, pasó un tiempo en el ejército y después trabajó para traficantes locales en los Keys.', 'Su encuentro con Lucia se convierte en el eje de la historia.'),
      en: doc('Rockstar says Jason grew up around grifters and crooks, spent time in the Army and later worked for local drug runners in the Keys.', 'Meeting Lucia becomes the pivot of the story.'),
      pt: doc('A Rockstar conta que Jason cresceu rodeado de vigaristas e criminosos, passou pelo exército e depois trabalhou para traficantes locais nos Keys.', 'O encontro com Lucia torna-se o eixo da história.'),
      fr: doc('Selon Rockstar, Jason a grandi entouré d’escrocs et de voyous, est passé par l’armée puis a travaillé pour des trafiquants locaux dans les Keys.', 'Sa rencontre avec Lucia devient le pivot de l’histoire.'),
    },
    quote: {
      es: 'Jason quiere una vida sencilla, pero las cosas no dejan de complicarse.',
      en: 'Jason wants an easy life, but things just keep getting harder.',
      pt: 'Jason quer uma vida simples, mas as coisas não param de complicar.',
      fr: 'Jason veut une vie simple, mais tout ne cesse de se compliquer.',
    },
  }),
  character('char-lucia-caminos', 'lucia-caminos', '002', 'Lucia Caminos', IMAGES.jasonLuciaWide, true, {
    tags: ['protagonist'],
    short: {
      es: 'La segunda protagonista de GTA VI: recién salida de prisión y decidida a cambiar las reglas del juego.',
      en: 'GTA VI’s second protagonist: fresh out of prison and determined to change the odds.',
      pt: 'A segunda protagonista de GTA VI: acabada de sair da prisão e decidida a mudar as regras do jogo.',
      fr: 'La seconde protagoniste de GTA VI : tout juste sortie de prison et décidée à changer la donne.',
    },
    desc: {
      es: doc('Según Rockstar, la lucha de Lucia por su familia terminó llevándola a prisión en Leonida.', 'Tras salir, está decidida a cambiar sus circunstancias, y Jason pasa a ser una pieza central de ese plan.'),
      en: doc('Rockstar says Lucia’s fight for her family landed her in prison in Leonida.', 'Now out, she is set on changing her circumstances — and Jason becomes central to that plan.'),
      pt: doc('Segundo a Rockstar, a luta de Lucia pela família acabou por levá-la à prisão em Leonida.', 'Depois de sair, está decidida a mudar a sua situação, e Jason torna-se peça central desse plano.'),
      fr: doc('Selon Rockstar, le combat de Lucia pour sa famille l’a menée en prison à Leonida.', 'Libérée, elle est déterminée à changer sa situation, et Jason devient la pièce centrale de ce plan.'),
    },
    quote: {
      es: 'El padre de Lucia le enseñó a pelear desde que empezó a caminar.',
      en: 'Lucia’s father taught her to fight as soon as she could walk.',
      pt: 'O pai de Lucia ensinou-a a lutar desde que começou a andar.',
      fr: 'Le père de Lucia lui a appris à se battre dès qu’elle a su marcher.',
    },
  }),
  character('char-cal-hampton', 'cal-hampton', '003', 'Cal Hampton', IMAGES.cal, false, {
    short: {
      es: 'Amigo de Jason y socio de Brian, obsesionado con las comunicaciones de la Guardia Costera.',
      en: 'Jason’s friend and Brian’s associate, with an ear glued to Coast Guard radio chatter.',
      pt: 'Amigo de Jason e sócio de Brian, obcecado com as comunicações da Guarda Costeira.',
      fr: 'Ami de Jason et associé de Brian, l’oreille collée aux communications des garde-côtes.',
    },
    desc: {
      es: doc('Rockstar describe a Cal como amigo de Jason y socio de Brian. Pasa el tiempo en casa escuchando las comunicaciones de la Guardia Costera y cultivando una paranoia casi rutinaria.'),
      en: doc('Rockstar describes Cal as Jason’s friend and a fellow associate of Brian. He spends his time at home snooping on Coast Guard communications and embracing casual paranoia.'),
      pt: doc('A Rockstar descreve Cal como amigo de Jason e sócio de Brian. Passa o tempo em casa a escutar as comunicações da Guarda Costeira, com uma paranoia quase rotineira.'),
      fr: doc('Rockstar décrit Cal comme l’ami de Jason et un associé de Brian. Il passe son temps chez lui à espionner les communications des garde-côtes, dans une paranoïa presque routinière.'),
    },
    quote: { es: '¿Y si todo lo que hay en internet fuera verdad?', en: 'What if everything on the internet was true?', pt: 'E se tudo o que está na internet fosse verdade?', fr: 'Et si tout ce qu’on lit sur internet était vrai ?' },
  }),
  character('char-boobie-ike', 'boobie-ike', '004', 'Boobie Ike', IMAGES.boobie, false, {
    tags: ['vice city', 'only raw'],
    short: {
      es: 'Leyenda local de Vice City con un imperio legal de inmuebles, un club y un estudio de grabación.',
      en: 'A Vice City local legend whose legitimate empire spans real estate, a club and a recording studio.',
      pt: 'Lenda local de Vice City com um império legal de imóveis, um clube e um estúdio de gravação.',
      fr: 'Légende locale de Vice City, à la tête d’un empire légal : immobilier, un club et un studio.',
    },
    desc: {
      es: doc('Rockstar presenta a Boobie como una leyenda de Vice City que levantó un imperio entre inmuebles, un club y un estudio de grabación. Trabaja con Dre’Quan en Only Raw Records.'),
      en: doc('Rockstar presents Boobie as a Vice City legend who built an empire across real estate, a club and a recording studio. He partners with Dre’Quan on Only Raw Records.'),
      pt: doc('A Rockstar apresenta Boobie como uma lenda de Vice City que construiu um império entre imóveis, um clube e um estúdio. Trabalha com Dre’Quan na Only Raw Records.'),
      fr: doc('Rockstar présente Boobie comme une légende de Vice City qui a bâti un empire entre immobilier, club et studio d’enregistrement. Il s’associe à Dre’Quan sur Only Raw Records.'),
    },
    quote: { es: 'Todo es cuestión de corazón: el Jack of Hearts.', en: 'It’s all about heart — the Jack of Hearts.', pt: 'É tudo uma questão de coração: o Jack of Hearts.', fr: 'Tout est une question de cœur : le Jack of Hearts.' },
  }),
  character('char-drequan-priest', 'drequan-priest', '005', 'Dre’Quan Priest', IMAGES.drequan, false, {
    tags: ['music', 'only raw'],
    short: {
      es: 'Aspirante a magnate musical que intenta pasar del trapicheo callejero a la escena de Vice City.',
      en: 'An aspiring music mogul trying to move from street hustling into the Vice City scene.',
      pt: 'Aspirante a magnata da música que tenta passar do negócio de rua para a cena de Vice City.',
      fr: 'Aspirant magnat de la musique qui tente de passer de la débrouille de rue à la scène de Vice City.',
    },
    desc: {
      es: doc('Rockstar dice que Dre’Quan era más buscavidas que gánster y que siempre quiso entrar en la música. Ficha a Real Dimez para Only Raw Records mientras se abre camino en la escena local.'),
      en: doc('Rockstar says Dre’Quan was always more hustler than gangster and always wanted to break into music. He signs Real Dimez to Only Raw Records as he works the local scene.'),
      pt: doc('A Rockstar diz que Dre’Quan sempre foi mais desenrascado do que gangster e sempre quis entrar na música. Contrata as Real Dimez para a Only Raw Records.'),
      fr: doc('Selon Rockstar, Dre’Quan a toujours été plus débrouillard que gangster et rêvait de musique. Il signe Real Dimez chez Only Raw Records.'),
    },
    quote: { es: 'Only Raw… Records', en: 'Only Raw… Records', pt: 'Only Raw… Records', fr: 'Only Raw… Records' },
  }),
  character('char-real-dimez', 'real-dimez', '006', 'Real Dimez', IMAGES.realDimez, false, {
    tags: ['music', 'social media'],
    short: {
      es: 'Bae-Luxe y Roxy, un dúo que convierte el trapicheo local en dinero y fama a golpe de música y redes.',
      en: 'Bae-Luxe and Roxy, a duo turning local hustle into money and notoriety through music and social media.',
      pt: 'Bae-Luxe e Roxy, uma dupla que transforma o negócio local em dinheiro e fama com música e redes sociais.',
      fr: 'Bae-Luxe et Roxy, un duo qui transforme la débrouille locale en argent et notoriété grâce à la musique et aux réseaux.',
    },
    desc: {
      es: doc('Rockstar describe a Real Dimez como amigas desde el instituto que construyeron una audiencia con temas de rap y redes sociales antes de fichar por Only Raw Records.'),
      en: doc('Rockstar describes Real Dimez as friends since high school who built a following with rap tracks and social media before signing to Only Raw Records.'),
      pt: doc('A Rockstar descreve as Real Dimez como amigas desde o secundário que conquistaram público com rap e redes sociais antes de assinar pela Only Raw Records.'),
      fr: doc('Rockstar décrit Real Dimez comme deux amies depuis le lycée qui ont bâti une audience avec du rap et les réseaux sociaux avant de signer chez Only Raw Records.'),
    },
    quote: { es: 'Vídeos virales. Hooks virales.', en: 'Viral videos. Viral hooks.', pt: 'Vídeos virais. Refrões virais.', fr: 'Vidéos virales. Refrains viraux.' },
  }),
  character('char-raul-bautista', 'raul-bautista', '007', 'Raul Bautista', IMAGES.raul, false, {
    tags: ['heists'],
    short: {
      es: 'Un atracador de bancos veterano que siempre busca gente dispuesta a asumir más riesgos.',
      en: 'A seasoned bank robber always looking for people willing to take bigger risks.',
      pt: 'Um assaltante de bancos veterano sempre à procura de quem aceite correr mais riscos.',
      fr: 'Un braqueur de banques chevronné, toujours en quête de partenaires prêts à prendre plus de risques.',
    },
    desc: {
      es: doc('Rockstar describe a Raul como un atracador seguro de sí mismo, carismático y astuto, cuyo apetito por el riesgo no deja de subir las apuestas.'),
      en: doc('Rockstar describes Raul as a confident, charming and cunning bank robber whose appetite for risk keeps raising the stakes.'),
      pt: doc('A Rockstar descreve Raul como um assaltante confiante, carismático e astuto, cujo apetite pelo risco não para de subir a parada.'),
      fr: doc('Rockstar décrit Raul comme un braqueur sûr de lui, charmeur et rusé, dont l’appétit du risque fait sans cesse monter les enjeux.'),
    },
    quote: { es: 'La experiencia cuenta.', en: 'Experience counts.', pt: 'A experiência conta.', fr: 'L’expérience compte.' },
  }),
  character('char-brian-heder', 'brian-heder', '008', 'Brian Heder', IMAGES.brian, false, {
    tags: ['keys', 'boat yard'],
    short: {
      es: 'Traficante de la vieja escuela de los Keys que sigue moviendo mercancía desde su astillero.',
      en: 'An old-school Keys drug runner still moving product through his boat yard.',
      pt: 'Traficante da velha guarda dos Keys que continua a movimentar mercadoria a partir do seu estaleiro.',
      fr: 'Trafiquant de la vieille école des Keys qui écoule toujours sa marchandise depuis son chantier naval.',
    },
    desc: {
      es: doc('Rockstar describe a Brian como un veterano de la época del contrabando en los Keys. Jason vive gratis en una de sus propiedades a cambio de ayudar con las extorsiones locales.'),
      en: doc('Rockstar describes Brian as a veteran of the Keys’ smuggling era. Jason lives rent-free at one of his properties in exchange for help with local shakedowns.'),
      pt: doc('A Rockstar descreve Brian como um veterano da era do contrabando nos Keys. Jason vive de graça numa das suas propriedades em troca de ajuda com extorsões locais.'),
      fr: doc('Rockstar décrit Brian comme un vétéran de l’époque de la contrebande dans les Keys. Jason loge gratuitement chez lui en échange de coups de main pour des extorsions locales.'),
    },
    quote: { es: 'No hay nada mejor que un Mudslide al atardecer.', en: 'Nothing better than a Mudslide at sunset.', pt: 'Nada melhor do que um Mudslide ao pôr do sol.', fr: 'Rien de mieux qu’un Mudslide au coucher du soleil.' },
  }),

  place('loc-vice-city', 'vice-city', '001', 'Vice City', IMAGES.viceCity, 'CONFIRMED', true, { x: 71, y: 64 }, {
    tags: ['vice city', 'leonida'],
    short: {
      es: 'La ciudad bañada en neón en el centro del regreso de GTA VI a la Vice City actual.',
      en: 'The neon-soaked city at the heart of GTA VI’s return to modern-day Vice City.',
      pt: 'A cidade banhada em néon no centro do regresso de GTA VI à Vice City atual.',
      fr: 'La ville baignée de néons au cœur du retour de GTA VI dans la Vice City d’aujourd’hui.',
    },
    desc: {
      es: doc('Rockstar presenta GTA VI como un regreso a la Vice City contemporánea, dentro del estado ficticio de Leonida.'),
      en: doc('Rockstar frames GTA VI as a return to modern-day Vice City, inside the fictional state of Leonida.'),
      pt: doc('A Rockstar apresenta GTA VI como um regresso à Vice City contemporânea, dentro do estado fictício de Leonida.'),
      fr: doc('Rockstar présente GTA VI comme un retour dans la Vice City contemporaine, au sein de l’État fictif de Leonida.'),
    },
    quote: { es: 'Vice City, USA.', en: 'Vice City, USA.', pt: 'Vice City, USA.', fr: 'Vice City, USA.' },
  }),
  place('loc-leonida', 'state-of-leonida', '002', 'Leonida', null, 'CONFIRMED', false, { x: 44, y: 34 }, {
    source: 'src-gta6', tags: ['leonida'],
    title: { es: 'Estado de Leonida', en: 'State of Leonida', pt: 'Estado de Leonida', fr: 'État de Leonida' },
    short: {
      es: 'El estado ficticio por el que se extiende la conspiración criminal del juego.',
      en: 'The fictional state across which the game’s criminal conspiracy stretches.',
      pt: 'O estado fictício por onde se estende a conspiração criminosa do jogo.',
      fr: 'L’État fictif sur lequel s’étend la conspiration criminelle du jeu.',
    },
    desc: {
      es: doc('La descripción oficial del juego sitúa la conspiración a lo largo del estado de Leonida, con Vice City como gran escenario urbano.'),
      en: doc('The official game description says the conspiracy stretches across the state of Leonida, with Vice City as the central urban setting.'),
      pt: doc('A descrição oficial do jogo situa a conspiração ao longo do estado de Leonida, com Vice City como grande cenário urbano.'),
      fr: doc('La description officielle du jeu situe la conspiration à travers l’État de Leonida, Vice City en étant le décor urbain central.'),
    },
  }),
  place('loc-leonida-keys', 'leonida-keys', '003', 'Leonida Keys', IMAGES.keys, 'OBSERVED', true, { x: 52, y: 88 }, {
    tags: ['keys'],
    short: {
      es: 'Los Keys, donde Jason trabaja para traficantes locales y Brian gestiona un astillero.',
      en: 'The Keys, where Jason works for local drug runners and Brian runs a boat yard.',
      pt: 'Os Keys, onde Jason trabalha para traficantes locais e Brian gere um estaleiro.',
      fr: 'Les Keys, où Jason travaille pour des trafiquants locaux et où Brian tient un chantier naval.',
    },
    desc: {
      es: doc('El material oficial de personajes sitúa a Jason y a Brian en los Keys, lo que convierte la zona en uno de los lugares más recurrentes del material previo al lanzamiento.'),
      en: doc('Rockstar’s official character material places Jason and Brian in the Keys, making the region one of the clearest recurring locations in the pre-release material.'),
      pt: doc('O material oficial de personagens coloca Jason e Brian nos Keys, tornando a zona um dos locais mais recorrentes do material de pré-lançamento.'),
      fr: doc('Le matériel officiel sur les personnages place Jason et Brian dans les Keys, ce qui fait de la région l’un des lieux les plus récurrents avant la sortie.'),
    },
  }),
  place('loc-port-gellhorn', 'port-gellhorn', '004', 'Port Gellhorn', IMAGES.portGellhorn, 'OBSERVED', false, { x: 24, y: 22 }, {
    tags: ['port gellhorn'],
    short: {
      es: 'Un destino de Leonida nombrado en el material oficial del mundo de Rockstar.',
      en: 'A Leonida destination named in Rockstar’s official world material.',
      pt: 'Um destino de Leonida referido no material oficial do mundo da Rockstar.',
      fr: 'Une destination de Leonida citée dans le matériel officiel de Rockstar.',
    },
    desc: {
      es: doc('Port Gellhorn aparece entre los destinos de Only in Leonida y en la biblioteca oficial de capturas y postales.'),
      en: doc('Port Gellhorn appears among the destinations in Only in Leonida and in the official screenshot and postcard library.'),
      pt: doc('Port Gellhorn surge entre os destinos de Only in Leonida e na biblioteca oficial de capturas e postais.'),
      fr: doc('Port Gellhorn figure parmi les destinations d’Only in Leonida et dans la bibliothèque officielle de captures et de cartes postales.'),
    },
  }),
  place('loc-ambrosia', 'ambrosia', '005', 'Ambrosia', IMAGES.ambrosia, 'OBSERVED', false, { x: 47, y: 44 }, {
    tags: ['ambrosia'],
    short: {
      es: 'Un destino de Leonida presente en el material oficial del mundo de Rockstar.',
      en: 'A Leonida destination featured in Rockstar’s official world material.',
      pt: 'Um destino de Leonida presente no material oficial do mundo da Rockstar.',
      fr: 'Une destination de Leonida présente dans le matériel officiel de Rockstar.',
    },
    desc: {
      es: doc('Ambrosia es uno de los destinos que Rockstar destaca en Only in Leonida y en su media oficial.'),
      en: doc('Ambrosia is one of the destinations Rockstar surfaces in Only in Leonida and its official media.'),
      pt: doc('Ambrosia é um dos destinos que a Rockstar destaca em Only in Leonida e nos seus media oficiais.'),
      fr: doc('Ambrosia est l’une des destinations mises en avant par Rockstar dans Only in Leonida et ses médias officiels.'),
    },
  }),
  place('loc-grassrivers', 'grassrivers', '006', 'Grassrivers', IMAGES.grassrivers, 'OBSERVED', false, { x: 55, y: 66 }, {
    tags: ['grassrivers'],
    short: {
      es: 'Humedales identificados en el índice oficial del mundo de Leonida.',
      en: 'Wetlands identified in the official Leonida world index.',
      pt: 'Zonas húmidas identificadas no índice oficial do mundo de Leonida.',
      fr: 'Zones humides identifiées dans l’index officiel du monde de Leonida.',
    },
    desc: {
      es: doc('Rockstar identifica Grassrivers de forma explícita en Only in Leonida y en su biblioteca multimedia.'),
      en: doc('Grassrivers is explicitly identified by Rockstar in Only in Leonida and its media library.'),
      pt: doc('A Rockstar identifica Grassrivers explicitamente em Only in Leonida e na sua biblioteca multimédia.'),
      fr: doc('Rockstar identifie explicitement Grassrivers dans Only in Leonida et sa médiathèque.'),
    },
  }),
  place('loc-mount-kalaga', 'mount-kalaga-national-park', '007', 'Mount Kalaga National Park', IMAGES.kalaga, 'OBSERVED', false, { x: 30, y: 12 }, {
    tags: ['mount kalaga'],
    short: {
      es: 'Un parque nacional del índice del mundo de Leonida.',
      en: 'A national park on the Leonida world index.',
      pt: 'Um parque nacional do índice do mundo de Leonida.',
      fr: 'Un parc national de l’index du monde de Leonida.',
    },
    desc: {
      es: doc('Only in Leonida destaca Mount Kalaga como uno de los lugares para explorar en el estado.'),
      en: doc('Only in Leonida highlights Mount Kalaga as one of the places to explore across the state.'),
      pt: doc('Only in Leonida destaca Mount Kalaga como um dos locais a explorar no estado.'),
      fr: doc('Only in Leonida met en avant Mount Kalaga parmi les lieux à explorer dans l’État.'),
    },
  }),

  vehicle('veh-grotti-cheetah-95', '1995-grotti-cheetah', '001', '’95 Grotti Cheetah', IMAGES.cheetah, 'src-editions', true, {
    tags: ['grotti', 'ultimate edition'],
    short: {
      es: 'Un Grotti Cheetah de 1995 incluido como ventaja de la Ultimate Edition.',
      en: 'A 1995 Grotti Cheetah included as an Ultimate Edition benefit.',
      pt: 'Um Grotti Cheetah de 1995 incluído como benefício da Ultimate Edition.',
      fr: 'Une Grotti Cheetah de 1995 incluse dans les avantages de l’Ultimate Edition.',
    },
    desc: {
      es: doc('Rockstar incluye el Grotti Cheetah del 95 entre los contenidos de la Ultimate Edition de GTA VI.'),
      en: doc('Rockstar lists the ’95 Grotti Cheetah among the contents of the GTA VI Ultimate Edition.'),
      pt: doc('A Rockstar inclui o Grotti Cheetah de 95 entre os conteúdos da Ultimate Edition de GTA VI.'),
      fr: doc('Rockstar cite la Grotti Cheetah de 95 parmi les contenus de l’Ultimate Edition de GTA VI.'),
    },
  }),
  vehicle('veh-shitzu-squalo', 'shitzu-squalo', '002', 'Shitzu Squalo', null, 'src-editions', false, {
    tags: ['boat', 'ultimate edition'],
    short: {
      es: 'Una lancha de alto rendimiento incluida en la Ultimate Edition.',
      en: 'A performance boat included with the Ultimate Edition.',
      pt: 'Uma lancha de alto desempenho incluída na Ultimate Edition.',
      fr: 'Un bateau de performance inclus dans l’Ultimate Edition.',
    },
    desc: {
      es: doc('Rockstar menciona expresamente la Shitzu Squalo entre las ventajas de la Ultimate Edition.'),
      en: doc('Rockstar explicitly lists the Shitzu Squalo among the Ultimate Edition benefits.'),
      pt: doc('A Rockstar menciona expressamente a Shitzu Squalo entre os benefícios da Ultimate Edition.'),
      fr: doc('Rockstar mentionne explicitement le Shitzu Squalo parmi les avantages de l’Ultimate Edition.'),
    },
  }),
  vehicle('veh-vapid-dominator-fx', '67-vapid-dominator-fx', '003', '’67 Vapid Dominator FX', null, 'src-editions', false, {
    tags: ['vapid', 'ultimate edition'],
    short: {
      es: 'Un Vapid Dominator FX de 1967 incluido en la Ultimate Edition.',
      en: 'A 1967 Vapid Dominator FX included in the Ultimate Edition.',
      pt: 'Um Vapid Dominator FX de 1967 incluído na Ultimate Edition.',
      fr: 'Une Vapid Dominator FX de 1967 incluse dans l’Ultimate Edition.',
    },
    desc: {
      es: doc('Rockstar incluye el Vapid Dominator FX del 67 entre las ventajas de la Ultimate Edition.'),
      en: doc('Rockstar lists the ’67 Vapid Dominator FX among the Ultimate Edition benefits.'),
      pt: doc('A Rockstar inclui o Vapid Dominator FX de 67 entre os benefícios da Ultimate Edition.'),
      fr: doc('Rockstar cite la Vapid Dominator FX de 67 parmi les avantages de l’Ultimate Edition.'),
    },
  }),
  vehicle('veh-vapid-stanier-55', '55-vapid-stanier', '004', '’55 Vapid Stanier', null, 'src-support', false, {
    tags: ['vapid', 'pre-order'],
    short: {
      es: 'Un Vapid Stanier de 1955 incluido en el paquete de reserva Vintage Vice City.',
      en: 'A 1955 Vapid Stanier included with the Vintage Vice City pre-order pack.',
      pt: 'Um Vapid Stanier de 1955 incluído no pacote de pré-reserva Vintage Vice City.',
      fr: 'Une Vapid Stanier de 1955 incluse dans le pack de précommande Vintage Vice City.',
    },
    desc: {
      es: doc('La documentación de soporte de Rockstar incluye el Vapid Stanier Sedan del 55 en las ventajas del Vintage Vice City Pack.'),
      en: doc('Rockstar Support documentation lists the ’55 Vapid Stanier Sedan as part of the Vintage Vice City Pack pre-order bonuses.'),
      pt: doc('A documentação de suporte da Rockstar inclui o Vapid Stanier Sedan de 55 no Vintage Vice City Pack.'),
      fr: doc('La documentation d’assistance de Rockstar inclut la Vapid Stanier Sedan de 55 dans le Vintage Vice City Pack.'),
    },
  }),

  {
    key: 'trailer-1', type: 'trailers', slug: 'trailer-1', status: 'CONFIRMED', featured: false, image: IMAGES.jason07, source: 'src-videos',
    video_url: 'https://www.youtube.com/watch?v=QdBZY2fkU-0', tags: ['trailer', 'official'],
    eyebrow: { es: 'Tráiler oficial · 01:31', en: 'Official trailer · 01:31', pt: 'Trailer oficial · 01:31', fr: 'Bande-annonce officielle · 01:31' },
    title: { es: 'Tráiler 1', en: 'Trailer 1', pt: 'Trailer 1', fr: 'Bande-annonce 1' },
    short: {
      es: 'El primer tráiler oficial de GTA VI, publicado el 4 de diciembre de 2023.',
      en: 'The first official GTA VI trailer, released December 4, 2023.',
      pt: 'O primeiro trailer oficial de GTA VI, publicado a 4 de dezembro de 2023.',
      fr: 'La première bande-annonce officielle de GTA VI, publiée le 4 décembre 2023.',
    },
    desc: {
      es: doc('La biblioteca multimedia oficial recoge el Tráiler 1, publicado el 4 de diciembre de 2023: la revelación que presentó la Vice City moderna y a sus dos protagonistas.'),
      en: doc('The official media library lists Trailer 1, released December 4, 2023 — the reveal that introduced modern Vice City and its two leads.'),
      pt: doc('A biblioteca oficial regista o Trailer 1, publicado a 4 de dezembro de 2023: a revelação que apresentou a Vice City moderna e os seus protagonistas.'),
      fr: doc('La médiathèque officielle répertorie la bande-annonce 1, publiée le 4 décembre 2023 : la révélation de la Vice City moderne et de ses deux héros.'),
    },
    quote: {},
  },
  {
    key: 'trailer-2', type: 'trailers', slug: 'trailer-2', status: 'CONFIRMED', featured: true, image: IMAGES.jasonLucia, source: 'src-videos',
    video_url: 'https://www.youtube.com/watch?v=VQRLujxTm3c', tags: ['trailer', 'official'],
    eyebrow: { es: 'Tráiler oficial · 02:47', en: 'Official trailer · 02:47', pt: 'Trailer oficial · 02:47', fr: 'Bande-annonce officielle · 02:47' },
    title: { es: 'Tráiler 2', en: 'Trailer 2', pt: 'Trailer 2', fr: 'Bande-annonce 2' },
    short: {
      es: 'El segundo tráiler oficial de GTA VI, publicado el 6 de mayo de 2025.',
      en: 'The second official GTA VI trailer, released May 6, 2025.',
      pt: 'O segundo trailer oficial de GTA VI, publicado a 6 de maio de 2025.',
      fr: 'La deuxième bande-annonce officielle de GTA VI, publiée le 6 mai 2025.',
    },
    desc: {
      es: doc('La página oficial identifica el Tráiler 2 como un vídeo de 2:47 publicado el 6 de mayo de 2025, con Jason, Lucia y el mundo de Leonida en primer plano.'),
      en: doc('The official page identifies Trailer 2 as a 2:47 video released May 6, 2025, putting Jason, Lucia and the world of Leonida front and centre.'),
      pt: doc('A página oficial identifica o Trailer 2 como um vídeo de 2:47 publicado a 6 de maio de 2025, centrado em Jason, Lucia e Leonida.'),
      fr: doc('La page officielle présente la bande-annonce 2 comme une vidéo de 2:47 publiée le 6 mai 2025, centrée sur Jason, Lucia et Leonida.'),
    },
    quote: {},
  },
  {
    key: 'extended-look', type: 'trailers', slug: 'an-extended-look', status: 'CONFIRMED', featured: true, image: IMAGES.jasonLuciaMotel, source: 'src-extended-look',
    video_url: 'https://www.youtube.com/watch?v=YmzCydc4qOk', tags: ['extended look', 'ps5', 'official'],
    eyebrow: { es: 'Vídeo oficial · 26:48', en: 'Official video · 26:48', pt: 'Vídeo oficial · 26:48', fr: 'Vidéo officielle · 26:48' },
    title: { es: 'An Extended Look', en: 'An Extended Look', pt: 'An Extended Look', fr: 'An Extended Look' },
    short: {
      es: 'Una mirada extendida y oficial, capturada íntegramente con metraje del juego en PlayStation 5.',
      en: 'A longer official look, captured entirely from in-game footage on PlayStation 5.',
      pt: 'Uma apresentação oficial alargada, capturada integralmente com imagens do jogo na PlayStation 5.',
      fr: 'Un aperçu officiel prolongé, capturé intégralement en jeu sur PlayStation 5.',
    },
    desc: {
      es: doc('Rockstar publicó Grand Theft Auto VI: An Extended Look el 27 de agosto de 2026 e indica que se capturó íntegramente con metraje del juego en PlayStation 5.'),
      en: doc('Rockstar published Grand Theft Auto VI: An Extended Look on August 27, 2026 and states it was captured entirely from in-game footage on PlayStation 5.'),
      pt: doc('A Rockstar publicou Grand Theft Auto VI: An Extended Look a 27 de agosto de 2026 e indica que foi capturado integralmente com imagens do jogo na PlayStation 5.'),
      fr: doc('Rockstar a publié Grand Theft Auto VI: An Extended Look le 27 août 2026, capturé intégralement en jeu sur PlayStation 5.'),
    },
    quote: {},
  },

  fact('fact-release-date', 'release-date-november-19-2026', 'src-gta6', true, {
    tags: ['release date'], image: IMAGES.cover,
    title: { es: 'Lanzamiento: 19 de noviembre de 2026', en: 'Release date: November 19, 2026', pt: 'Lançamento: 19 de novembro de 2026', fr: 'Sortie : 19 novembre 2026' },
    short: { es: 'Rockstar indica el 19 de noviembre de 2026 como fecha de lanzamiento.', en: 'Rockstar lists November 19, 2026 as the release date.', pt: 'A Rockstar indica 19 de novembro de 2026 como data de lançamento.', fr: 'Rockstar annonce une sortie le 19 novembre 2026.' },
    desc: { es: doc('El sitio oficial de GTA VI indica actualmente el 19 de noviembre de 2026 como fecha de lanzamiento.'), en: doc('The official GTA VI site currently lists November 19, 2026 as the release date.'), pt: doc('O site oficial de GTA VI indica atualmente 19 de novembro de 2026 como data de lançamento.'), fr: doc('Le site officiel de GTA VI indique actuellement le 19 novembre 2026 comme date de sortie.') },
  }),
  fact('fact-platforms', 'platforms-ps5-xbox-series', 'src-support', false, {
    tags: ['ps5', 'xbox'],
    title: { es: 'Plataformas: PlayStation 5 y Xbox Series X|S', en: 'Platforms: PlayStation 5 and Xbox Series X|S', pt: 'Plataformas: PlayStation 5 e Xbox Series X|S', fr: 'Plateformes : PlayStation 5 et Xbox Series X|S' },
    short: { es: 'Rockstar indica PlayStation 5 y Xbox Series X|S.', en: 'Rockstar lists PlayStation 5 and Xbox Series X|S.', pt: 'A Rockstar indica PlayStation 5 e Xbox Series X|S.', fr: 'Rockstar annonce PlayStation 5 et Xbox Series X|S.' },
    desc: { es: doc('La documentación de soporte indica que GTA VI puede reservarse en PlayStation 5 y Xbox Series X|S.'), en: doc('Rockstar Support documentation states GTA VI can be pre-ordered on PlayStation 5 and Xbox Series X|S.'), pt: doc('A documentação de suporte indica que GTA VI pode ser reservado na PlayStation 5 e na Xbox Series X|S.'), fr: doc('La documentation d’assistance indique que GTA VI peut être précommandé sur PlayStation 5 et Xbox Series X|S.') },
  }),
  fact('fact-single-player', 'single-player-experience', 'src-preorder', false, {
    tags: ['single player'],
    title: { es: 'Experiencia para un jugador', en: 'Single-player experience', pt: 'Experiência para um jogador', fr: 'Expérience solo' },
    short: { es: 'Rockstar describe GTA VI como una experiencia para un jugador.', en: 'Rockstar describes GTA VI as a single-player experience.', pt: 'A Rockstar descreve GTA VI como uma experiência para um jogador.', fr: 'Rockstar décrit GTA VI comme une expérience solo.' },
    desc: { es: doc('El anuncio de reservas del 24 de junio de 2026 describe Grand Theft Auto VI como una experiencia para un jugador.'), en: doc('The June 24, 2026 pre-order announcement describes Grand Theft Auto VI as a single-player experience.'), pt: doc('O anúncio de pré-reservas de 24 de junho de 2026 descreve GTA VI como uma experiência para um jogador.'), fr: doc('L’annonce des précommandes du 24 juin 2026 décrit GTA VI comme une expérience solo.') },
  }),
  fact('fact-album', 'grand-theft-auto-vi-the-album', 'src-album', true, {
    tags: ['music', '34 tracks'], image: IMAGES.album,
    title: { es: 'GTA VI: The Album — 34 canciones', en: 'GTA VI: The Album — 34 tracks', pt: 'GTA VI: The Album — 34 músicas', fr: 'GTA VI: The Album — 34 titres' },
    short: { es: 'Un álbum oficial con 34 canciones originales.', en: 'An official album with 34 original tracks.', pt: 'Um álbum oficial com 34 músicas originais.', fr: 'Un album officiel de 34 titres originaux.' },
    desc: { es: doc('Rockstar anunció GTA VI: The Album el 17 de septiembre de 2026: 34 canciones originales que llegarán el 19 de noviembre junto al juego.'), en: doc('Rockstar announced GTA VI: The Album on September 17, 2026: 34 original tracks launching November 19 alongside the game.'), pt: doc('A Rockstar anunciou GTA VI: The Album a 17 de setembro de 2026: 34 músicas originais que chegam a 19 de novembro com o jogo.'), fr: doc('Rockstar a annoncé GTA VI: The Album le 17 septembre 2026 : 34 titres originaux, disponibles le 19 novembre avec le jeu.') },
  }),
  fact('fact-editions', 'editions-standard-ultimate', 'src-editions', false, {
    tags: ['editions'],
    title: { es: 'Dos ediciones: Standard y Ultimate', en: 'Two editions: Standard and Ultimate', pt: 'Duas edições: Standard e Ultimate', fr: 'Deux éditions : Standard et Ultimate' },
    short: { es: 'Rockstar muestra la Standard Edition y la Ultimate Edition.', en: 'Rockstar lists a Standard Edition and an Ultimate Edition.', pt: 'A Rockstar apresenta a Standard Edition e a Ultimate Edition.', fr: 'Rockstar propose une Standard Edition et une Ultimate Edition.' },
    desc: { es: doc('La página de ediciones y el soporte oficial describen una Standard Edition y una Ultimate Edition, con una mejora a Ultimate disponible por separado.'), en: doc('The editions page and support documentation describe a Standard Edition and an Ultimate Edition, with an Ultimate upgrade sold separately.'), pt: doc('A página de edições e o suporte descrevem uma Standard Edition e uma Ultimate Edition, com uma atualização vendida à parte.'), fr: doc('La page des éditions et l’assistance décrivent une Standard Edition et une Ultimate Edition, avec une mise à niveau vendue séparément.') },
  }),
  fact('fact-preload', 'preload-november-12-2026', 'src-support', false, {
    tags: ['pre-load'],
    title: { es: 'Precarga digital: 12 de noviembre de 2026', en: 'Digital pre-load: November 12, 2026', pt: 'Pré-carregamento digital: 12 de novembro de 2026', fr: 'Préchargement numérique : 12 novembre 2026' },
    short: { es: 'Las reservas digitales se precargan desde la medianoche local del 12 de noviembre.', en: 'Digital pre-orders can pre-load from local midnight on November 12.', pt: 'As pré-reservas digitais podem ser pré-carregadas a partir da meia-noite local de 12 de novembro.', fr: 'Les précommandes numériques se préchargent dès minuit, heure locale, le 12 novembre.' },
    desc: { es: doc('El soporte de Rockstar indica que la precarga digital empieza a medianoche, hora local, del 12 de noviembre de 2026.'), en: doc('Rockstar Support states digital pre-load begins at local midnight on November 12, 2026.'), pt: doc('O suporte da Rockstar indica que o pré-carregamento começa à meia-noite local de 12 de novembro de 2026.'), fr: doc('L’assistance Rockstar indique que le préchargement commence à minuit, heure locale, le 12 novembre 2026.') },
  }),
  fact('fact-physical', 'physical-code-in-box', 'src-support', false, {
    tags: ['physical'],
    title: { es: 'La versión física es un código en caja', en: 'The physical version is code-in-box', pt: 'A versão física é um código na caixa', fr: 'La version physique est un code en boîte' },
    short: { es: 'La caja incluye un código de descarga; no habrá disco.', en: 'The box contains a download code; there is no disc.', pt: 'A caixa inclui um código de descarga; não haverá disco.', fr: 'La boîte contient un code de téléchargement ; pas de disque.' },
    desc: { es: doc('Según el soporte oficial, la edición física contiene un código de descarga para permitir la precarga y no incluye disco.'), en: doc('Official support says the physical edition contains a download code to allow pre-loading and does not include a disc.'), pt: doc('Segundo o suporte oficial, a edição física contém um código de descarga para permitir o pré-carregamento e não inclui disco.'), fr: doc('Selon l’assistance officielle, l’édition physique contient un code de téléchargement pour le préchargement et n’inclut pas de disque.') },
  }),
];

// Atomic facts attached to specific records (evidence pieces).
export const facts = [
  { entity: 'char-jason-duval', source: 'src-only-in-leonida', status: 'CONFIRMED', title: { es: 'Pasó por el ejército', en: 'Served in the Army', pt: 'Passou pelo exército', fr: 'Est passé par l’armée' }, body: { es: 'El perfil oficial menciona un periodo en el ejército antes de trabajar en los Keys.', en: 'The official profile mentions time in the Army before working in the Keys.', pt: 'O perfil oficial menciona um período no exército antes dos Keys.', fr: 'Le profil officiel évoque un passage dans l’armée avant les Keys.' } },
  { entity: 'char-jason-duval', source: 'src-only-in-leonida', status: 'CONFIRMED', title: { es: 'Vive en una propiedad de Brian', en: 'Lives at one of Brian’s properties', pt: 'Vive numa propriedade de Brian', fr: 'Loge chez Brian' }, body: { es: 'Jason vive sin pagar alquiler a cambio de ayudar con extorsiones locales.', en: 'Jason lives rent-free in exchange for helping with local shakedowns.', pt: 'Jason vive sem pagar renda em troca de ajuda com extorsões locais.', fr: 'Jason loge gratuitement en échange d’aide pour des extorsions locales.' } },
  { entity: 'char-lucia-caminos', source: 'src-only-in-leonida', status: 'CONFIRMED', title: { es: 'Estuvo en prisión en Leonida', en: 'Served time in a Leonida prison', pt: 'Esteve presa em Leonida', fr: 'A été incarcérée à Leonida' }, body: { es: 'Su lucha por la familia la llevó a la cárcel, según Rockstar.', en: 'Her fight for her family led to prison, according to Rockstar.', pt: 'A luta pela família levou-a à prisão, segundo a Rockstar.', fr: 'Son combat pour sa famille l’a menée en prison, selon Rockstar.' } },
  { entity: 'loc-vice-city', source: 'src-gta6', status: 'CONFIRMED', title: { es: 'Escenario urbano central', en: 'Central urban setting', pt: 'Cenário urbano central', fr: 'Décor urbain central' }, body: { es: 'Rockstar presenta el juego como un regreso a la Vice City actual.', en: 'Rockstar presents the game as a return to modern-day Vice City.', pt: 'A Rockstar apresenta o jogo como um regresso à Vice City atual.', fr: 'Rockstar présente le jeu comme un retour dans la Vice City actuelle.' } },
  { entity: 'fact-album', source: 'src-album', status: 'CONFIRMED', title: { es: 'Seis sencillos disponibles', en: 'Six singles available now', pt: 'Seis singles disponíveis', fr: 'Six singles disponibles' }, body: { es: 'El anuncio incluye seis sencillos publicados el mismo día.', en: 'The announcement includes six singles released the same day.', pt: 'O anúncio inclui seis singles lançados no mesmo dia.', fr: 'L’annonce inclut six singles publiés le jour même.' } },
];

export const relations = [
  { from: 'char-jason-duval', to: 'char-lucia-caminos', type: 'partner' },
  { from: 'char-jason-duval', to: 'loc-leonida-keys', type: 'works-in' },
  { from: 'char-jason-duval', to: 'loc-vice-city', type: 'appears-in' },
  { from: 'char-lucia-caminos', to: 'loc-vice-city', type: 'appears-in' },
  { from: 'loc-vice-city', to: 'loc-leonida', type: 'located-in' },
  { from: 'loc-leonida-keys', to: 'loc-leonida', type: 'located-in' },
  { from: 'loc-port-gellhorn', to: 'loc-leonida', type: 'located-in' },
  { from: 'loc-ambrosia', to: 'loc-leonida', type: 'located-in' },
  { from: 'loc-grassrivers', to: 'loc-leonida', type: 'located-in' },
  { from: 'loc-mount-kalaga', to: 'loc-leonida', type: 'located-in' },
  { from: 'char-brian-heder', to: 'loc-leonida-keys', type: 'based-in' },
  { from: 'char-brian-heder', to: 'char-jason-duval', type: 'employs' },
  { from: 'char-cal-hampton', to: 'char-jason-duval', type: 'friend' },
  { from: 'char-cal-hampton', to: 'char-brian-heder', type: 'associate' },
  { from: 'char-boobie-ike', to: 'char-drequan-priest', type: 'partner' },
  { from: 'char-boobie-ike', to: 'loc-vice-city', type: 'based-in' },
  { from: 'char-drequan-priest', to: 'char-real-dimez', type: 'signed' },
  { from: 'trailer-1', to: 'char-jason-duval', type: 'features' },
  { from: 'trailer-1', to: 'loc-vice-city', type: 'features' },
  { from: 'trailer-2', to: 'char-lucia-caminos', type: 'features' },
  { from: 'trailer-2', to: 'char-jason-duval', type: 'features' },
  { from: 'extended-look', to: 'loc-vice-city', type: 'features' },
  { from: 'veh-grotti-cheetah-95', to: 'fact-editions', type: 'part-of' },
  { from: 'veh-shitzu-squalo', to: 'fact-editions', type: 'part-of' },
  { from: 'veh-vapid-dominator-fx', to: 'fact-editions', type: 'part-of' },
];

export const categories = [
  { key: 'cat-official', slug: 'oficial', color: 'flamingo', name: { es: 'Oficial', en: 'Official', pt: 'Oficial', fr: 'Officiel' } },
  { key: 'cat-trailers', slug: 'trailers', color: 'pool', name: { es: 'Tráilers', en: 'Trailers', pt: 'Trailers', fr: 'Bandes-annonces' } },
  { key: 'cat-music', slug: 'musica', color: 'lavender', name: { es: 'Música', en: 'Music', pt: 'Música', fr: 'Musique' } },
  { key: 'cat-launch', slug: 'lanzamiento', color: 'sun', name: { es: 'Lanzamiento', en: 'Launch', pt: 'Lançamento', fr: 'Sortie' } },
  { key: 'cat-analysis', slug: 'analisis', color: 'peach', name: { es: 'Análisis', en: 'Analysis', pt: 'Análise', fr: 'Analyse' } },
];

export const articles = [
  {
    key: 'news-album', slug: 'rockstar-anuncia-gta-vi-the-album', category: 'cat-music', source: 'src-album', evidence: 'CONFIRMED',
    featured: true, published_at: '2026-09-17T16:00:00Z', image: IMAGES.album, author: 'Redacción Leonida Records',
    cover_caption: 'Portada de GTA VI: The Album. Imagen: Rockstar Games.', tags: ['música', 'álbum', 'oficial'],
    entities: ['fact-album', 'loc-vice-city'],
    title: { es: 'Rockstar anuncia GTA VI: The Album', en: 'Rockstar announces GTA VI: The Album', pt: 'Rockstar anuncia GTA VI: The Album', fr: 'Rockstar annonce GTA VI: The Album' },
    excerpt: {
      es: 'Treinta y cuatro canciones originales acompañarán el lanzamiento del 19 de noviembre. Seis sencillos ya están disponibles.',
      en: 'Thirty-four original songs will accompany the November 19 launch. Six singles are already out.',
      pt: 'Trinta e quatro músicas originais vão acompanhar o lançamento de 19 de novembro. Seis singles já estão disponíveis.',
      fr: 'Trente-quatre titres originaux accompagneront la sortie du 19 novembre. Six singles sont déjà disponibles.',
    },
    body: {
      es: doc('Rockstar anunció el 17 de septiembre de 2026 GTA VI: The Album, una colección de 34 canciones originales que se publicará el 19 de noviembre, el mismo día que el juego.', ['h2', 'Seis sencillos para abrir boca'], 'El anuncio llegó acompañado de seis sencillos disponibles desde ese mismo día. Es la primera vez que la música de Leonida se presenta como un proyecto propio, separado de la banda sonora de las radios.', ['quote', 'La música siempre ha sido media ciudad en Vice City.'], 'En el archivo, el álbum queda registrado como dato confirmado y enlazado a su fuente oficial en Newswire.'),
      en: doc('On September 17, 2026 Rockstar announced GTA VI: The Album, a collection of 34 original songs releasing November 19 — the same day as the game.', ['h2', 'Six singles to start'], 'The announcement came with six singles available the same day. It is the first time Leonida’s music has been framed as a standalone project, separate from the in-game radio.', ['quote', 'In Vice City, music has always been half the city.'], 'In the archive, the album is logged as a confirmed fact and linked to its official Newswire source.'),
      pt: doc('A 17 de setembro de 2026 a Rockstar anunciou GTA VI: The Album, uma coleção de 34 músicas originais que chega a 19 de novembro, com o jogo.', 'O anúncio trouxe seis singles disponíveis no mesmo dia.'),
      fr: doc('Le 17 septembre 2026, Rockstar a annoncé GTA VI: The Album, 34 titres originaux disponibles le 19 novembre, le jour de la sortie du jeu.', 'L’annonce s’accompagne de six singles disponibles le jour même.'),
    },
  },
  {
    key: 'news-extended-look', slug: 'an-extended-look-ya-disponible', category: 'cat-trailers', source: 'src-extended-look', evidence: 'CONFIRMED',
    featured: false, published_at: '2026-08-27T15:00:00Z', image: IMAGES.jasonLuciaMotel, author: 'Redacción Leonida Records',
    cover_caption: 'Jason y Lucia. Imagen: Rockstar Games.', tags: ['vídeo', 'ps5', 'oficial'],
    entities: ['extended-look', 'char-jason-duval', 'char-lucia-caminos'],
    title: { es: 'An Extended Look ya está disponible', en: 'An Extended Look is out now', pt: 'An Extended Look já está disponível', fr: 'An Extended Look est disponible' },
    excerpt: {
      es: 'Veintiséis minutos de GTA VI capturados íntegramente con metraje del juego en PlayStation 5.',
      en: 'Twenty-six minutes of GTA VI captured entirely from in-game footage on PlayStation 5.',
      pt: 'Vinte e seis minutos de GTA VI capturados integralmente com imagens do jogo na PlayStation 5.',
      fr: 'Vingt-six minutes de GTA VI capturées intégralement en jeu sur PlayStation 5.',
    },
    body: {
      es: doc('Rockstar publicó el 27 de agosto de 2026 Grand Theft Auto VI: An Extended Look, una presentación larga capturada íntegramente con metraje del juego en PlayStation 5.', ['h2', 'Qué cambia para el archivo'], 'Cada plano del vídeo es una fuente potencial. Los datos observados en él se registran con su marca de tiempo y quedan separados de la especulación.'),
      en: doc('On August 27, 2026 Rockstar released Grand Theft Auto VI: An Extended Look, a long-form presentation captured entirely from in-game footage on PlayStation 5.', ['h2', 'What it means for the archive'], 'Every shot is a potential source. Facts observed in it are logged with a timestamp and kept apart from speculation.'),
      pt: doc('A 27 de agosto de 2026 a Rockstar publicou Grand Theft Auto VI: An Extended Look, capturado integralmente com imagens do jogo na PlayStation 5.'),
      fr: doc('Le 27 août 2026, Rockstar a publié Grand Theft Auto VI: An Extended Look, capturé intégralement en jeu sur PlayStation 5.'),
    },
  },
  {
    key: 'news-preorders', slug: 'abiertas-las-reservas-de-gta-vi', category: 'cat-launch', source: 'src-preorder', evidence: 'CONFIRMED',
    featured: false, published_at: '2026-06-24T14:00:00Z', image: IMAGES.cover, author: 'Redacción Leonida Records',
    cover_caption: 'Portada oficial de GTA VI. Imagen: Rockstar Games.', tags: ['reservas', 'ediciones', 'oficial'],
    entities: ['fact-single-player', 'fact-editions', 'veh-vapid-stanier-55'],
    title: { es: 'Abiertas las reservas de GTA VI', en: 'GTA VI pre-orders are open', pt: 'As pré-reservas de GTA VI estão abertas', fr: 'Les précommandes de GTA VI sont ouvertes' },
    excerpt: {
      es: 'Rockstar abre las reservas, confirma la experiencia para un jugador y detalla el paquete Vintage Vice City.',
      en: 'Rockstar opens pre-orders, confirms a single-player experience and details the Vintage Vice City Pack.',
      pt: 'A Rockstar abre as pré-reservas, confirma a experiência para um jogador e detalha o Vintage Vice City Pack.',
      fr: 'Rockstar ouvre les précommandes, confirme une expérience solo et détaille le Vintage Vice City Pack.',
    },
    body: {
      es: doc('El anuncio oficial del 24 de junio de 2026 abrió las reservas de GTA VI y detalló el paquete Vintage Vice City junto con otras ventajas de reserva.', 'En el mismo texto, Rockstar describe el juego como una experiencia para un jugador.'),
      en: doc('Rockstar’s official June 24, 2026 announcement opened GTA VI pre-orders and detailed the Vintage Vice City Pack alongside other pre-order benefits.', 'In the same post, Rockstar describes the game as a single-player experience.'),
      pt: doc('O anúncio oficial de 24 de junho de 2026 abriu as pré-reservas de GTA VI e detalhou o Vintage Vice City Pack.'),
      fr: doc('L’annonce officielle du 24 juin 2026 a ouvert les précommandes de GTA VI et détaillé le Vintage Vice City Pack.'),
    },
  },
  {
    key: 'news-trailer-2', slug: 'trailer-2-llega', category: 'cat-trailers', source: 'src-videos', evidence: 'CONFIRMED',
    featured: false, published_at: '2025-05-06T15:00:00Z', image: IMAGES.jasonLuciaWide, author: 'Redacción Leonida Records',
    cover_caption: 'Jason y Lucia. Imagen: Rockstar Games.', tags: ['tráiler', 'oficial'],
    entities: ['trailer-2', 'char-jason-duval', 'char-lucia-caminos'],
    title: { es: 'El Tráiler 2 llega con 2:47 de GTA VI', en: 'Trailer 2 lands with 2:47 of GTA VI', pt: 'O Trailer 2 chega com 2:47 de GTA VI', fr: 'La bande-annonce 2 dévoile 2:47 de GTA VI' },
    excerpt: {
      es: 'El segundo tráiler amplía la historia de Jason y Lucia y el mundo de Leonida.',
      en: 'The second trailer expands the story of Jason and Lucia and the world of Leonida.',
      pt: 'O segundo trailer amplia a história de Jason e Lucia e o mundo de Leonida.',
      fr: 'La deuxième bande-annonce approfondit l’histoire de Jason et Lucia et le monde de Leonida.',
    },
    body: {
      es: doc('Rockstar publicó el Tráiler 2 el 6 de mayo de 2025. La biblioteca oficial lo identifica como una pieza de 2 minutos y 47 segundos.'),
      en: doc('Rockstar released Trailer 2 on May 6, 2025. The official library lists it as a 2 minute 47 second piece.'),
      pt: doc('A Rockstar publicou o Trailer 2 a 6 de maio de 2025, com 2 minutos e 47 segundos.'),
      fr: doc('Rockstar a publié la bande-annonce 2 le 6 mai 2025 : 2 minutes et 47 secondes.'),
    },
  },
  {
    key: 'news-trailer-1', slug: 'primer-trailer-presenta-vice-city', category: 'cat-trailers', source: 'src-videos', evidence: 'CONFIRMED',
    featured: false, published_at: '2023-12-04T23:00:00Z', image: IMAGES.jason01, author: 'Redacción Leonida Records',
    cover_caption: 'Jason Duval. Imagen: Rockstar Games.', tags: ['tráiler', 'oficial'],
    entities: ['trailer-1', 'loc-vice-city'],
    title: { es: 'El primer tráiler presenta la Vice City moderna', en: 'The first trailer introduces modern Vice City', pt: 'O primeiro trailer apresenta a Vice City moderna', fr: 'La première bande-annonce dévoile la Vice City moderne' },
    excerpt: {
      es: 'La primera revelación oficial presenta Vice City, a Jason, a Lucia y el estado de Leonida.',
      en: 'The first official reveal introduces Vice City, Jason, Lucia and the state of Leonida.',
      pt: 'A primeira revelação oficial apresenta Vice City, Jason, Lucia e o estado de Leonida.',
      fr: 'La première révélation officielle présente Vice City, Jason, Lucia et l’État de Leonida.',
    },
    body: {
      es: doc('El primer tráiler oficial de GTA VI se publicó el 4 de diciembre de 2023 y abrió la etapa pública de información sobre el juego.'),
      en: doc('The first official GTA VI trailer was released on December 4, 2023, opening the game’s public information era.'),
      pt: doc('O primeiro trailer oficial de GTA VI foi publicado a 4 de dezembro de 2023.'),
      fr: doc('La première bande-annonce officielle de GTA VI a été publiée le 4 décembre 2023.'),
    },
  },
];

export const timeline = [
  { date: '2023-12-04', kind: 'video', entity: 'trailer-1', title: { es: 'Tráiler 1', en: 'Trailer 1', pt: 'Trailer 1', fr: 'Bande-annonce 1' }, detail: { es: 'Primer tráiler oficial de GTA VI.', en: 'First official GTA VI trailer.', pt: 'Primeiro trailer oficial de GTA VI.', fr: 'Première bande-annonce officielle de GTA VI.' } },
  { date: '2025-05-06', kind: 'video', entity: 'trailer-2', title: { es: 'Tráiler 2', en: 'Trailer 2', pt: 'Trailer 2', fr: 'Bande-annonce 2' }, detail: { es: 'Segundo tráiler oficial, 2:47.', en: 'Second official trailer, 2:47.', pt: 'Segundo trailer oficial, 2:47.', fr: 'Deuxième bande-annonce officielle, 2:47.' } },
  { date: '2026-06-24', kind: 'news', article: 'news-preorders', title: { es: 'Reservas abiertas', en: 'Pre-orders open', pt: 'Pré-reservas abertas', fr: 'Précommandes ouvertes' }, detail: { es: 'Rockstar abre las reservas y confirma la experiencia para un jugador.', en: 'Rockstar opens pre-orders and confirms a single-player experience.', pt: 'A Rockstar abre as pré-reservas e confirma a experiência para um jogador.', fr: 'Rockstar ouvre les précommandes et confirme une expérience solo.' } },
  { date: '2026-08-27', kind: 'video', entity: 'extended-look', title: { es: 'An Extended Look', en: 'An Extended Look', pt: 'An Extended Look', fr: 'An Extended Look' }, detail: { es: 'Presentación extendida con metraje del juego en PS5.', en: 'Extended presentation with in-game PS5 footage.', pt: 'Apresentação alargada com imagens do jogo na PS5.', fr: 'Présentation prolongée avec des images en jeu sur PS5.' } },
  { date: '2026-09-17', kind: 'music', article: 'news-album', title: { es: 'The Album', en: 'The Album', pt: 'The Album', fr: 'The Album' }, detail: { es: 'Anuncio del álbum oficial de 34 canciones.', en: 'Official 34-track album announced.', pt: 'Anúncio do álbum oficial de 34 músicas.', fr: 'Annonce de l’album officiel de 34 titres.' } },
  { date: '2026-11-12', kind: 'launch', entity: 'fact-preload', title: { es: 'Precarga', en: 'Pre-load', pt: 'Pré-carregamento', fr: 'Préchargement' }, detail: { es: 'La precarga digital empieza a medianoche, hora local.', en: 'Digital pre-load starts at local midnight.', pt: 'O pré-carregamento digital começa à meia-noite local.', fr: 'Le préchargement numérique commence à minuit, heure locale.' } },
  { date: '2026-11-19', kind: 'launch', entity: 'fact-release-date', title: { es: 'Lanzamiento', en: 'Launch', pt: 'Lançamento', fr: 'Sortie' }, detail: { es: 'Grand Theft Auto VI sale a la venta.', en: 'Grand Theft Auto VI launches.', pt: 'Grand Theft Auto VI chega às lojas.', fr: 'Grand Theft Auto VI sort.' } },
];

// Media library seed: official imagery referenced by URL (not uploaded).
export const media = [
  { key: 'm-jason-lucia', url: IMAGES.jasonLucia, alt: 'Jason y Lucia', caption: 'Jason y Lucia', credit: 'Rockstar Games', entity: 'char-jason-duval' },
  { key: 'm-jason-07', url: IMAGES.jason07, alt: 'Jason Duval', caption: 'Jason Duval', credit: 'Rockstar Games', entity: 'char-jason-duval' },
  { key: 'm-vice-city', url: IMAGES.viceCity, alt: 'Vice City', caption: 'Vice City', credit: 'Rockstar Games', entity: 'loc-vice-city' },
  { key: 'm-keys', url: IMAGES.keys, alt: 'Leonida Keys', caption: 'Leonida Keys', credit: 'Rockstar Games', entity: 'loc-leonida-keys' },
  { key: 'm-port-gellhorn', url: IMAGES.portGellhorn, alt: 'Port Gellhorn', caption: 'Port Gellhorn', credit: 'Rockstar Games', entity: 'loc-port-gellhorn' },
  { key: 'm-cal-01', url: IMAGES.cal01, alt: 'Cal Hampton', caption: 'Cal Hampton', credit: 'Rockstar Games', entity: 'char-cal-hampton' },
  { key: 'm-cheetah', url: IMAGES.cheetah, alt: '’95 Grotti Cheetah', caption: '’95 Grotti Cheetah', credit: 'Rockstar Games', entity: 'veh-grotti-cheetah-95' },
  { key: 'm-motel', url: IMAGES.jasonLuciaMotel, alt: 'Jason y Lucia en un motel', caption: 'Jason y Lucia', credit: 'Rockstar Games', entity: 'char-lucia-caminos' },
  { key: 'm-ambrosia', url: IMAGES.ambrosia, alt: 'Postal de Ambrosia', caption: 'Ambrosia', credit: 'Rockstar Games', entity: 'loc-ambrosia' },
  { key: 'm-kalaga', url: IMAGES.kalaga, alt: 'Postal de Mount Kalaga National Park', caption: 'Mount Kalaga', credit: 'Rockstar Games', entity: 'loc-mount-kalaga' },
];

export const settings = {
  hero_image: IMAGES.viceCity,
  hero_video: null,
  release_date: '2026-11-19',
  announcement: {},
  contact_email: null,
};

/** Release date of each video record, taken from its timeline event. */
export const releaseDates = Object.fromEntries(timeline.filter((t) => t.kind === 'video' && t.entity).map((t) => [t.entity, t.date]));
