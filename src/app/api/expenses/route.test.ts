// Test case for bug fix

import { calculateSplitAmount } from './route';

describe('Expense Split Calculation', () => {
  it('should correctly calculate split amount based on number of participants', () => {
    const amount = 100;
    const participantIds = [1, 2, 3, 4, 5];
    const splitAmount = calculateSplitAmount(amount, participantIds);
    expect(splitAmount).toBe(20);
  });

  it('should handle zero amount gracefully', () => {
    const amount = 0;
    const participantIds = [1, 2, 3];
    const splitAmount = calculateSplitAmount(amount, participantIds);
    expect(splitAmount).toBe(0);
  });
});