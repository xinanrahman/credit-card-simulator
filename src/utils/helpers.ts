import confetti from "canvas-confetti";

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Creates cute confetti!
export const handleConfetti = () => {
  void confetti();
};
