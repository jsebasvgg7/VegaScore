// src/components/KnockoutSection.jsx
import React, { useMemo } from 'react';
import { Trophy, Award, Target, AlertCircle } from 'lucide-react';
import KnockoutMatchCard from './KnockoutMatchCard';
import '../styles/KnockoutSection.css';

// ============================================
// CONFIGURACIÓN DE LLAVES FIFA
// ============================================
const ROUND_16_BRACKETS = {
  leftTop: [
    { id: 1, home: 'E-1', away: 'ABCDF-3', label: 'Llave 1', homeDesc: '1° Grupo E', awayDesc: '3° Grupo A/B/C/D/F' },
    { id: 2, home: 'I-1', away: 'CDFGH-3', label: 'Llave 2', homeDesc: '1° Grupo I', awayDesc: '3° Grupo C/D/F/G/H' },
    { id: 3, home: 'A-2', away: 'B-2', label: 'Llave 3', homeDesc: '2° Grupo A', awayDesc: '2° Grupo B' },
    { id: 4, home: 'F-1', away: 'C-2', label: 'Llave 4', homeDesc: '1° Grupo F', awayDesc: '2° Grupo C' }
  ],
  leftBottom: [
    { id: 5, home: 'K-2', away: 'L-2', label: 'Llave 5', homeDesc: '2° Grupo K', awayDesc: '2° Grupo L' },
    { id: 6, home: 'H-1', away: 'J-2', label: 'Llave 6', homeDesc: '1° Grupo H', awayDesc: '2° Grupo J' },
    { id: 7, home: 'D-1', away: 'BEFIJ-3', label: 'Llave 7', homeDesc: '1° Grupo D', awayDesc: '3° Grupo B/E/F/I/J' },
    { id: 8, home: 'G-1', away: 'AEHIJ-3', label: 'Llave 8', homeDesc: '1° Grupo G', awayDesc: '3° Grupo A/E/H/I/J' }
  ],
  rightTop: [
    { id: 9, home: 'C-1', away: 'F-2', label: 'Llave 9', homeDesc: '1° Grupo C', awayDesc: '2° Grupo F' },
    { id: 10, home: 'E-2', away: 'I-2', label: 'Llave 10', homeDesc: '2° Grupo E', awayDesc: '2° Grupo I' },
    { id: 11, home: 'A-1', away: 'CEFHI-3', label: 'Llave 11', homeDesc: '1° Grupo A', awayDesc: '3° Grupo C/E/F/H/I' },
    { id: 12, home: 'L-1', away: 'BHIJK-3', label: 'Llave 12', homeDesc: '1° Grupo L', awayDesc: '3° Grupo B/H/I/J/K' }
  ],
  rightBottom: [
    { id: 13, home: 'J-1', away: 'H-2', label: 'Llave 13', homeDesc: '1° Grupo J', awayDesc: '2° Grupo H' },
    { id: 14, home: 'D-2', away: 'G-2', label: 'Llave 14', homeDesc: '2° Grupo D', awayDesc: '2° Grupo G' },
    { id: 15, home: 'B-1', away: 'EFGIJ-3', label: 'Llave 15', homeDesc: '1° Grupo B', awayDesc: '3° Grupo E/F/G/I/J' },
    { id: 16, home: 'K-1', away: 'DEJL-3', label: 'Llave 16', homeDesc: '1° Grupo K', awayDesc: '3° Grupo D/E/J/L' }
  ]
};

const QUARTERS_BRACKETS = [
  { id: 'QF1', matches: [1, 2], label: 'Cuarto 1', section: 'leftTop' },
  { id: 'QF2', matches: [3, 4], label: 'Cuarto 2', section: 'leftTop' },
  { id: 'QF3', matches: [5, 6], label: 'Cuarto 3', section: 'leftBottom' },
  { id: 'QF4', matches: [7, 8], label: 'Cuarto 4', section: 'leftBottom' },
  { id: 'QF5', matches: [9, 10], label: 'Cuarto 5', section: 'rightTop' },
  { id: 'QF6', matches: [11, 12], label: 'Cuarto 6', section: 'rightTop' },
  { id: 'QF7', matches: [13, 14], label: 'Cuarto 7', section: 'rightBottom' },
  { id: 'QF8', matches: [15, 16], label: 'Cuarto 8', section: 'rightBottom' }
];

