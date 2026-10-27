/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, UserPlus, Trophy, Flame, ChevronLeft } from 'lucide-react';
import { useDomino } from '../context/DominoContext';
import { Player } from '../types/domino';
import { toPersianDigits } from '../utils/persianDate';
import { soundManager } from '../utils/soundEffects';
import { PlayerProfileModal } from './PlayerProfileModal';

export const PlayersView: React.FC = () => {
  const { players, addPlayer, getPlayerStats } = useDomino();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');

  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    addPlayer(newPlayerName.trim());
    setNewPlayerName('');
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col gap-3 p-3.5">
      {/* Search & Add Header */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی بازیکن..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          onClick={() => {
            soundManager.playTap();
            setShowAddModal(true);
          }}
          className="h-9 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>بازیکن جدید</span>
        </button>
      </div>

      {/* Players List */}
      <div className="flex flex-col gap-2">
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800/60 p-4">
            هیچ بازیکنی با این نام یافت نشد. می‌توانید بازیکن جدیدی اضافه کنید!
          </div>
        ) : (
          filteredPlayers.map((player) => {
            const stats = getPlayerStats(player.id);
            return (
              <div
                key={player.id}
                onClick={() => {
                  soundManager.playTap();
                  setSelectedPlayer(player);
                }}
                className="p-3 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 rounded-2xl flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-black text-white shadow"
                    style={{ backgroundColor: player.avatarColor }}
                  >
                    {player.name.charAt(0)}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{player.name}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>{toPersianDigits(stats.gamesPlayed)} بازی</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">
                        {toPersianDigits(stats.wins)} برد
                      </span>
                      <span>•</span>
                      <span className="text-rose-400">{toPersianDigits(stats.losses)} باخت</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      <span className="text-xs font-black text-amber-400 tabular-nums">
                        {toPersianDigits(stats.winRate)}٪
                      </span>
                    </div>
                    {stats.barbookWins > 0 && (
                      <div className="flex items-center gap-0.5 text-[9px] text-rose-400 mt-0.5">
                        <Flame className="w-2.5 h-2.5" />
                        <span>{toPersianDigits(stats.barbookWins)} بربوک</span>
                      </div>
                    )}
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Player Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleCreatePlayer}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-xs w-full flex flex-col gap-3 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-slate-100">افزودن بازیکن جدید</h3>
            <p className="text-xs text-slate-400">
              نام یا لقب بازیکن دومینو را وارد کنید:
            </p>
            <input
              type="text"
              autoFocus
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="مثال: آرش، کامبیز، پوریا..."
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                ثبت بازیکن
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Player Dossier Modal */}
      {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
};
