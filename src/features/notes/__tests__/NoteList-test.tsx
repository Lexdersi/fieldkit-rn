import { fireEvent, render, screen } from '@testing-library/react-native';
import { noteA11yLabel } from '../noteLogic';
import { NoteRow } from '../NoteRow';
import { SwipeRow } from '../swipe/SwipeRow';
import type { Note } from '../types';

const NOW = Date.UTC(2026, 9, 12, 12, 0, 0);
const pending: Note = { id: 'local-1', title: 'Bridge pier 3', content: 'Crack on north face', updatedAt: NOW, pending: true };

async function renderRow(handlers: { onPress?: () => void; onArchive?: () => void; onDelete?: () => void } = {}) {
  return render(
    <SwipeRow
      label={noteA11yLabel(pending, NOW)}
      onPress={handlers.onPress ?? jest.fn()}
      onArchive={handlers.onArchive ?? jest.fn()}
      onDelete={handlers.onDelete ?? jest.fn()}
    >
      <NoteRow note={pending} now={NOW} />
    </SwipeRow>
  );
}

describe('note row for screen reader users', () => {
  it('is one button whose name includes the sync state', async () => {
    await renderRow();
    expect(screen.getByRole('button', { name: 'Bridge pier 3, waiting to sync, just now' })).toBeOnTheScreen();
  });

  it('exposes archive and delete as accessibility actions, since swiping is not available', async () => {
    const onArchive = jest.fn();
    const onDelete = jest.fn();
    await renderRow({ onArchive, onDelete });
    const row = screen.getByRole('button', { name: /Bridge pier 3/ });

    await fireEvent(row, 'accessibilityAction', { nativeEvent: { actionName: 'archive' } });
    await fireEvent(row, 'accessibilityAction', { nativeEvent: { actionName: 'delete' } });

    expect(onArchive).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('keeps the visually covered swipe buttons out of the accessibility tree', async () => {
    await renderRow();
    // Present for sighted users behind the row, hidden from VoiceOver/TalkBack
    expect(screen.queryByRole('button', { name: 'Archive' })).not.toBeOnTheScreen();
  });
});

describe('NoteRow', () => {
  it('pending badge (small snapshot)', async () => {
    await render(<NoteRow note={pending} now={NOW} />);
    expect(screen.getByText('Pending sync')).toMatchSnapshot();
  });
});
