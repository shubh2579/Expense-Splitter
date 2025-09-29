// Test case to verify the bug fix for recent expenses division

import { calculateExpense } from '../route';

describe('Expense Calculation', () => {
  it('should correctly divide the amount by the number of participants', () => {
    const amount = 100;
    const participantIds = [1, 2, 3, 4, 5];
    const result = calculateExpense(amount, participantIds);
    expect(result).toBe(20);
  });
});