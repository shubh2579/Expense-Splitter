// Test case for bug fix in expense display logic

import { calculateExpenseDisplay } from './page';

describe('Expense Display Logic', () => {
  it('should correctly display the expense amount based on the number of participants', () => {
    const expense = {
      amount: 200,
      participants: ['participant1', 'participant2', 'participant3', 'participant4', 'participant5']
    };
    const displayAmount = calculateExpenseDisplay(expense);
    expect(displayAmount).toBe(expense.amount / expense.participants.length);
  });
});