/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Award,
  Target,
  Users,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useDomino } from '../context/DominoContext';
import { Player, PlayerStats } from '../types/domino';
import { toPersianDigits } from '../utils/persianDate';
import { soundManager } from '../utils/soundEffects';
import { PlayerProfileModal } from './PlayerProfileModal';

export const StatsView: React.FC = () => {
  const { players, gameHistory, getPlayerStats } = useDomino();
  const [sortBy, setSortBy] = useState<'winRate' | 'wins' | 'points'>('winRate');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Compute all player stats
  const playersWithStats = players.map((p) => ({
    player: p,
    stats: getPlayerStats(p.id),
  }));

  // Sort players
  const sortedPlayers = [...playersWithStats].sort((a, b) => {
    if (sortBy === 'winRate') {
      if (b.stats.winRate !== a.stats.winRate) return b.stats.winRate - a.stats.winRate;
      return b.stats.wins - a.stats.wins;
    }
    if (sortBy === 'wins') {
      if (b.stats.wins !== a.stats.wins) return b.stats.wins - a.stats.wins;
      return b.stats.winRate - a.stats.winRate;
    }
    return b.stats.totalPointsScored - a.stats.totalPointsScored;
  });

  // Records
  const topWinsPlayer = [...playersWithStats].sort((a, b) => b.stats.wins - a.stats.wins)[0];
  const topScorePlayer = [...playersWithStats].sort(
    (a, b) => b.stats.highestRoundScore - a.stats.highestRoundScore
  )[0];
  const topBarbookPlayer = [...playersWithStats].sort(
    (a, b) => b.stats.barbookWins - a.stats.barbookWins
  )[0];

  const totalGamesCount = gameHistory.length;
  const totalHandsCount = gameHistory.reduce((acc, g) => acc + g.rounds.length, 0);
  const totalBarbooksCount = gameHistory.reduce((acc, g) => acc + g.barbookResetCount, 0);

  return (
    <div className="flex flex-col gap-3.5 p-3.5">
      {/* Top Records Grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* Most Wins */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 flex flex-col items-center text-center shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1">
            <Trophy className="w-4 h-4" />
          </div>
          <span className="text-[10px] text-slate-400">بیشترین برد</span>
          <span className="text-xs font-bold text-slate-100 truncate w-full mt-0.5">
            {topWinsPlayer && topWinsPlayer.stats.wins > 0 ? topWinsPlayer.player.name : '—'}
          </span>
          <span className="text-[10px] text-amber-400 font-bold tabular-nums">
            {topWinsPlayer && topWinsPlayer.stats.wins > 0
              ? `${toPersianDigits(topWinsPlayer.stats.wins)} برد`
              : '۰'}
          </span>
        </div>

        {/* Highest Round Score */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 flex flex-col items-center text-center shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
            <Target className="w-4 h-4" />
          </div>
          <span className="text-[10px] text-slate-400">رکورد امتیاز دست</span>
          <span className="text-xs font-bold text-slate-100 truncate w-full mt-0.5">
            {topScorePlayer && topScorePlayer.stats.highestRoundScore > 0
              ? topScorePlayer.player.name
              : '—'}
          </span>
          <span className="text-[10px] text-emerald-400 font-bold tabular-nums">
            {topScorePlayer && topScorePlayer.stats.highestRoundScore > 0
              ? `${toPersianDigits(topScorePlayer.stats.highestRoundScore)} امتیاز`
              : '۰'}
          </span>
        </div>

        {/* Barbook Master */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 flex flex-col items-center text-center shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-1">
            <Flame className="w-4 h-4" />
          </div>
          <span className="text-[10px] text-slate-400">سلطان بربوک</span>
          <span className="text-xs font-bold text-slate-100 truncate w-full mt-0.5">
            {topBarbookPlayer && topBarbookPlayer.stats.barbookWins > 0
              ? topBarbookPlayer.player.name
              : '—'}
          </span>
          <span className="text-[10px] text-rose-400 font-bold tabular-nums">
            {topBarbookPlayer && topBarbookPlayer.stats.barbookWins > 0
              ? `${toPersianDigits(topBarbookPlayer.stats.barbookWins)} برد بربوک`
              : '۰'}
          </span>
        </div>
      </div>

      {/* Global Meta Stats */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-around text-center text-xs text-slate-300">
        <div>
          <span className="text-[10px] text-slate-500 block">کل مسابقات</span>
          <strong className="text-sm font-black text-slate-100 tabular-nums">
            {toPersianDigits(totalGamesCount)}
          </strong>
        </div>
        <div className="w-px h-6 bg-slate-800" />
        <div>
          <span className="text-[10px] text-slate-500 block">دست‌های ثبتی</span>
          <strong className="text-sm font-black text-slate-100 tabular-nums">
            {toPersianDigits(totalHandsCount)}
          </strong>
        </div>
        <div className="w-px h-6 bg-slate-800" />
        <div>
          <span className="text-[10px] text-slate-500 block">دفعات صفر شدن</span>
          <strong className="text-sm font-black text-amber-400 tabular-nums">
            {toPersianDigits(totalBarbooksCount)}
          </strong>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100">
            <Award className="w-4 h-4 text-amber-400" />
            <span>جدول رتبه‌بندی بازیکنان</span>
          </div>

          {/* Sort Switcher */}
          <div className="flex items-center gap-1 text-[11px] bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                soundManager.playTap();
                setSortBy('winRate');
              }}
              className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                sortBy === 'winRate' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              درصد برد
            </button>
            <button
              onClick={() => {
                soundManager.playTap();
                setSortBy('wins');
              }}
              className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                sortBy === 'wins' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              تعداد برد
            </button>
            <button
              onClick={() => {
                soundManager.playTap();
                setSortBy('points');
              }}
              className={`px-2 py-0.5 rounded-lg font-medium transition-all ${
                sortBy === 'points' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              امتیاز
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col divide-y divide-slate-800/60">
          {sortedPlayers.map(({ player, stats }, index) => {
            const rank = index + 1;
            return (
              <div
                key={player.id}
                onClick={() => {
                  soundManager.playTap();
                  setSelectedPlayer(player);
                }}
                className="p-3 flex items-center justify-between hover:bg-slate-850 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center tabular-nums ${
                      rank === 1
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-950'
                        : rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'text-slate-500'
                    }`}
                  >
                    {toPersianDigits(rank)}
                  </span>

                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: player.avatarColor }}
                  >
                    {player.name.charAt(0)}
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-100 block">{player.name}</span>
                    <span className="text-[10px] text-slate-500">
                      {toPersianDigits(stats.wins)} برد از {toPersianDigits(stats.gamesPlayed)} بازی
                    </span>
                  </div>
                </div>

                <div className="text-left flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-black text-amber-400 tabular-nums block">
                      {toPersianDigits(stats.winRate)}٪
                    </span>
                    <span className="text-[9px] text-slate-500 tabular-nums">
                      {toPersianDigits(stats.totalPointsScored)} امتیاز
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Profile Modal */}
      {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
};
