import { calculateSplitAmount } from "./route"

describe("calculateSplitAmount", () => {
  it("correctly calculates split amount based on number of participants", () => {
    const amount = 100
    const participantIds = ["user1", "user2", "user3"]
    const expectedSplitAmount = amount / participantIds.length
    const calculatedSplitAmount = calculateSplitAmount(amount, participantIds)
    expect(calculatedSplitAmount).toBe(expectedSplitAmount)
  })
})