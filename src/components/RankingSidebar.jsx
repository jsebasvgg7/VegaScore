// src/components/RankingSidebar.jsx
import React from 'react';
import { Trophy, Crown, Medal, Flame } from '../icons';

export default function RankingSidebar({ users }) {
  const sorted = users || [];

  return (
    <div className="bg-zinc-900 text-white rounded-xl shadow-xl p-6 sticky top-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 rounded-xl p-2">
            <Trophy className="w-6 h-6" />
          </div>

          <div>
            <h3 className="font-bold text-lg">Ranking Global</h3>
            <p className="text-xs text-zinc-400">Top jugadores</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-zinc-800 px-3 py-1 rounded-full">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-bold">{users.length}</span>
        </div>
      </div>

      {/* TOP 3 */}
      {sorted.length >= 3 && (
        <div className="flex items-end justify-center gap-2 mb-6 h-48">

          {/* 2° */}
          <div className="flex flex-col items-center flex-1">
            <div className="bg-zinc-700 rounded-full p-2 mb-2">
              <Medal className="w-6 h-6 text-zinc-300" />
            </div>

            <div className="bg-gradient-to-b from-zinc-500 to-zinc-600 rounded-t-xl w-full text-center pb-4 pt-8">
              <div className="font-bold text-sm mb-1">{sorted[1].name}</div>
              <div className="text-2xl font-bold">{sorted[1].points}</div>
              <div className="text-xs text-zinc-300">pts</div>
            </div>
          </div>

          {/* 1° */}
          <div className="flex flex-col items-center flex-1">
            <div className="bg-amber-400 rounded-full p-2 mb-2">
              <Crown className="w-8 h-8 text-amber-900" />
            </div>

            <div className="bg-gradient-to-b from-amber-300 to-amber-400 rounded-t-xl w-full text-center pb-4 pt-12">
              <div className="font-bold mb-1 text-amber-900">
                {sorted[0].name}
              </div>
              <div className="text-3xl font-bold text-amber-900">
                {sorted[0].points}
              </div>
              <div className="text-xs text-amber-800">pts</div>
            </div>
          </div>

          {/* 3° */}
          <div className="flex flex-col items-center flex-1">
            <div className="bg-orange-600 rounded-full p-2 mb-2">
              <Medal className="w-5 h-5 text-orange-200" />
            </div>

            <div className="bg-gradient-to-b from-orange-300 to-orange-400 rounded-t-xl w-full text-center pb-4 pt-4">
              <div className="font-bold text-sm mb-1 text-orange-900">
                {sorted[2].name}
              </div>
              <div className="text-xl font-bold text-orange-900">
                {sorted[2].points}
              </div>
              <div className="text-xs text-orange-800">pts</div>
            </div>
          </div>
        </div>
      )}

      {/* Resto */}
      {sorted.length > 3 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sorted.slice(3, 10).map((user, index) => (
            <div
              key={user.id}
              className="flex items-center justify-between bg-zinc-800 rounded-lg p-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-zinc-400 font-bold w-6">
                  #{index + 4}
                </span>
                <span className="font-semibold">{user.name}</span>
              </div>

              <span className="font-bold text-orange-400">{user.points}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
