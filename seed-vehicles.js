// GTA VI vehicle catalogue (as of late September 2026), generated into seed entities.
// Evidence levels:
//   C = named by Rockstar (official editions / store pages)      → CONFIRMED
//   N = the name is legible on the vehicle in Rockstar material  → OBSERVED
//   O = seen in Rockstar material; model identified by fans from its design and badges → OBSERVED
//   R = seen in Rockstar material; the name circulates among fans but Rockstar hasn't shown it → REPORTED
//   G = listed for GTA VI by fan databases; not named by Rockstar → REPORTED
// "seen": t = official trailers, s = official screenshots/art, v = An Extended Look, p = official promo art, e = official editions/store page
// Community identifications cross-checked against GTA Intel's vehicle database (gtaintel.com/games/gta-6/vehicles).

const CLASSES = {
  sports: ['a sports car', 'un deportivo'], super: ['a supercar', 'un superdeportivo'], muscle: ['a muscle car', 'un muscle car'],
  sedan: ['a sedan', 'una berlina'], compact: ['a compact car', 'un compacto'], coupe: ['a coupé', 'un cupé'], suv: ['an SUV', 'un SUV'],
  pickup: ['a pickup truck', 'una pickup'], offroad: ['an off-roader', 'un todoterreno'], van: ['a van', 'una furgoneta'],
  commercial: ['a commercial vehicle', 'un vehículo comercial'], truck: ['a heavy truck', 'un camión'], police: ['a police vehicle', 'un vehículo policial'],
  motorcycle: ['a motorcycle', 'una moto'], quad: ['a quad bike', 'un quad'], bicycle: ['a bicycle', 'una bicicleta'], boat: ['a boat', 'una embarcación'],
  motorboat: ['a motorboat', 'una lancha'], jetski: ['a jet ski', 'una moto de agua'], helicopter: ['a helicopter', 'un helicóptero'],
  plane: ['a plane', 'un avión'], motorhome: ['a motorhome', 'una autocaravana'], lowrider: ['a lowrider', 'un lowrider'], bus: ['a coach', 'un autocar'],
  kayak: ['a kayak', 'un kayak'], mobility: ['a mobility scooter', 'un scooter de movilidad'],
};
const SEEN = {
  t: ['the official trailers', 'los tráilers oficiales'], s: ['Rockstar’s official screenshots', 'las capturas oficiales de Rockstar'],
  v: ['An Extended Look', 'An Extended Look'], p: ['official promotional art', 'el arte promocional oficial'], e: ['Rockstar’s official edition listings', 'la descripción oficial de las ediciones'],
};
const SEEN_SOURCE = { e: 'src-store-ultimate', v: 'src-extended-look', t: 'src-videos', s: 'src-screens', p: 'src-gta6' };