const SEMIS_BRACKETS = [
  { id: 'SF1', quarters: ['QF1', 'QF2'], label: 'Semifinal 1', side: 'left' },
  { id: 'SF2', quarters: ['QF3', 'QF4'], label: 'Semifinal 2', side: 'left' },
  { id: 'SF3', quarters: ['QF5', 'QF6'], label: 'Semifinal 3', side: 'right' },
  { id: 'SF4', quarters: ['QF7', 'QF8'], label: 'Semifinal 4', side: 'right' }
];

// ============================================
// HOOK PARA CALCULAR CLASIFICADOS
// ============================================
function useQualifiedTeams(groupPredictions) {
  return useMemo(() => {
    const GROUPS_DATA = {
      A: ['Mexico', 'South Africa', 'Korea Republic', 'Denmark*'],
      B: ['Canada', 'Italy*', 'Qatar', 'Switzerland'],
      C: ['Brazil', 'Morocco', 'Haiti', 'Scotland'],
      D: ['USA', 'Paraguay', 'Australia', 'Turkey*'],
      E: ['Germany', 'Curacao', 'Ivory Coast', 'Ecuador'],
      F: ['Netherlands', 'Japan', 'Poland*', 'Tunisia'],
      G: ['Belgium', 'Egypt', 'Iran', 'New Zealand'],
      H: ['Spain', 'Cabo Verde', 'Saudi Arabia', 'Uruguay'],
      I: ['France', 'Senegal', 'Bolivia*', 'Norway'],
      J: ['Argentina', 'Algeria', 'Austria', 'Jordan'],
      K: ['Portugal', 'Congo*', 'Uzbekistan', 'Colombia'],
      L: ['England', 'Croatia', 'Ghana', 'Panama']
    };

    const GROUPS = Object.keys(GROUPS_DATA);
    const qualified = {};
    const allThirds = [];

    GROUPS.forEach(group => {
      const standings = calculateGroupStandings(group, GROUPS_DATA[group], groupPredictions[group]);
      qualified[group] = {
        first: standings[0]?.team || null,
        second: standings[1]?.team || null,
        third: standings[2]?.team || null
      };
      if (standings[2]) {
        allThirds.push({ ...standings[2], group });
      }
    });

    // Ordenar mejores terceros
    const sortedThirds = allThirds
      .sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf)
      .slice(0, 8);

    const bestThirds = {};
    sortedThirds.forEach((team, idx) => {
      bestThirds[team.group] = { ...team, position: idx + 1 };
    });

    return { qualified, bestThirds };
  }, [groupPredictions]);
}

