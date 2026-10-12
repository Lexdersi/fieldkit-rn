import { useEffect, useState } from 'react';

// Date.now() during render is impure (React Compiler skips the component, and two
// renders disagree). Read the clock in state and tick it, so "5 min ago" stays true.
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}
