const detectCardNetwork = (number) => {
  const clean = number.replace(/[\s-]/g, "");

  if (clean.startsWith("4")) return "visa";

  const firstTwo = parseInt(clean.slice(0, 2));

  if (firstTwo >= 51 && firstTwo <= 55) return "mastercard";
  if (firstTwo === 34 || firstTwo === 37) return "amex";
  if (clean.startsWith("60") || clean.startsWith("65")) return "rupay";
  if (firstTwo >= 81 && firstTwo <= 89) return "rupay";

  return "unknown";
};

module.exports = { detectCardNetwork };
