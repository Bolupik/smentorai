import { useIsGuest } from "./useIsGuest";

const STORAGE_KEY = "guest_quiz_questions_answered";
const GUEST_LIMIT = 10;

export function useGuestQuizLimit() {
  const isGuest = useIsGuest();

  const getAnswered = (): number => {
    return parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
  };

  const increment = () => {
    const current = getAnswered();
    localStorage.setItem(STORAGE_KEY, String(current + 1));
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  const answeredCount = getAnswered();
  const remaining = Math.max(0, GUEST_LIMIT - answeredCount);
  const limitReached = isGuest && answeredCount >= GUEST_LIMIT;

  return { isGuest, answeredCount, remaining, limitReached, increment, reset, GUEST_LIMIT };
}
