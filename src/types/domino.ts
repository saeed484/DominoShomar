/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameMode = 'standard' | 'barbook' | 'hybrid';

export interface Player {
  id: string;
  name: string;
  avatarColor: string;
  createdAt: number;
}

export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPointsScored: number;
  highestRoundScore: number;
  barbookWins: number; // Only wins with diff > 101 and loser at 0
  zeroResetsCount: number; // Number of times score reset to 0
  favoriteTeammateId: string | null;
  favoriteTeammateName: string | null;
}

export interface RoundRecord {
  roundNumber: number;
  scoringTeam: 'team1' | 'team2';
  pointsEntered: number;
  team1ScoreBefore: number;
  team2ScoreBefore: number;
  team1ScoreAfter: number;
  team2ScoreAfter: number;
  isZeroReset: boolean; // Score wiped to 0-0 (not called barbook)
  isBarbookReset?: boolean; // Backwards compatibility
  timestamp: number;
  note?: string;
}

export interface DominoGame {
  id: string;
  date: string;
  timestamp: number;
  mode: GameMode;
  targetScore: number;
  maxBarbooksInHybrid: number; // Number of zero-resets allowed before converting to standard
  barbookResetCount: number; // Number of zero-resets occurred
  currentHybridPhase: 'barbook' | 'standard'; // If hybrid: 'barbook' (zero-reset rule active) or 'standard'
  team1: {
    name: string;
    playerIds: [string, string];
    score: number;
  };
  team2: {
    name: string;
    playerIds: [string, string];
    score: number;
  };
  rounds: RoundRecord[];
  status: 'active' | 'finished' | 'abandoned';
  winnerTeam: 'team1' | 'team2' | null;
  isBarbookWin: boolean; // True ONLY when winning with diff > 101 and loser score == 0
  finishedAt?: number;
}

export type ThemeType = 'domino-dark' | 'emerald-table' | 'royal-gold' | 'clean-light';

export interface AppSettings {
  theme: ThemeType;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  defaultTargetScore: number;
  defaultHybridBarbooks: number;
}
