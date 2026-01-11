const isValidExpiry = (month, year) => {
  const m = parseInt(month);
  let y = parseInt(year);

  if (m < 1 || m > 12) return false;

  if (year.length === 2) {
    y = 2000 + y;
  }

  const now = new Date();
  const expiry = new Date(y, m);

  return expiry >= new Date(now.getFullYear(), now.getMonth());
};

module.exports = { isValidExpiry };
