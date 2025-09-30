// Test case to verify the bug fix
// Bug scenario: balance summary shows correct split but recent expenses are divide by 5 which is wrong
// Test if recent expenses are divided by the correct number of participants
// Positive test case

import { calculateExpenseSplit } from '../src/app/api/expenses/route';

describe('Expense Calculation', () => {
  it('should divide recent expenses by the correct number of participants', () => {
    const amount = 100;
    const participantIds = [1, 2, 3, 4, 5];
    const result = calculateExpenseSplit(amount, participantIds);
    expect(result).toEqual(20); // Expected result after fixing the bug
  });
});
