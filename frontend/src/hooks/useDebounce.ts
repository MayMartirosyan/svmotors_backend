import { useCallback, useRef } from "react";

export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timerRef = useRef<any>();

  return useCallback(
    (...args: Parameters<T>) => {
      clearTimeout(timerRef.current!);
      timerRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;
};
