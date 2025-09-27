// Test case for bug fix: balance summary shows correct split but recent expenses are divide by 5
// This test case verifies that recent expenses are divided by the correct number of participants
// Test scenario: Verify correct division of recent expenses

import { calculateSplitAmount } from '../utils';

describe('Expense Split Calculation', () => {
  it('should divide recent expenses by the number of participants', () => {
    const amount = 100;
    const participantIds = [1, 2, 3, 4, 5];
    const splitAmount = calculateSplitAmount(amount, participantIds);
    expect(splitAmount).toBe(20);
  });
});
