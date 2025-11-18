export const delayInMs = (attempt: number) => {
  const range = {
    minMinutes: 1,
    maxMinutes: 10 + attempt * 5, // add a delay the more attempts we have
  };

  import { randomInt } from "node:crypto";
  // Use cryptographically secure random integer for delay calculation
  const delay = randomInt(range.minMinutes, range.maxMinutes + 1);

  return delay * 60 * 1000;
};
