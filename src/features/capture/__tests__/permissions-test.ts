import { permissionState } from '../permissions';

describe('permissionState', () => {
  it.each([
    [null, 'loading'],
    [{ granted: false, canAskAgain: true, status: 'undetermined' }, 'undetermined'],
    [{ granted: true, canAskAgain: true, status: 'granted' }, 'granted'],
    [{ granted: false, canAskAgain: true, status: 'denied' }, 'denied'],
    // Android "don't ask again", or iOS after the one-shot prompt
    [{ granted: false, canAskAgain: false, status: 'denied' }, 'blocked'],
  ])('%p → %p', (response, expected) => {
    expect(permissionState(response)).toBe(expected);
  });
});
