import { HttpError, request } from '../api';

const respond = (status: number, body: string) =>
  Promise.resolve({ ok: status >= 200 && status < 300, status, text: () => Promise.resolve(body) } as Response);

describe('request', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
    jest.spyOn(console, 'log').mockImplementation(() => {}); // the __DEV__ request logger
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('retries a 5xx with backoff and returns the eventual success', async () => {
    fetchMock.mockReturnValueOnce(respond(503, 'busy')).mockReturnValueOnce(respond(200, '{"ok":true}'));

    const result = request<{ ok: boolean }>('/notes');
    await jest.runAllTimersAsync();

    await expect(result).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry a 4xx', async () => {
    fetchMock.mockReturnValue(respond(404, 'missing'));

    const result = request('/notes');
    const assertion = expect(result).rejects.toEqual(new HttpError(404, 'missing'));
    await jest.runAllTimersAsync();

    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not retry a body that is not JSON', async () => {
    fetchMock.mockReturnValue(respond(200, '<html>'));

    const result = request('/notes');
    const assertion = expect(result).rejects.toThrow('Failed to parse JSON response');
    await jest.runAllTimersAsync();

    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('gives up after the retry budget on repeated network failures', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));

    const result = request('/notes', { retries: 3 });
    const assertion = expect(result).rejects.toThrow('Network request failed');
    await jest.runAllTimersAsync();

    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
