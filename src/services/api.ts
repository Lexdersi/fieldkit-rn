export class HttpError extends Error {
  constructor(readonly status: number, readonly body: string) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
  }
}

type ApiOptions = RequestInit & {
  retries?: number;
  timeout?: number;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const logger = {
  request: (path: string, init?: RequestInit) => {
    if (__DEV__) console.log(`[API Request] ${init?.method ?? 'GET'} ${path}`, init);
  },
  response: (path: string, status: number, body?: any) => {
    if (__DEV__) console.log(`[API Response] ${path} -> ${status}`, body);
  },
  error: (path: string, error: any) => {
    if (__DEV__) console.log(`[API Error] ${path}`, error);
  }
};

export async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { retries = 3, timeout = 10_000, ...init } = options;
  let attempt = 0;

  logger.request(path, init);

  while (true) {
    attempt++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(path, { ...init, signal: controller.signal });
      const bodyText = await response.text();

      if (!response.ok) {
        throw new HttpError(response.status, bodyText);
      }

      let data: T;
      try {
        data = bodyText ? JSON.parse(bodyText) : ({} as T);
      } catch (parseError) {
        throw new Error(`Failed to parse JSON response: ${(parseError as Error).message}`);
      }

      logger.response(path, response.status, data);
      return data;

    } catch (error: any) {
      const isNetworkError = error.name === 'AbortError' || error.message === 'Network request failed' || !error.status;
      const status = error instanceof HttpError ? error.status : 0;
      
      const is5xx = status >= 500 && status < 600;
      const shouldRetry = (is5xx || isNetworkError) && attempt < retries;

      logger.error(path, { attempt, error, shouldRetry });

      if (!shouldRetry) {
        throw error;
      }

      await delay(Math.pow(2, attempt - 1) * 1000);
    } finally {
      clearTimeout(timer);
    }
  }
}