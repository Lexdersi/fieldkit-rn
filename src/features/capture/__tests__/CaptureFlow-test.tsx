import { render, screen, userEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { CaptureFlow } from '../CaptureFlow';

// Only the permission hook matters here; the camera itself can't run in Node
const mockPermission = { current: null as null | { granted: boolean; canAskAgain: boolean; status: string } };
const mockRequest = jest.fn();
jest.mock('expo-camera', () => ({
  CameraView: () => null,
  useCameraPermissions: () => [mockPermission.current, mockRequest, jest.fn()],
}));
jest.mock('../fieldLocation', () => ({ getFieldLocation: jest.fn() }));

const renderFlow = () => render(<CaptureFlow onDone={jest.fn()} onCancel={jest.fn()} />);

describe('CaptureFlow permissions', () => {
  beforeEach(() => mockRequest.mockReset());

  it('explains before asking, and only asks when the user continues', async () => {
    mockPermission.current = { granted: false, canAskAgain: true, status: 'undetermined' };
    mockRequest.mockResolvedValue({ granted: false, canAskAgain: true, status: 'denied' });
    const user = userEvent.setup();
    await renderFlow();

    expect(screen.getByText(/stamps the photo with your GPS position/)).toBeOnTheScreen();
    expect(mockRequest).not.toHaveBeenCalled();

    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it('offers Settings, not another prompt, when access is blocked', async () => {
    mockPermission.current = { granted: false, canAskAgain: false, status: 'denied' };
    const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
    const user = userEvent.setup();
    await renderFlow();

    expect(screen.getByText(/only way to turn it back on is in Settings/)).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Open Settings' }));
    expect(openSettings).toHaveBeenCalled();
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('lets the user carry on without a photo after a denial', async () => {
    mockPermission.current = { granted: false, canAskAgain: true, status: 'denied' };
    const onCancel = jest.fn();
    const user = userEvent.setup();
    await render(<CaptureFlow onDone={jest.fn()} onCancel={onCancel} />);

    expect(screen.getByText(/still save the note without a photo/)).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Not now' }));
    expect(onCancel).toHaveBeenCalled();
  });
});
