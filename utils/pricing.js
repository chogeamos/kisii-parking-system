
function calculatePricing(option) {
  if(option === '1') return { duration_minutes: 60, amount_ksh: 50 };
  if(option === '2') return { duration_minutes: 120, amount_ksh: 80 };
  if(option === '3') return { duration_minutes: 60, amount_ksh: 50 };
  return null;
}

module.exports = { calculatePricing };
