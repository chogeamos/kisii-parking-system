
const { calculatePricing } = require('../utils/pricing');

test('pricing for option 1 is 50 Ksh', () => {
  const p = calculatePricing('1');
  expect(p.amount_ksh).toBe(50);
  expect(p.duration_minutes).toBe(60);
});

test('pricing for option 2 is 80 Ksh', () => {
  const p = calculatePricing('2');
  expect(p.amount_ksh).toBe(80);
  expect(p.duration_minutes).toBe(120);
});
