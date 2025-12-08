// ============================================
// LOGO HELPER - Equipos, Ligas y Premios
// ============================================

const TEAM_LOGOS_BUCKET = 'team-logos';
const LEAGUE_LOGOS_BUCKET = 'league-logos';
const AWARD_LOGOS_BUCKET = 'award-logos';

// ============================================
// MAPEO DE EQUIPOS
// ============================================
export const teamSlugMap = {
  'Man United': 'manchesterunited',
  'Liverpool': 'liverpool',
  'Arsenal': 'arsenal',
  'Chelsea': 'chelsea',
  'Man City': 'manchestercity',
  'Tottenham': 'tottenham',
  'Newcastle': 'newcastle',
  'Aston Villa': 'astonvilla',
  'West Ham': 'west-ham',
  'Brighton': 'brighton',
  'Leeds': 'leeds',
  'Sunderland': 'sunderland',
  'Everton': 'everton',
  'Brentford': 'brentford',
  'Wolves': 'wolves',
  'Fulham': 'fulham',
  'Crystal Palace': 'crystalpalace',
  'Bournem.': 'bournemouth',
  'Nottingham': 'nottingham_forest',
  'Burnley': 'burnley',
  'Real Madrid': 'realmadrid',
  'Barcelona': 'barcelona',
  'Atl. Madrid': 'atlmadrid',
  'Sevilla': 'sevilla',
  'Real Betis': 'betis',
  'Valencia': 'valencia',
  'Villarreal': 'villarreal',
  'Athletic Club': 'athletic',
  'Real Sociedad': 'realsociedad',
  'Celta Vigo': 'celta',
  'Espanyol': 'espanyol',
  'Mallorca': 'mallorca',
  'Rayo Valle': 'rayovallecano',
  'Getafe': 'getafe',
  'Alaves': 'alaves',
  'Elche': 'elche',
  'Girona': 'girona',
  'Levante': 'levante',
  'Real Oviedo': 'realoviedo',
  'Ozasuna': 'osasuna',
  'Inter Milan': 'inter',
  'AC Milan': 'milan',
  'Juventus': 'juventus',
  'Napoli': 'napoli',
  'AS Roma': 'roma',
  'Lazio': 'lazio',
  'Atalanta': 'atalanta',
  'Fiorentina': 'fiorentina',
  'Torino': 'torino',
  'Bologna': 'bologna',
  'Sassuolo': 'sassuolo',
  'Udinese': 'udinese',
  'Genoa': 'genoa',
  'Cagliari': 'cagliari',
  'Hellas Verona': 'hellasverona',
  'Lecce': 'lecce',
  'Parma': 'parma',
  'Pisa': 'pisa',
  'Como': 'como',
  'Bayern M.': 'bayernmunchen',
  'Dortmund': 'borussiadortmund',
  'RB Leipzig': 'rbleipzig',
  'Leverkusen': 'bayerleverkusen',
  'Augsburg': 'augsburgo',
  'Borussia M.': 'bmonchengladbach',
  'Frankfurt': 'eintrachtfrankfurt',
  'Wolfsburg': 'wolfsburg',
  'Stuttgart': 'stuttgart',
  'Hoffenheim': 'hoffenheim',
  'Freiburg': 'freiburg',
  'Union Berlin': 'unionberlin',
  'Heidenheim': 'heidenheim',
  'St. Pauli': 'st_pauli',
  'Mainz': 'mainz05',
  'Hamburgo': 'hamburgo',
  'Werder Bremen': 'werderbremen',
  'Koln': 'koln',
  'Paris SG': 'psg',
  'Marseille': 'olimpiquemarseille',
  'Lyon': 'olimpiquelyon', 
  'Monaco': 'monaco',
  'Lille': 'lille',
  'Rennes': 'rennais',
  'Nice': 'nice',
  'Nantes': 'nantes',
  'Strasbourg': 'strasbourg',
  'Angers': 'angers',
  'Auxerre': 'auxerre',
  'Toulouse': 'toulouse',
  'Havre': 'havre',
  'Brest': 'stadebretois',
  'Lorient': 'lorient',
  'Metz': 'metz',
  'Racing': 'racingstrasbourg',
  'Ajax': 'ajax',
  'Benfica': 'benfica',
  'Sporting': 'sporting',
  'Pafos': 'pafos',
  'Slavia Praga': 'slavia_praga',
  'Kairat': 'kairat_almaty',
  'Galatasaray': 'galatasaray',
  'Copenhague': 'fc_copenhagen',
  'Eintracht': 'eintrachtfrankfurt',
  'Brujas': 'clubbrugge',
  'Union SG': 'union_saint_gilloise',
  'Qarabag FK': 'qarabag',
  'Olimpiakos': 'olympiacos',
  'Psv': 'psv',
  'Bodo/Glimt': 'bodo_glimt',
};

