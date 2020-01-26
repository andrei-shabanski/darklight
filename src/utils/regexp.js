export function matchPattern(value, pattern, callback) {
  const matchedValue = value.match(pattern);
  if (matchedValue) {
    callback(matchedValue);
  }
}
