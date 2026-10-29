import { useState, useRef, useCallback } from 'react';

export function useToast(autoDismissMs = 4500) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((toastData) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setToast(toastData);
    timerRef.current = setTimeout(() => {
      setToast(null);
    }, autoDismissMs);
  }, [autoDismissMs]);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setToast(null);
  }, []);

  return { toast, showToast, hideToast };
}

export default useToast;