// ============================================
// MAPEO DE LIGAS (para equipos)
// ============================================
export const leagueMap = {
  'Premier League': 'premier-league',
  'La Liga': 'la-liga',
  'Champions League': 'champions-league',
  'Serie A': 'serie-a',
  'Bundesliga': 'bundesliga',
  'Ligue 1': 'ligue-1',
};

// ============================================
// MAPEO DE LOGOS DE LIGAS (para LeagueCard)
// ============================================
export const leagueLogoMap = {
  'Premier League': 'inglaterra',
  'La Liga': 'espana',
  'Serie A': 'italia',
  'Bundesliga': 'alemania',
  'Ligue 1': 'francia',
  'Champions League': 'champions',
  'Europa League': 'europa',
  'Conference League': 'conference',
};

// ============================================
// MAPEO DE LOGOS DE PREMIOS (para AwardCard)
// ============================================
export const awardLogoMap = {
  'Ballon D Or': 'balondeor',
  'Bota De Or': 'botadeoro',
  'The Best': 'thebest',
  'Yashin': 'yashin',
  'Golden Boy': 'goldenboy',
  'Club Of The Year': 'club',
};

// ============================================
// FUNCIONES PARA LOGOS DE EQUIPOS
// ============================================

/**
 * Obtiene la URL pública del logo de un equipo
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} leagueSlug - Slug de la liga
 * @param {string} teamSlug - Slug del equipo
 * @returns {string} URL pública del logo
 */
export function getTeamLogoUrl(supabase, leagueSlug, teamSlug) {
  const path = `leagues/${leagueSlug}/${teamSlug}.png`;
  
  const { data } = supabase.storage
    .from(TEAM_LOGOS_BUCKET)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

/**
 * Genera URL del logo basado en nombre de equipo y liga
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} teamName - Nombre del equipo
 * @param {string} leagueName - Nombre de la liga
 * @returns {string|null} URL del logo o null si no se encuentra
 */
export function getLogoUrlByTeamName(supabase, teamName, leagueName) {
  const teamSlug = teamSlugMap[teamName];
  const leagueSlug = leagueMap[leagueName];
  
  if (!teamSlug || !leagueSlug) {
    console.warn(`⚠️ Logo de equipo no encontrado: "${teamName}" en "${leagueName}"`);
    return null;
  }
  
  return getTeamLogoUrl(supabase, leagueSlug, teamSlug);
}

// ============================================
// FUNCIONES PARA LOGOS DE LIGAS
// ============================================

/**
 * Obtiene la URL pública del logo de una liga
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} leagueSlug - Slug de la liga
 * @returns {string} URL pública del logo
 */
export function getLeagueLogoUrl(supabase, leagueSlug) {
  const path = `${leagueSlug}.png`;
  
  const { data } = supabase.storage
    .from(LEAGUE_LOGOS_BUCKET)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

/**
 * Genera URL del logo de liga basado en nombre
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} leagueName - Nombre de la liga
 * @returns {string|null} URL del logo o null si no se encuentra
 */
export function getLogoUrlByLeagueName(supabase, leagueName) {
  const leagueSlug = leagueLogoMap[leagueName];
  
  if (!leagueSlug) {
    console.warn(`⚠️ Logo de liga no encontrado: "${leagueName}"`);
    return null;
  }
  
  return getLeagueLogoUrl(supabase, leagueSlug);
}

// ============================================
// FUNCIONES PARA LOGOS DE PREMIOS
// ============================================

/**
 * Obtiene la URL pública del logo de un premio
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} awardSlug - Slug del premio
 * @returns {string} URL pública del logo
 */
export function getAwardLogoUrl(supabase, awardSlug) {
  const path = `${awardSlug}.png`;
  
  const { data } = supabase.storage
    .from(AWARD_LOGOS_BUCKET)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

/**
 * Genera URL del logo de premio basado en nombre
 * @param {Object} supabase - Cliente de Supabase
 * @param {string} awardName - Nombre del premio
 * @returns {string|null} URL del logo o null si no se encuentra
 */
export function getLogoUrlByAwardName(supabase, awardName) {
  const awardSlug = awardLogoMap[awardName];
  
  if (!awardSlug) {
    console.warn(`⚠️ Logo de premio no encontrado: "${awardName}"`);
    return null;
  }
  
  return getAwardLogoUrl(supabase, awardSlug);
}