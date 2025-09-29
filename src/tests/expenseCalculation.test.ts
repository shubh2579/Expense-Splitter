import { calculateExpense } from '../app/api/expenses/utils';

describe('Expense Calculation', () => {
  it('should correctly divide recent expenses by the number of participants', () => {
    const amount = 100;
    const participantIds = ['participant1', 'participant2', 'participant3', 'participant4', 'participant5'];
    const result = calculateExpense(amount, participantIds);
    expect(result).toBe(20);
  });
});