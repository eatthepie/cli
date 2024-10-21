export function getDifficultyLimits(difficulty) {
  const limits = [
    { max: 50, etherballMax: 5 },
    { max: 100, etherballMax: 10 },
    { max: 150, etherballMax: 15 },
  ];
  return limits[difficulty] || limits[0];
}

export function generateRandomTicket(limits) {
  return [
    Math.floor(Math.random() * limits.max) + 1,
    Math.floor(Math.random() * limits.max) + 1,
    Math.floor(Math.random() * limits.max) + 1,
    Math.floor(Math.random() * limits.etherballMax) + 1,
  ];
}
