import {
  formatCoords,
  formatRelativeTime,
  mergeNotes,
  noteA11yLabel,
  resolveConflict,
  swipeOutcome,
  toLocalNote,
} from '../noteLogic';
import type { Note } from '../types';

const NOW = Date.UTC(2026, 9, 12, 12, 0, 0);
const MIN = 60_000;

const note = (over: Partial<Note>): Note => ({ id: '1', title: 'Site A', content: '', updatedAt: 0, ...over });

describe('formatRelativeTime', () => {
  it.each([
    [NOW - 10_000, 'just now'],
    [NOW + 30_000, 'just now'], // device clock slightly behind the server
    [NOW - 5 * MIN, '5 min ago'],
    [NOW - 3 * 60 * MIN, '3 h ago'],
    [NOW - 30 * 60 * MIN, 'yesterday'],
    [NOW - 4 * 24 * 60 * MIN, '4 days ago'],
  ])('%p → %p', (timestamp, expected) => {
    expect(formatRelativeTime(timestamp, NOW)).toBe(expected);
  });
});

describe('resolveConflict', () => {
  it('keeps an unsynced local edit even when the server copy is newer', () => {
    const local = note({ title: 'mine', pending: true, updatedAt: 100 });
    const remote = note({ title: 'theirs', updatedAt: 200 });
    expect(resolveConflict(local, remote).title).toBe('mine');
  });

  it('takes the newer copy once both sides are synced', () => {
    const local = note({ title: 'old', updatedAt: 100 });
    const remote = note({ title: 'new', updatedAt: 200 });
    expect(resolveConflict(local, remote).title).toBe('new');
  });

  it('prefers the server on an exact tie', () => {
    const local = note({ title: 'local', updatedAt: 100 });
    const remote = note({ title: 'server', updatedAt: 100 });
    expect(resolveConflict(local, remote).title).toBe('server');
  });
});

describe('mergeNotes', () => {
  it('puts local notes first, newest first, then server notes, with no duplicates', () => {
    const local = [note({ id: 'a', updatedAt: 1 }), note({ id: 'b', updatedAt: 2 }), note({ id: 's1', pending: true })];
    const server = [note({ id: 's1' }), note({ id: 's2' })];
    expect(mergeNotes(local, server).map((n) => n.id)).toEqual(['b', 'a', 's1', 's2']);
  });

  it('drops archived or deleted ids', () => {
    const merged = mergeNotes([note({ id: 'a' })], [note({ id: 's1' })], new Set(['a']));
    expect(merged.map((n) => n.id)).toEqual(['s1']);
  });
});

describe('toLocalNote', () => {
  it('marks a freshly written note as pending, keyed by its client id', () => {
    const local = toLocalNote({ clientId: 'local-1', title: 'T', content: 'C', createdAt: NOW, photo: null });
    expect(local).toMatchObject({ id: 'local-1', pending: true, updatedAt: NOW });
  });
});

describe('formatCoords', () => {
  it('uses hemispheres instead of signs', () => {
    expect(formatCoords({ latitude: 14.59951, longitude: 120.98422, accuracy: 5 })).toBe('14.5995° N, 120.9842° E');
    expect(formatCoords({ latitude: -33.8688, longitude: -70.6693, accuracy: null })).toBe('33.8688° S, 70.6693° W');
  });
});

describe('noteA11yLabel', () => {
  it('reads title, sync state, photo location and age in one sentence', () => {
    const label = noteA11yLabel(
      note({
        pending: true,
        updatedAt: NOW - 5 * MIN,
        photo: { uri: 'file:///p.jpg', coords: { latitude: 1, longitude: 2, accuracy: null }, locationNote: null },
      }),
      NOW
    );
    expect(label).toBe('Site A, waiting to sync, photo at 1.0000° N, 2.0000° E, 5 min ago');
  });

  it('says sync failed instead of waiting when the server rejected it', () => {
    expect(noteA11yLabel(note({ syncFailed: true }), NOW)).toBe('Site A, sync failed, saved on this device');
  });
});

describe('swipeOutcome', () => {
  const ROW = 360;
  const ACTIONS = 160;
  it.each([
    [-30, 0, 'close'], // short drag springs back
    [-100, 0, 'open'], // past half the actions → reveal them
    [-50, -900, 'open'], // short but quick flick still opens
    [-240, 0, 'commit'], // past 60 % of the row
    [-170, -2000, 'commit'], // fling past the actions commits
    [-100, -2000, 'open'], // fast but not far enough to be deliberate
  ])('dx %p, vx %p → %p', (dx, vx, expected) => {
    expect(swipeOutcome(dx, vx, ROW, ACTIONS)).toBe(expected);
  });
});
