// Pure note logic: no React, no native modules. Unit-tested in __tests__/noteLogic-test.ts.
import type { Coords, NewNote, Note } from './types';

// The local copy of a note the user just wrote, before the server has seen it.
export function toLocalNote(newNote: NewNote): Note {
  return {
    id: newNote.clientId,
    title: newNote.title,
    content: newNote.content,
    updatedAt: newNote.createdAt,
    pending: true,
    photo: newNote.photo,
  };
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatRelativeTime(timestamp: number, now: number): string {
  const diff = now - timestamp;
  if (diff < MINUTE) return 'just now'; // also covers small clock skew into the future
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} min ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} h ago`;
  if (diff < 2 * DAY) return 'yesterday';
  return `${Math.floor(diff / DAY)} days ago`;
}

// One note, two copies. An unsynced local edit always wins: dropping it would lose
// work the user has not been told about. Otherwise the newer write wins, and on an
// exact tie the server copy wins because it is the shared truth.
export function resolveConflict(local: Note, remote: Note): Note {
  if (local.pending) return local;
  return local.updatedAt > remote.updatedAt ? local : remote;
}

// Local notes on top (newest first), then server notes. Same id in both → resolveConflict.
// Hidden ids (archived or deleted on this device) are filtered out.
export function mergeNotes(local: Note[], server: Note[], hidden: ReadonlySet<string> = new Set()): Note[] {
  const serverById = new Map(server.map((n) => [n.id, n]));
  const merged: Note[] = [];

  for (const note of [...local].sort((a, b) => b.updatedAt - a.updatedAt)) {
    const remote = serverById.get(note.id);
    merged.push(remote ? resolveConflict(note, remote) : note);
    serverById.delete(note.id);
  }
  merged.push(...serverById.values());

  return merged.filter((n) => !hidden.has(n.id));
}

export function formatCoords({ latitude, longitude }: Coords): string {
  const lat = `${Math.abs(latitude).toFixed(4)}° ${latitude >= 0 ? 'N' : 'S'}`;
  const lon = `${Math.abs(longitude).toFixed(4)}° ${longitude >= 0 ? 'E' : 'W'}`;
  return `${lat}, ${lon}`;
}

// One sentence for VoiceOver/TalkBack: title first, then only the state that matters.
export function noteA11yLabel(note: Note, now: number): string {
  const parts = [note.title];
  if (note.syncFailed) parts.push('sync failed, saved on this device');
  else if (note.pending) parts.push('waiting to sync');
  if (note.photo) parts.push(note.photo.coords ? `photo at ${formatCoords(note.photo.coords)}` : 'photo, no location');
  if (note.updatedAt > 0) parts.push(formatRelativeTime(note.updatedAt, now));
  return parts.join(', ');
}

export type SwipeOutcome = 'close' | 'open' | 'commit';

// Where a released swipe settles. dx is negative for a left swipe; vx is in px/s
// (PanResponder reports px/ms, so its caller multiplies by 1000).
// Runs on the UI thread from the gesture-handler row, hence the worklet directive.
export function swipeOutcome(dx: number, vx: number, rowWidth: number, actionsWidth: number): SwipeOutcome {
  'worklet';
  const pastCommit = dx < -rowWidth * 0.6;
  const fling = vx < -1500 && dx < -actionsWidth;
  if (pastCommit || fling) return 'commit';
  if (dx < -actionsWidth / 2 || vx < -800) return 'open';
  return 'close';
}
