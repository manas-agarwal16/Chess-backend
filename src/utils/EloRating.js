export function calculateElo(playerRating, opponentRating, outcome, K = 32) {
  // outcome: 1 = win, 0.5 = draw, 0 = loss
  const expectedScore =
    1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  let newRating = playerRating + K * (outcome - expectedScore);

  // Ensure minimum rating is 1200
  newRating = Math.max(newRating, 1200);
  return Math.round(newRating);
}