// [name, make, class, level, seen, basedOn?, noteEn?, noteEs?, nameEs?]
const V = [
  ['Dinka Enduro', null, 'motorcycle', 'C', 'e', null, 'Rockstar lists this Army fatigue-tinged motorcycle among Jason’s safehouse vehicles in the Ultimate Edition.', 'Rockstar la incluye, con un acabado de estilo militar, entre los vehículos del piso franco de Jason en la Ultimate Edition.'],
  ['Crest Kayak', null, 'kayak', 'C', 'e', null, 'Rockstar lists it among Jason’s safehouse vehicles in the Ultimate Edition.', 'Rockstar lo incluye entre los vehículos del piso franco de Jason en la Ultimate Edition.'],
  ['Vapid Ganado', null, 'pickup', 'C', 'es', null, 'Rockstar describes it as Jason’s well-worn, low-riding pickup; the Ultimate Edition adds an exclusive Retro Build mod kit for it.', 'Rockstar la describe como la pickup rebajada y gastada de Jason; la Ultimate Edition añade un kit exclusivo de modificaciones Retro Build.'],

  ['Buffalo', 'Bravado', 'muscle', 'N', 'tsv', null, 'In An Extended Look, a #46 race car carries the BUFFALO name across its rear bumper.', 'En An Extended Look, un coche de carreras con el #46 lleva el nombre BUFFALO en el paragolpes trasero.'],
  ['Schafter', 'Benefactor', 'sedan', 'N', 'v', null, 'A black Benefactor saloon in An Extended Look shows the SCHAFTER name on its boot lid.', 'Una berlina negra de Benefactor en An Extended Look muestra el nombre SCHAFTER en el maletero.'],
  ['Deviant', null, 'muscle', 'N', 's', null, 'Part of the Classic Car Collection: the stars-and-stripes muscle car has “Deviant” in script on its rear flank.', 'Forma parte de la Classic Car Collection: el muscle car con barras y estrellas lleva «Deviant» escrito en el lateral trasero.'],
  ['Sirius', null, 'muscle', 'N', 's', null, 'A turquoise muscle car in the Classic Car Collection, badged SIRIUS beside its tail lights. The name appears to be new to the series.', 'Un muscle car turquesa de la Classic Car Collection con el emblema SIRIUS junto a los pilotos. El nombre parece nuevo en la saga.'],
  ['Riata', null, 'offroad', 'N', 's', null, 'A dusty off-roader in the Classic Car Collection with “Riata” in script on its front fender.', 'Un todoterreno polvoriento de la Classic Car Collection con «Riata» escrito en la aleta delantera.'],

  ['Aleutian', 'Vapid', 'suv', 'O', 't'], ['Asterope GZ', 'Karin', 'sedan', 'O', 's'], ['Astron', 'Pfister', 'suv', 'O', 'ts'],
  ['Banshee', 'Bravado', 'sports', 'O', 't'], ['Bison', 'Bravado', 'pickup', 'O', 'ts'],
  ['Bison (second generation)', 'Bravado', 'pickup', 'O', 'ts', null, null, null, 'Bison (segunda generación)'],
  ['Buccaneer', 'Albany', 'muscle', 'O', 't'], ['Buccaneer Custom', 'Albany', 'lowrider', 'O', 't'],
  ['Buffalo STX Pursuit', 'Bravado', 'police', 'O', 'ts'], ['Caracara 4x4', 'Vapid', 'pickup', 'O', 'ts'],
  ['Carbonizzare', 'Grotti', 'sports', 'O', 't'], ['Comet Retro Custom', 'Pfister', 'sports', 'O', 'tv'], ['Comet S2 Cabrio', 'Pfister', 'sports', 'O', 'ts'],
  ['Contender', 'Vapid', 'suv', 'O', 's'], ['Coquette', 'Invetero', 'sports', 'O', 't'], ['Coquette D10', 'Invetero', 'sports', 'O', 'ts'],
  ['Cypher', 'Übermacht', 'sports', 'O', 't'], ['Dashound', null, 'bus', 'O', 'p'],
  ['Dominator', 'Vapid', 'muscle', 'O', 't'], ['Dominator ASP', 'Vapid', 'muscle', 'O', 't'], ['Dominator GT', 'Vapid', 'muscle', 'O', 's'], ['Dominator GTX', 'Vapid', 'muscle', 'O', 't'],
  ['Dorado', 'Bravado', 'suv', 'O', 'sv'], ['Dubsta', 'Benefactor', 'suv', 'O', 'tsv'], ['Elegy Retro Custom', 'Annis', 'sports', 'O', 't'],
  ['Furia', 'Grotti', 'super', 'O', 'ts'], ['Gauntlet Hellfire', 'Bravado', 'muscle', 'O', 't'],
  ['Granger', 'Declasse', 'suv', 'O', 't'], ['Granger 3600LX', 'Declasse', 'suv', 'O', 't'], ['Growler', 'Pfister', 'sports', 'O', 't'],
  ['Hellion', 'Annis', 'offroad', 'O', 't'], ['Impaler SZ', 'Declasse', 'sedan', 'O', 's'], ['Infernus Classic', 'Pegassi', 'super', 'O', 't'],
  ['Itali GTO', 'Grotti', 'super', 'O', 't'], ['Journey II', 'Zirconium', 'motorhome', 'O', 's'], ['Jubilee', 'Enus', 'suv', 'O', 'ts'],
  ['Jugular', 'Ocelot', 'sports', 'O', 't'], ['Kamacho', 'Canis', 'offroad', 'O', 's'], ['Landstalker XL', 'Dundreary', 'suv', 'O', 'tsv'],
  ['Mesa', 'Canis', 'offroad', 'O', 's'], ['Outlaw', 'Nagasaki', 'offroad', 'O', 'ts'], ['Packer', 'MTL', 'truck', 'O', 'ts'],
  ['Paragon R', 'Enus', 'sports', 'O', 's'], ['Phantom', 'JoBuilt', 'truck', 'O', 's'], ['Phantom Custom', 'JoBuilt', 'truck', 'O', 't'],
  ['PMP 700', 'Schyster', 'sedan', 'O', 'tsv'], ['Police Cruiser (Buffalo)', 'Bravado', 'police', 'O', 't', null, null, null, 'Coche patrulla (Buffalo)'],
  ['Police Riot', 'Brute', 'police', 'O', 't'], ['Primo', 'Albany', 'sedan', 'O', 'ts'], ['Primo Custom', 'Albany', 'lowrider', 'O', 't'],
  ['Rubble', 'JoBuilt', 'truck', 'O', 't'], ['Ruiner', 'Imponte', 'muscle', 'O', 't'], ['Sandking XL', 'Vapid', 'offroad', 'O', 'ts'],
  ['Schafter V12', 'Benefactor', 'sports', 'O', 'tv'], ['Speedo', 'Vapid', 'van', 'O', 't'], ['Stratum', 'Zirconium', 'sedan', 'O', 't'],
  ['Sugoi', 'Dinka', 'sports', 'O', 's'], ['Tailgater', 'Obey', 'sedan', 'O', 't'], ['Tempesta', 'Pegassi', 'super', 'O', 'ts'],
  ['Towtruck', 'Vapid', 'commercial', 'O', 't', null, null, null, 'Grúa'], ['Tulip', 'Declasse', 'muscle', 'O', 't'], ['Tulip M-100', 'Declasse', 'muscle', 'O', 'ts'],
  ['V-STR', 'Albany', 'sports', 'O', 's'], ['Vectre', 'Emperor', 'sports', 'O', 't'], ['Vigero ZX Convertible', 'Declasse', 'muscle', 'O', 's'],
  ['Walton L35 Stock', 'Declasse', 'pickup', 'O', 's'], ['Yosemite 1500', 'Declasse', 'pickup', 'O', 's'], ['Youga Classic', 'Bravado', 'van', 'O', 't'],
  ['Zorrusso', 'Pegassi', 'super', 'O', 't'],

  ['Baller (second generation)', 'Gallivanter', 'suv', 'R', 'ts', null, null, null, 'Baller (segunda generación)'],
  ['Blazer Lifeguard', 'Nagasaki', 'quad', 'R', 't'], ['Blista Compact', 'Dinka', 'compact', 'R', 's'], ['Bobcat XL', 'Vapid', 'pickup', 'R', 'ts'],
  ['Boxville', 'Brute', 'van', 'R', 's'], ['Buffalo STX', 'Bravado', 'muscle', 'R', 't'], ['Burrito', 'Declasse', 'van', 'R', 'tsv'],
  ['Chino', 'Vapid', 'lowrider', 'R', 't'], ['Creado', 'Vapid', 'sedan', 'R', 'ts'], ['Emperor', 'Albany', 'sedan', 'R', 'ts'],
  ['Futo', 'Karin', 'coupe', 'R', 't'], ['Gauntlet Classic Custom', 'Bravado', 'muscle', 'R', 't'], ['Gauntlet Interceptor', 'Bravado', 'police', 'R', 't'],
  ['Intruder', 'Karin', 'sedan', 'R', 'ts'], ['Penumbra', 'Maibatsu', 'sports', 'R', 't'], ['Phoenix', 'Imponte', 'muscle', 'R', 'ts'],
  ['Police Cruiser (Interceptor)', 'Vapid', 'police', 'R', 't', null, null, null, 'Coche patrulla (Interceptor)'],
  ['Rancher', 'Declasse', 'offroad', 'R', 'ts'], ['Rebel', 'Karin', 'pickup', 'R', 's'], ['Slamvan', 'Vapid', 'lowrider', 'R', 't'],
  ['Sultan', 'Karin', 'sports', 'R', 'ts'], ['Toros', 'Pegassi', 'suv', 'R', 's'],

  ['8F Drafter', 'Obey', 'sports', 'G', '', 'Audi RS5 Coupé'], ['Airboat', null, 'motorboat', 'G', '', 'Panther Airboats'],
  ['Alvino V1', 'Principe', 'motorcycle', 'G', '', 'Ducati Panigale V2'], ['Avarus', 'Liberty City Cycles', 'motorcycle', 'G', '', 'T-Rex Rigid'],
  ['Blazer', 'Nagasaki', 'quad', 'G', '', 'Yamaha YFZ450'], ['BMX', 'PED Cycles', 'bicycle', 'G', ''], ['Bow Rider', null, 'boat', 'G', '', 'Yamaha 255XD'],
  ['Carbon RS', 'Nagasaki', 'motorcycle', 'G', '', 'Ducati 1199'], ['Clarion', null, 'motorboat', 'G', '', 'Cigarette 38’ Top Gun'],
  ['Cruiser', null, 'bicycle', 'G', '', 'beach cruiser'], ['Dodo', 'Mammoth', 'plane', 'G', '', 'de Havilland Canada DHC-2 Beaver'],
  ['Double T', 'Dinka', 'motorcycle', 'G', '', 'Aprilia RSV4'], ['Duster', 'Western Company', 'plane', 'G', '', 'Boeing-Stearman Model 75'],
  ['Mammatus', 'JoBuilt', 'plane', 'G', ''], ['Manchez', 'Maibatsu', 'motorcycle', 'G', ''], ['Marquis', 'Dinka', 'boat', 'G', ''],
  ['Maverick', 'Buckingham', 'helicopter', 'G', '', 'Bell 206L LongRanger'], ['Mobility Scooter', null, 'mobility', 'G', '', 'Pride Maxima 3', null, null, 'Scooter de movilidad'],
  ['Nimbus', 'Buckingham', 'plane', 'G', '', 'Cessna Citation X'], ['Police Maverick', 'Buckingham', 'helicopter', 'G', '', 'Bell 206L LongRanger'],
  ['Sanchez', 'Maibatsu', 'motorcycle', 'G', '', 'Honda CRF450X'], ['Sea Sparrow', null, 'helicopter', 'G', '', 'Bell 47'],
  ['Seashark', 'Speedophile', 'jetski', 'G', '', 'Yamaha WaveRunner'], ['New Seashark', 'Speedophile', 'jetski', 'G', '', 'Sea-Doo Spark'],
  ['Shamal', 'Buckingham', 'plane', 'G', '', 'Learjet 45'], ['Sovereign', 'Western', 'motorcycle', 'G', '', 'Harley-Davidson Road King'],
  ['SuperVolito', 'Buckingham', 'helicopter', 'G', '', 'Eurocopter EC145'], ['Verus', 'Dinka', 'quad', 'G', '', 'Honda FourTrax Rancher'],
  ['Zombie Chopper', 'Western', 'motorcycle', 'G', '', 'Exile Cycles'],
];

