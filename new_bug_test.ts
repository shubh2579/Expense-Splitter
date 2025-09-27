// Test case for bug fix: balance summary shows correct split but recent expenses are divide by 5 which is wrong

import { calculateBalance } from '../utils/balanceCalculator';

describe('Balance Calculation', () => {
  it('should correctly calculate the balance after fixing the recent expenses division issue', () => {
    // Mock data
    const expenses = [100, 50, 30, 20, 10];
    const recentExpenses = 150;
    const expectedBalance = 210; // Expected balance after fixing the issue

    // Call the function with the fixed logic
    const calculatedBalance = calculateBalance(expenses, recentExpenses);

    // Assertion
    expect(calculatedBalance).toBe(expectedBalance);
  });
});