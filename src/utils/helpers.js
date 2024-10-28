/**
 * General helper utilities for lottery operations
 */

/**
 * Get number range limits based on difficulty level
 * @param {number} difficulty - Difficulty level (0-2)
 * @returns {Object} Object containing max values for numbers and etherball
 */
export function getDifficultyLimits(difficulty) {
  const limits = [
    { max: 25, etherballMax: 10 },
    { max: 50, etherballMax: 10 },
    { max: 75, etherballMax: 10 },
  ];
  return limits[difficulty] || limits[0];
}

/**
 * Generate a random lottery ticket based on given limits
 * @param {Object} limits - Number range limits
 * @param {number} limits.max - Maximum value for regular numbers
 * @param {number} limits.etherballMax - Maximum value for etherball
 * @returns {number[]} Array of four numbers (three regular + one etherball)
 */
export function generateRandomTicket(limits) {
  const getRandomNumber = (max) => Math.floor(Math.random() * max) + 1;

  return [
    getRandomNumber(limits.max),
    getRandomNumber(limits.max),
    getRandomNumber(limits.max),
    getRandomNumber(limits.etherballMax),
  ];
}

/**
 * Convert Wei to ETH
 * @param {bigint|string|number} wei - Amount in Wei
 * @returns {number} Amount in ETH
 */
export const convertWeiToEth = (wei) => Number(wei) / 1e18;