const STATUS = { C: 'CONFIRMED', N: 'OBSERVED', O: 'OBSERVED', R: 'REPORTED', G: 'REPORTED' };
const slugify = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const list = (arr, and) => (arr.length < 2 ? arr.join('') : `${arr.slice(0, -1).join(', ')} ${and} ${arr[arr.length - 1]}`);
const para = (text) => ({ type: 'paragraph', content: [{ type: 'text', text }] });
const doc = (...ps) => ({ type: 'doc', content: ps.filter(Boolean).map(para) });

export function buildVehicleCatalog(startNumber = 5, images = {}) {
  return V.map(([name, make, cls, level, seen, basedOn, noteEn, noteEs, nameEs], i) => {
    const title = make ? `${make} ${name}` : name;
    const titleEs = nameEs ? (make ? `${make} ${nameEs}` : nameEs) : title;
    const [clsEn, clsEs] = CLASSES[cls];
    const whereEn = list([...seen].map((c) => SEEN[c][0]), 'and');
    const whereEs = list([...seen].map((c) => SEEN[c][1]), 'y');
    const n = String(startNumber + i).padStart(3, '0');
    let shortEn; let shortEs; let p2En; let p2Es;
    if (level === 'C') {
      shortEn = noteEn; shortEs = noteEs;
      p2En = 'Its name comes straight from Rockstar, so it is confirmed for the game.';
      p2Es = 'El nombre viene directamente de Rockstar, así que está confirmado para el juego.';
    } else if (level === 'N') {
      shortEn = `${cap(clsEn)} spotted in ${whereEn}, with its name visible on the vehicle.`;
      shortEs = `${cap(clsEs)} que aparece en ${whereEs}, con el nombre visible en el propio vehículo.`;
      p2En = noteEn; p2Es = noteEs;
    } else if (level === 'O') {
      shortEn = `${cap(clsEn)}${make ? ` from ${make}` : ''} spotted in ${whereEn}. Name identified by the community.`;
      shortEs = `${cap(clsEs)}${make ? ` de ${make}` : ''} que aparece en ${whereEs}. Nombre identificado por la comunidad.`;
      p2En = 'Rockstar has not published this name for GTA VI: fans identified the model from its design and badges, so it could change at launch.';
      p2Es = 'Rockstar no ha publicado este nombre para GTA VI: la comunidad identificó el modelo por su diseño e insignias, así que podría cambiar en el lanzamiento.';
    } else if (level === 'R') {
      shortEn = `${cap(clsEn)} seen in ${whereEn}. The name circulates among fans but Rockstar has not shown it.`;
      shortEs = `${cap(clsEs)} que aparece en ${whereEs}. El nombre circula entre los fans, pero Rockstar no lo ha mostrado.`;
      p2En = 'The vehicle itself appears in official material, but its name does not come from Rockstar. Treat the name with caution until launch.';
      p2Es = 'El vehículo aparece en material oficial, pero el nombre no procede de Rockstar. Tómalo con cautela hasta el lanzamiento.';
    } else {
      shortEn = `${cap(clsEn)} listed for GTA VI by fan databases. Rockstar has not named it.`;
      shortEs = `${cap(clsEs)} que las bases de datos de fans incluyen en GTA VI. Rockstar no lo ha nombrado.`;
      p2En = 'Fan vehicle databases list it for GTA VI based on the official footage, but Rockstar has not confirmed the name. Treat it with caution.';
      p2Es = 'Las bases de datos de fans lo incluyen en GTA VI a partir de las imágenes oficiales, pero Rockstar no ha confirmado el nombre. Tómalo con cautela.';
    }
    const p1En = seen ? `The ${title} is ${clsEn} that appears in ${whereEn}.` : `The ${title} is ${clsEn}.`;
    const p1Es = seen ? `${titleEs}: ${clsEs} que aparece en ${whereEs}.` : `${titleEs}: ${clsEs}.`;
    const p3En = basedOn ? `Real-life inspiration: ${basedOn}.` : null;
    const p3Es = basedOn ? `Inspiración real: ${basedOn}.` : null;
    const source = level === 'G' || level === 'R' ? 'src-gtaintel' : SEEN_SOURCE[[...seen].find((c) => SEEN_SOURCE[c]) || 't'];
    return {
      key: `veh-cat-${slugify(title)}`,
      type: 'vehicles',
      slug: slugify(title),
      status: STATUS[level],
      featured: false,
      image: images[slugify(title)] || null,
      source,
      tags: ['vehicle', ...(make ? [slugify(make)] : []), cls],
      eyebrow: { en: `Vehicle ${n}`, es: `Vehículo ${n}` },
      title: titleEs === title ? { en: title } : { en: title, es: titleEs },
      short: { en: shortEn, es: shortEs },
      desc: { en: doc(p1En, p2En, p3En), es: doc(p1Es, p2Es, p3Es) },
      quote: {},
    };
  });
}
