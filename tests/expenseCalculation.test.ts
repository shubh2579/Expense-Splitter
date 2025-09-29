import { calculateSplitAmount } from "../src/app/api/expenses/route"

describe('Expense Calculation', () => {
  test('Calculate split amount correctly for multiple participants', () => {
    const amount = 100;
    const participantIds = ['user1', 'user2', 'user3'];
    const expectedSplitAmount = amount / participantIds.length;
    const calculatedSplitAmount = calculateSplitAmount(amount, participantIds);
    expect(calculatedSplitAmount).toBe(expectedSplitAmount);
  });

  test('Handle zero participants gracefully', () => {
    const amount = 100;
    const participantIds = [];
    const calculatedSplitAmount = calculateSplitAmount(amount, participantIds);
    expect(calculatedSplitAmount).toBe(0);
  });

  test('Handle negative amount gracefully', () => {
    const amount = -100;
    const participantIds = ['user1'];
    const calculatedSplitAmount = calculateSplitAmount(amount, participantIds);
    expect(calculatedSplitAmount).toBe(0);
  });
});