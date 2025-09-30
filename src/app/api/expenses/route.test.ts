import { calculateSplitAmount } from "./route"

describe("calculateSplitAmount", () => {
  it("should calculate split amount correctly based on the number of participants", () => {
    const amount = 100;
    const participantIds = ["user1", "user2", "user3"];
    const expectedSplitAmount = amount / participantIds.length;
    const calculatedSplitAmount = calculateSplitAmount(amount, participantIds);
    expect(calculatedSplitAmount).toBe(expectedSplitAmount);
  });
});