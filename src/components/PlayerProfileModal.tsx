/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Award,
  Users,
  Target,
  Edit2,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { useDomino } from '../context/DominoContext';
import { Player } from '../types/domino';
import { getShortPersianDate, toPersianDigits } from '../utils/persianDate';

interface PlayerProfileModalProps {
  player: Player | null;
  onClose: () => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({ player, onClose }) => {
  const { getPlayerStats, updatePlayer, deletePlayer } = useDomino();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(player?.name || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!player) return null;

  const stats = getPlayerStats(player.id);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedName.trim()) {
      updatePlayer(player.id, editedName.trim());
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    deletePlayer(player.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-3 pt-2">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg"
            style={{ backgroundColor: player.avatarColor }}
          >
            {player.name.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="bg-slate-950 border border-amber-500 rounded-lg px-2 py-1 text-sm text-slate-100 font-bold focus:outline-none w-36"
                  autoFocus
                />
                <button type="submit" className="p-1 rounded bg-amber-500 text-slate-950">
                  <Check className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100 truncate">{player.name}</h3>
                <button
                  onClick={() => {
                    setEditedName(player.name);
                    setIsEditing(true);
                  }}
                  className="p-1 text-slate-400 hover:text-amber-400"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="text-[11px] text-slate-400 mt-0.5">
              عضویت: {getShortPersianDate(player.createdAt)}
            </div>
          </div>
        </div>

        {/* Win Rate Overview Bar */}
        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-400 font-medium">درصد برد</span>
            <span className="text-amber-400 font-black tabular-nums">
              {toPersianDigits(stats.winRate)}٪
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-l from-amber-400 to-amber-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.winRate}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>{toPersianDigits(stats.wins)} برد</span>
            <span>{toPersianDigits(stats.losses)} باخت</span>
            <span>مجموع {toPersianDigits(stats.gamesPlayed)} بازی</span>
          </div>
        </div>

        {/* Key Dossier Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400">کل امتیازات</div>
              <div className="font-bold text-slate-100 tabular-nums">
                {toPersianDigits(stats.totalPointsScored)}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400">بیشترین امتیاز یک دست</div>
              <div className="font-bold text-slate-100 tabular-nums">
                {toPersianDigits(stats.highestRoundScore)}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400">پیروزی‌های بربوک</div>
              <div className="font-bold text-slate-100 tabular-nums">
                {toPersianDigits(stats.barbookWins)} مسابقه
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400">بهترین هم‌تیمی</div>
              <div className="font-bold text-slate-100 truncate">
                {stats.favoriteTeammateName || '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Player Button */}
        <div className="pt-2 border-t border-slate-800">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs"
              >
                تأیید حذف بازیکن
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
              >
                انصراف
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-2 text-rose-400/80 hover:text-rose-300 text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف این بازیکن از فهرست</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
