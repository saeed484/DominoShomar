/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  History as HistoryIcon,
  Flame,
  Award,
  Calendar,
  X,
  Layers,
  Search,
  RotateCcw,
} from 'lucide-react';
import { useDomino } from '../context/DominoContext';
import { DominoGame, GameMode } from '../types/domino';
import { toPersianDigits } from '../utils/persianDate';
import { soundManager } from '../utils/soundEffects';

export const HistoryView: React.FC = () => {
  const { gameHistory, players } = useDomino();
  const [filterMode, setFilterMode] = useState<GameMode | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<DominoGame | null>(null);

  const filteredGames = gameHistory.filter((game) => {
    if (filterMode !== 'all' && game.mode !== filterMode) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const inTeam1 = game.team1.name.toLowerCase().includes(q);
      const inTeam2 = game.team2.name.toLowerCase().includes(q);
      const playerMatches = [...game.team1.playerIds, ...game.team2.playerIds].some((pId) => {
        const p = players.find((pl) => pl.id === pId);
        return p && p.name.toLowerCase().includes(q);
      });
      return inTeam1 || inTeam2 || playerMatches;
    }
    return true;
  });

  const getPlayerName = (id: string) => {
    return players.find((p) => p.id === id)?.name || 'بازیکن';
  };

  return (
    <div className="flex flex-col gap-3 p-3.5">
      {/* Search & Filter Header */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در تیم‌ها یا نام بازیکنان..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => {
              soundManager.playTap();
              setFilterMode('all');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'all'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            همه بازی‌ها ({toPersianDigits(gameHistory.length)})
          </button>
          <button
            onClick={() => {
              soundManager.playTap();
              setFilterMode('standard');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'standard'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            امتیازی
          </button>
          <button
            onClick={() => {
              soundManager.playTap();
              setFilterMode('barbook');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'barbook'
                ? 'bg-rose-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            بربوک
          </button>
          <button
            onClick={() => {
              soundManager.playTap();
              setFilterMode('hybrid');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'hybrid'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            ترکیبی
          </button>
        </div>
      </div>

      {/* History Games List */}
      <div className="flex flex-col gap-2.5">
        {filteredGames.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800/60 p-4">
            <HistoryIcon className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
            هیچ بازی ثبت‌شده‌ای یافت نشد. پس از انجام بازی‌ها، نتایج و دست‌ها اینجا آرشیو می‌شوند.
          </div>
        ) : (
          filteredGames.map((game) => {
            const isTeam1Winner = game.winnerTeam === 'team1';
            return (
              <div
                key={game.id}
                onClick={() => {
                  soundManager.playTap();
                  setSelectedGame(game);
                }}
                className="p-3.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 rounded-2xl flex flex-col gap-2.5 cursor-pointer transition-all active:scale-[0.99] shadow-sm"
              >
                {/* Card Top: Date & Mode badge */}
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{game.date}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {game.isBarbookWin && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px] flex items-center gap-1 border border-rose-500/30">
                        <Flame className="w-3 h-3 text-rose-400" />
                        برد بربوک
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-medium text-[10px]">
                      {game.mode === 'standard' && 'امتیازی'}
                      {game.mode === 'barbook' && 'بربوک'}
                      {game.mode === 'hybrid' && 'ترکیبی'}
                    </span>
                  </div>
                </div>

                {/* Card Middle: Teams & Final Scores */}
                <div className="grid grid-cols-2 gap-2 py-1 items-center">
                  {/* Team 1 summary */}
                  <div
                    className={`p-2 rounded-xl border flex items-center justify-between ${
                      isTeam1Winner
                        ? 'bg-blue-950/40 border-blue-600/50 text-blue-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate flex items-center gap-1">
                        {isTeam1Winner && <Award className="w-3 h-3 text-amber-400 shrink-0" />}
                        <span>{game.team1.name}</span>
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">
                        {getPlayerName(game.team1.playerIds[0])} و{' '}
                        {getPlayerName(game.team1.playerIds[1])}
                      </div>
                    </div>
                    <span className="text-lg font-black tabular-nums mr-2">
                      {toPersianDigits(game.team1.score)}
                    </span>
                  </div>

                  {/* Team 2 summary */}
                  <div
                    className={`p-2 rounded-xl border flex items-center justify-between ${
                      !isTeam1Winner && game.winnerTeam === 'team2'
                        ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate flex items-center gap-1">
                        {!isTeam1Winner && <Award className="w-3 h-3 text-amber-400 shrink-0" />}
                        <span>{game.team2.name}</span>
                      </div>
                      <div className="text-[9px] text-slate-400 truncate">
                        {getPlayerName(game.team2.playerIds[0])} و{' '}
                        {getPlayerName(game.team2.playerIds[1])}
                      </div>
                    </div>
                    <span className="text-lg font-black tabular-nums mr-2">
                      {toPersianDigits(game.team2.score)}
                    </span>
                  </div>
                </div>

                {/* Card Bottom: Rounds & Barbook resets info */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-2">
                  <div className="flex items-center gap-3">
                    <span>{toPersianDigits(game.rounds.length)} دست بازی</span>
                    {game.barbookResetCount > 0 && (
                      <span className="text-amber-400 font-bold">
                        {toPersianDigits(game.barbookResetCount)} بار صفر شدن امتیاز
                      </span>
                    )}
                  </div>
                  <span className="text-amber-400 font-medium">مشاهده جزئیات دست‌ها ←</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detailed Game Hands Modal */}
      {selectedGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-3 relative max-h-[85vh]">
            {/* Close button */}
            <button
              onClick={() => setSelectedGame(null)}
              className="absolute top-4 left-4 p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">جزئیات کامل دست‌های مسابقه</h3>
                {selectedGame.isBarbookWin && (
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[9px]">
                    بربوک
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {selectedGame.date} • هدف {toPersianDigits(selectedGame.targetScore)} امتیاز
              </div>
            </div>

            {/* Match Teams Header */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-center">
              <div>
                <span className="text-[11px] font-bold text-blue-400 block truncate">
                  {selectedGame.team1.name}
                </span>
                <span className="text-xl font-black text-slate-100 tabular-nums">
                  {toPersianDigits(selectedGame.team1.score)}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-400 block truncate">
                  {selectedGame.team2.name}
                </span>
                <span className="text-xl font-black text-slate-100 tabular-nums">
                  {toPersianDigits(selectedGame.team2.score)}
                </span>
              </div>
            </div>

            {/* Hands List */}
            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2 pr-1">
              {selectedGame.rounds.map((round) => {
                const scoringName =
                  round.scoringTeam === 'team1'
                    ? selectedGame.team1.name
                    : selectedGame.team2.name;

                return (
                  <div
                    key={round.roundNumber}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      round.isBarbookReset
                        ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                        : 'bg-slate-950/70 border-slate-800/70 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 font-bold text-[9px] flex items-center justify-center tabular-nums">
                        {toPersianDigits(round.roundNumber)}
                      </span>
                      <div>
                        <div className="font-bold flex items-center gap-1">
                          <span
                            className={
                              round.scoringTeam === 'team1' ? 'text-blue-400' : 'text-emerald-400'
                            }
                          >
                            {scoringName}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            (+{toPersianDigits(round.pointsEntered)})
                          </span>
                        </div>
                        {(round.isZeroReset || round.isBarbookReset) && (
                          <div className="text-[9px] text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                            <RotateCcw className="w-2.5 h-2.5 text-amber-400" />
                            <span>امتیاز هر دو تیم صفر شد (شمارش از نو)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-xs font-black tabular-nums tracking-wide">
                      <span className="text-blue-400">{toPersianDigits(round.team1ScoreAfter)}</span>
                      <span className="text-slate-500 mx-1">-</span>
                      <span className="text-emerald-400">{toPersianDigits(round.team2ScoreAfter)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setSelectedGame(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
