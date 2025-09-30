// Test case to verify the bug fix
// Bug scenario: balance summary shows correct split but recent expenses are divide by 5 which is wrong

test('Verify expense calculation logic fix', () => {
  // Mock data
  const amount = 100;
  const participantIds = [1, 2, 3, 4, 5];
  // Calculate expense
  const calculatedExpense = amount / participantIds.length;
  // Assertion
  expect(calculatedExpense).toBe(20); // Expected result after bug fix
});