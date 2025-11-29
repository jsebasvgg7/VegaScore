// src/pages/VegaScorePage.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import MatchCard from '../components/MatchCard';
import RankingSidebar from '../components/RankingSidebar';
import UserModal from '../components/UserModal';
import AdminModal from '../components/AdminModal';
import { getStorage, setStorage } from '../utils/storage';

export default function VegaScorePage() {
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [showUserModal, setShowUserModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [mData, uData, cData] = await Promise.all([
        getStorage('vegascore-matches'),
        getStorage('vegascore-users'),
        getStorage('vegascore-currentUser')
      ]);

      if (mData) setMatches(JSON.parse(mData.value));
      if (uData) setUsers(JSON.parse(uData.value));
      if (cData) setCurrentUser(JSON.parse(cData.value));
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveData = (key, data) => setStorage(key, JSON.stringify(data));

  const createUser = (newUser) => {
    if (users.some(u => u.name.toLowerCase() === newUser.name.toLowerCase())) {
      return alert('Este usuario ya existe');
    }

    const updated = [...users, newUser];
    setUsers(updated);
    setCurrentUser(newUser);

    saveData('vegascore-users', updated);
    saveData('vegascore-currentUser', newUser);
  };

  const selectUser = (user) => {
    setCurrentUser(user);
    saveData('vegascore-currentUser', user);
    setShowUserModal(false);
  };

  const addMatch = (match) => {
    const updated = [...matches, match];
    setMatches(updated);
    saveData('vegascore-matches', updated);
  };

  const makePrediction = (matchId, homeScore, awayScore) => {
    if (!currentUser) return alert('Selecciona un usuario');

    const updated = matches.map(match => {
      if (match.id !== matchId) return match;

      const pred = { userId: currentUser.id, userName: currentUser.name, homeScore, awayScore };
      const idx = match.predictions.findIndex(p => p.userId === currentUser.id);

      if (idx >= 0) match.predictions[idx] = pred;
      else match.predictions.push(pred);

      return match;
    });

    setMatches(updated);
    saveData('vegascore-matches', updated);
  };

  const setMatchResult = (matchId, homeScore, awayScore) => {
    const updated = matches.map(m =>
      m.id === matchId
        ? { ...m, result: { homeScore, awayScore }, status: 'finished' }
        : m
    );

    setMatches(updated);
    saveData('vegascore-matches', updated);
    calculatePoints(updated);
  };

  const calculatePoints = (matchesData) => {
    const scoreMap = {};
    users.forEach(u => scoreMap[u.id] = { points: 0, predictions: 0, correct: 0 });

    matchesData.forEach(match => {
      if (match.status !== 'finished' || !match.result) return;

      match.predictions.forEach(pred => {
        const score = scoreMap[pred.userId];
        if (!score) return;

        score.predictions++;

        const resultOutcome = Math.sign(match.result.homeScore - match.result.awayScore);
        const predOutcome = Math.sign(pred.homeScore - pred.awayScore);

        if (pred.homeScore === match.result.homeScore &&
            pred.awayScore === match.result.awayScore) {
          score.points += 5;
          score.correct++;
        } else if (resultOutcome === predOutcome) {
          score.points += 3;
          score.correct++;
        }
      });
    });

    const updatedUsers = users.map(u => ({
      ...u,
      ...scoreMap[u.id]
    }));

    setUsers(updatedUsers);
    saveData('vegascore-users', updatedUsers);

    if (currentUser) {
      const updated = updatedUsers.find(u => u.id === currentUser.id);
      setCurrentUser(updated);
      saveData('vegascore-currentUser', updated);
    }
  };

  const getUserPrediction = (match) =>
    currentUser ? match.predictions.find(p => p.userId === currentUser.id) : null;

  const sortedUsers = [...users].sort((a, b) => b.points - a.points);

  const pendingMatches = matches
    .filter(m => m.status === 'pending')
    .sort(
      (a, b) =>
        new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        currentUser={currentUser}
        users={users}
        onOpenUserModal={() => setShowUserModal(true)}
        onToggleSettings={() => setShowSettings(s => !s)}
        onOpenAdmin={() => setShowAdminModal(true)}
      />

      {showSettings && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex gap-3">
              <button className="btn-primary" onClick={() => setShowAdminModal(true)}>
                Agregar Partido
              </button>

              <button
                className="btn-green"
                onClick={() => {
                  const id = prompt('ID del partido:');
                  if (!id) return;
                  const h = prompt('Goles local:');
                  const a = prompt('Goles visitante:');
                  if (h !== null && a !== null) {
                    setMatchResult(id, parseInt(h), parseInt(a));
                  }
                }}
              >
                Finalizar Partido
              </button>
            </div>

            <div className="mt-3 text-sm text-gray-600">
              <strong>Partidos pendientes:</strong>
              {pendingMatches.map(m => (
                <p key={m.id}>• ID: {m.id} — {m.homeTeam} vs {m.awayTeam}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="title">Próximos Partidos</h2>

            {pendingMatches.length === 0 ? (
              <p>No hay partidos disponibles</p>
            ) : (
              <div className="space-y-4">
                {pendingMatches.map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    userPred={getUserPrediction(match)}
                    onPredict={makePrediction}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <RankingSidebar users={sortedUsers} />
      </div>

      {showUserModal && (
        <UserModal
          users={users}
          onSelect={selectUser}
          onCreate={createUser}
          onClose={() => setShowUserModal(false)}
        />
      )}

      {showAdminModal && (
        <AdminModal
          onAdd={addMatch}
          onClose={() => setShowAdminModal(false)}
        />
      )}
    </div>
  );
}
