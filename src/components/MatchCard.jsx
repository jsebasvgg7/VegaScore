// src/components/MatchCard.jsx
import React from 'react';

export default function MatchCard({ match, userPred, onPredict }) {
  return (
    <div className="border border-zinc-300 rounded-xl p-4 hover:shadow-lg transition">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-zinc-900 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
          ⚡ {match.league}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {/* EQUIPO LOCAL */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-zinc-100 rounded-full w-10 h-10 flex items-center justify-center text-xl">
              {match.homeTeamLogo}
            </div>
            <span className="font-semibold text-lg">{match.homeTeam}</span>
          </div>

          {userPred && (
            <span className="text-2xl font-bold text-blue-600">
              {userPred.homeScore}
            </span>
          )}
        </div>

        {/* VISITANTE */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-zinc-100 rounded-full w-10 h-10 flex items-center justify-center text-xl">
              {match.awayTeamLogo}
            </div>
            <span className="font-semibold text-lg">{match.awayTeam}</span>
          </div>

          {userPred && (
            <span className="text-2xl font-bold text-blue-600">
              {userPred.awayScore}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-zinc-500 mb-4">
        <span>
          📅{' '}
          {new Date(match.date).toLocaleDateString('es-ES', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
          })}
        </span>

        <span>🕐 {match.time}</span>
      </div>

      {/* INPUTS */}
      {!userPred ? (
        <div className="bg-zinc-50 rounded-lg p-3 flex items-center justify-center gap-2">
          <input
            id={`home-${match.id}`}
            type="number"
            min="0"
            max="20"
            placeholder="0"
            className="w-16 px-3 py-2 border rounded-lg text-center text-lg font-bold"
          />

          <span className="font-bold text-xl">-</span>

          <input
            id={`away-${match.id}`}
            type="number"
            min="0"
            max="20"
            placeholder="0"
            className="w-16 px-3 py-2 border rounded-lg text-center text-lg font-bold"
          />

          <button
            onClick={() => {
              const home = parseInt(
                document.getElementById(`home-${match.id}`).value
              );
              const away = parseInt(
                document.getElementById(`away-${match.id}`).value
              );

              if (!isNaN(home) && !isNaN(away))
                onPredict(match.id, home, away);
              else alert('Ingresa valores válidos');
            }}
            className="ml-2 bg-orange-500 text-white px-6 py-2 rounded-lg"
          >
            Predecir
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            const home = prompt(
              'Nuevos goles equipo local:',
              userPred.homeScore
            );
            const away = prompt(
              'Nuevos goles equipo visitante:',
              userPred.awayScore
            );

            if (home !== null && away !== null)
              onPredict(match.id, parseInt(home), parseInt(away));
          }}
          className="w-full bg-blue-50 text-blue-600 px-4 py-2 rounded-lg"
        >
          Editar Predicción
        </button>
      )}
    </div>
  );
}
