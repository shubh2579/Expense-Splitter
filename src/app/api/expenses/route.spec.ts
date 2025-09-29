// Test case for bug fix in expense creation logic

import { calculateExpenseSplit } from './route';

describe('Expense Creation Logic', () => {
  it('should correctly calculate the split amount based on the number of participants', () => {
    const amount = 100;
    const participantIds = ['participant1', 'participant2', 'participant3'];
    const splitAmount = calculateExpenseSplit(amount, participantIds);
    expect(splitAmount).toBe(100 / participantIds.length);
  });
});