import {Animated, Easing} from 'react-native';

export const getNewId = () => {
  return Math.floor((new Date().getTime() + Math.random()) * 10);
  // return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
  //   c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
};

// Truncate the decimal part of a number to 5 digits and return as a string
export const truncDecimal = (num) => {
  const numParts = num.toString().split('.');
  return numParts[0].concat('.').concat(numParts[1].slice(0, 5));
};

// Correct a quirk in JS that doesn't mod negative number correctly
export const mod = (a, n) => {
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
  else if (typeof value === 'number') return false;
  else if (!value) return true;
  return false;
};

// Convert a string to title case
export function toTitleCase(str) {
  return str.toLowerCase().replace(/\b[A-Z|a-z]/g, function (t) {
    return t.toUpperCase();
  });
}

// Used to animate open and close of Settings Panel and Notebook Panel
export const animatePanels = (animatedState, toValue) => {
  Animated.timing(animatedState, {
    toValue: toValue,
    duration: 200,
    easing: Easing.linear,
    useNativeDriver: true,
  }).start();
};

export const readDataUrl = (file, callback) => {
  const reader = new FileReader();
  reader.onloadend = function (evt) {
    // console.log(evt.target.result);
    callback(evt.target.result);
  };
  reader.readAsDataURL(file);
};