function calculateGroupStandings(group, teams, groupData) {
  if (!groupData?.matches) return [];
  
  const table = teams.map(team => ({
    team, played: 0, won: 0, drawn: 0, lost: 0,
    gf: 0, ga: 0, gd: 0, points: 0
  }));

  const matches = [
    [teams[0], teams[1]], [teams[2], teams[3]],
    [teams[0], teams[2]], [teams[1], teams[3]],
    [teams[0], teams[3]], [teams[1], teams[2]]
  ];

  Object.entries(groupData.matches).forEach(([idx, pred]) => {
    if (!pred.homeScore || !pred.awayScore) return;
    
    const [home, away] = matches[idx];
    const homeIdx = teams.indexOf(home);
    const awayIdx = teams.indexOf(away);
    const hs = parseInt(pred.homeScore);
    const as = parseInt(pred.awayScore);
    
    table[homeIdx].played++;
    table[awayIdx].played++;
    table[homeIdx].gf += hs;
    table[homeIdx].ga += as;
    table[awayIdx].gf += as;
    table[awayIdx].ga += hs;
    
    if (hs > as) {
      table[homeIdx].won++;
      table[homeIdx].points += 3;
      table[awayIdx].lost++;
    } else if (hs < as) {
      table[awayIdx].won++;
      table[awayIdx].points += 3;
      table[homeIdx].lost++;
    } else {
      table[homeIdx].drawn++;
      table[awayIdx].drawn++;
      table[homeIdx].points++;
      table[awayIdx].points++;
    }
    
    table[homeIdx].gd = table[homeIdx].gf - table[homeIdx].ga;
    table[awayIdx].gd = table[awayIdx].gf - table[awayIdx].ga;
  });

  return table.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function KnockoutSection({ 
  groupPredictions, 
  knockoutPredictions, 
  onUpdatePrediction 
}) {
  const { qualified, bestThirds } = useQualifiedTeams(groupPredictions);

  // Mantener registro de terceros ya asignados para evitar duplicados
  const usedThirds = new Set();

  // Función mejorada para obtener equipo según código
  function getTeam(code) {
    if (code.includes('-1')) {
      const group = code.charAt(0);
      return qualified[group]?.first;
    }
    if (code.includes('-2')) {
      const group = code.charAt(0);
      return qualified[group]?.second;
    }
    if (code.includes('-3')) {
      // Mejores terceros - buscar en grupos posibles sin repetir
      const possibleGroups = code.split('-')[0].split('');
      
      // Buscar el primer tercero disponible que no haya sido usado
      for (let g of possibleGroups) {
        if (bestThirds[g] && !usedThirds.has(g)) {
          const team = bestThirds[g].team;
          usedThirds.add(g); // Marcar como usado
          return team;
        }
      }
      
      // Si todos están usados, buscar cualquiera que esté en bestThirds
      for (let g of possibleGroups) {
        if (bestThirds[g]) {
          return bestThirds[g].team;
        }
      }
    }
    return null;
  }

  // Función para resetear el registro de terceros usados
  function resetUsedThirds() {
    usedThirds.clear();
  }

  // Obtener todos los equipos de octavos en orden para evitar duplicados
  function getAllRound16Teams() {
    resetUsedThirds();
    const teams = {};
    
    // Procesar en el orden de las llaves
    const allBrackets = [
      ...ROUND_16_BRACKETS.leftTop,
      ...ROUND_16_BRACKETS.leftBottom,
      ...ROUND_16_BRACKETS.rightTop,
      ...ROUND_16_BRACKETS.rightBottom
    ].sort((a, b) => a.id - b.id);

    allBrackets.forEach(match => {
      teams[match.id] = {
        home: getTeam(match.home),
        away: getTeam(match.away)
      };
    });

    return teams;
  }

  // Manejar predicción
  function handlePrediction(stage, id, team) {
    onUpdatePrediction({
      ...knockoutPredictions,
      [stage]: {
        ...knockoutPredictions[stage],
        [id]: team
      }
    });
  }

  // Obtener ganador de una fase
  function getWinner(stage, id) {
    return knockoutPredictions[stage]?.[id];
  }

  // Verificar si una fase está completa
  const isRound16Complete = Object.keys(knockoutPredictions.round16 || {}).length === 16;
  const isQuartersComplete = Object.keys(knockoutPredictions.quarters || {}).length === 8;
  const isSemisComplete = Object.keys(knockoutPredictions.semis || {}).length === 4;

  // Verificar si hay predicciones de grupos
  const hasGroupPredictions = Object.values(groupPredictions).some(g => 
    g?.matches && Object.keys(g.matches).length > 0
  );

  if (!hasGroupPredictions) {
    return (
      <div className="knockout-empty-state">
        <AlertCircle size={48} />
        <h3>Completa primero la Fase de Grupos</h3>
        <p>Las eliminatorias se habilitarán una vez que hayas predicho los partidos de la fase de grupos.</p>
      </div>
    );
  }

  // Obtener todos los equipos de octavos
  const round16Teams = getAllRound16Teams();

  return (
    <div className="knockout-section">
      {/* ========== OCTAVOS DE FINAL ========== */}
      <div className="knockout-stage">
        <div className="knockout-stage-header">
          <Trophy size={28} style={{ color: '#F59E0B' }} />
          <div>
            <h2>OCTAVOS DE FINAL</h2>
            <p>32 equipos clasificados • Selecciona los ganadores de cada llave</p>
          </div>
          <span className="knockout-badge">16 Llaves</span>
        </div>

        <div className="knockout-bracket-container">
          {/* Lado Izquierdo */}
          <div className="knockout-side">
            <h3 className="knockout-side-title">Lado Izquierdo</h3>
            
            {/* Superior Izquierdo */}
            <div className="knockout-quarter-section">
              <h4 className="knockout-quarter-title">Parte Superior</h4>
              <div className="knockout-matches-grid">
                {ROUND_16_BRACKETS.leftTop.map(match => (
                  <KnockoutMatchCard
                    key={match.id}
                    match={{ 
                      id: match.id, 
                      label: match.label, 
                      home: match.homeDesc,
                      away: match.awayDesc 
                    }}
                    homeTeam={round16Teams[match.id]?.home}
                    awayTeam={round16Teams[match.id]?.away}
                    selectedWinner={knockoutPredictions.round16?.[match.id]}
                    onSelect={(team) => handlePrediction('round16', match.id, team)}
                  />
                ))}
              </div>
            </div>

            {/* Inferior Izquierdo */}
            <div className="knockout-quarter-section">
              <h4 className="knockout-quarter-title">Parte Inferior</h4>
              <div className="knockout-matches-grid">
                {ROUND_16_BRACKETS.leftBottom.map(match => (
                  <KnockoutMatchCard
                    key={match.id}
                    match={{ 
                      id: match.id, 
                      label: match.label, 
                      home: match.homeDesc,
                      away: match.awayDesc 
                    }}
                    homeTeam={round16Teams[match.id]?.home}
                    awayTeam={round16Teams[match.id]?.away}
                    selectedWinner={knockoutPredictions.round16?.[match.id]}
                    onSelect={(team) => handlePrediction('round16', match.id, team)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Lado Derecho */}
          <div className="knockout-side">
            <h3 className="knockout-side-title">Lado Derecho</h3>
            
            {/* Superior Derecho */}
            <div className="knockout-quarter-section">
              <h4 className="knockout-quarter-title">Parte Superior</h4>
              <div className="knockout-matches-grid">
                {ROUND_16_BRACKETS.rightTop.map(match => (
                  <KnockoutMatchCard
                    key={match.id}
                    match={{ 
                      id: match.id, 
                      label: match.label, 
                      home: match.homeDesc,
                      away: match.awayDesc 
                    }}
                    homeTeam={round16Teams[match.id]?.home}
                    awayTeam={round16Teams[match.id]?.away}
                    selectedWinner={knockoutPredictions.round16?.[match.id]}
                    onSelect={(team) => handlePrediction('round16', match.id, team)}
                  />
                ))}
              </div>
            </div>

            {/* Inferior Derecho */}
            <div className="knockout-quarter-section">
              <h4 className="knockout-quarter-title">Parte Inferior</h4>
              <div className="knockout-matches-grid">
                {ROUND_16_BRACKETS.rightBottom.map(match => (
                  <KnockoutMatchCard
                    key={match.id}
                    match={{ 
                      id: match.id, 
                      label: match.label, 
                      home: match.homeDesc,
                      away: match.awayDesc 
                    }}
                    homeTeam={round16Teams[match.id]?.home}
                    awayTeam={round16Teams[match.id]?.away}
                    selectedWinner={knockoutPredictions.round16?.[match.id]}
                    onSelect={(team) => handlePrediction('round16', match.id, team)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== CUARTOS DE FINAL ========== */}
      {isRound16Complete && (
        <div className="knockout-stage">
          <div className="knockout-stage-header">
            <Trophy size={28} style={{ color: '#8B5CF6' }} />
            <div>
              <h2>CUARTOS DE FINAL</h2>
              <p>16 equipos restantes • Los mejores enfrentándose</p>
            </div>
            <span className="knockout-badge">8 Llaves</span>
          </div>

          <div className="knockout-quarters-grid">
            {QUARTERS_BRACKETS.map(qf => {
              const team1 = getWinner('round16', qf.matches[0]);
              const team2 = getWinner('round16', qf.matches[1]);

              return (
                <KnockoutMatchCard
                  key={qf.id}
                  match={{
                    id: qf.id,
                    label: qf.label,
                    home: `Ganador Llave ${qf.matches[0]}`,
                    away: `Ganador Llave ${qf.matches[1]}`
                  }}
                  homeTeam={team1}
                  awayTeam={team2}
                  selectedWinner={knockoutPredictions.quarters?.[qf.id]}
                  onSelect={(team) => handlePrediction('quarters', qf.id, team)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ========== SEMIFINALES ========== */}
      {isQuartersComplete && (
        <div className="knockout-stage">
          <div className="knockout-stage-header">
            <Trophy size={28} style={{ color: '#EF4444' }} />
            <div>
              <h2>SEMIFINALES</h2>
              <p>8 equipos restantes • A un paso de la gloria</p>
            </div>
            <span className="knockout-badge">4 Llaves</span>
          </div>

          <div className="knockout-semis-grid">
            {SEMIS_BRACKETS.map(sf => {
              const team1 = getWinner('quarters', sf.quarters[0]);
              const team2 = getWinner('quarters', sf.quarters[1]);

              return (
                <KnockoutMatchCard
                  key={sf.id}
                  match={{
                    id: sf.id,
                    label: sf.label,
                    home: `Ganador ${sf.quarters[0]}`,
                    away: `Ganador ${sf.quarters[1]}`
                  }}
                  homeTeam={team1}
                  awayTeam={team2}
                  selectedWinner={knockoutPredictions.semis?.[sf.id]}
                  onSelect={(team) => handlePrediction('semis', sf.id, team)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ========== FINAL Y TERCER PUESTO ========== */}
      {isSemisComplete && (
        <div className="knockout-stage">
          <div className="knockout-stage-header">
            <Trophy size={32} style={{ color: '#F59E0B' }} />
            <div>
              <h2>🏆 FINAL Y TERCER PUESTO</h2>
              <p>Los últimos partidos del torneo</p>
            </div>
          </div>

          <div className="knockout-final-grid">
            {/* Tercer Puesto */}
            <div className="knockout-final-card third-place">
              <div className="knockout-final-header">
                <Award size={24} style={{ color: '#CD7F32' }} />
                <h3>🥉 Tercer Puesto</h3>
              </div>
              <p className="knockout-final-description">
                Los perdedores de las semifinales SF2 y SF4 disputarán el tercer lugar
              </p>
              <div className="knockout-final-teams">
                <span>Perdedor SF2</span>
                <span className="knockout-vs-large">VS</span>
                <span>Perdedor SF4</span>
              </div>
            </div>

            {/* Final */}
            <div className="knockout-final-card champion">
              <div className="knockout-final-header">
                <Trophy size={28} style={{ color: '#F59E0B' }} />
                <h3>🏆 GRAN FINAL</h3>
              </div>
              <p className="knockout-final-description">
                ¿Quién será el campeón del mundo?
              </p>
              
              <KnockoutMatchCard
                match={{
                  id: 'final',
                  label: 'FINAL',
                  home: 'Ganador SF1',
                  away: 'Ganador SF3'
                }}
                homeTeam={getWinner('semis', 'SF1')}
                awayTeam={getWinner('semis', 'SF3')}
                selectedWinner={knockoutPredictions.final?.champion}
                onSelect={(team) => handlePrediction('final', 'champion', team)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}