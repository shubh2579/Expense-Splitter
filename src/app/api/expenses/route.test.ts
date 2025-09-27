import { calculateSplitAmount } from './route';

describe('calculateSplitAmount', () => {
  it('should correctly calculate the split amount based on the number of participants', () => {
    const amount = 100;
    const participantIds = ['user1', 'user2', 'user3'];
    const expectedSplitAmount = amount / participantIds.length;
    const calculatedSplitAmount = calculateSplitAmount(amount, participantIds);
    expect(calculatedSplitAmount).toBe(expectedSplitAmount);
  });

  it('should handle edge case of zero participants', () => {
    const amount = 100;
    const participantIds = [];
    const expectedSplitAmount = 0;
    const calculatedSplitAmount = calculateSplitAmount(amount, participantIds);
    expect(calculatedSplitAmount).toBe(expectedSplitAmount);
  });

  it('should handle edge case of negative amount', () => {
    const amount = -100;
    const participantIds = ['user1', 'user2'];
    const expectedSplitAmount = amount / participantIds.length;
    const calculatedSplitAmount = calculateSplitAmount(amount, participantIds);
    expect(calculatedSplitAmount).toBe(expectedSplitAmount);
  });
});