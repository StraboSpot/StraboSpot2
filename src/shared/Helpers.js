// Truncate the decimal part of a number to 5 digits and return as a string
export const truncDecimal = (num) => {
  const numParts = num.toString().split('.');
  return numParts[0].concat('.').concat(numParts[1].slice(0,5));
};

// Correct a quirk in JS that doesn't mod negative number correctly
export const  mod = (a, n) => {
  return ((a % n) + n) % n;
};

// Round value to the number of decimal places in the variable places
export const roundToDecimalPlaces = (value, places) => {
  var multiplier = Math.pow(10, places);
  return (Math.round(value * multiplier) / multiplier);
};

export const toDegrees = (radians) => {
  return radians * 180 / Math.PI;
};

export const toRadians = (deg) => {
  return deg * (Math.PI / 180);
};

// Check if array, object, string, number is empty and if so return true
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  else if (typeof value === 'object') return Object.getOwnPropertyNames(value).length < 1;
  else if (typeof value === 'string') return value.length === 0;
  else if (typeof value === 'number') return value === 0;
  else if (!value) return true;
  return false;
};