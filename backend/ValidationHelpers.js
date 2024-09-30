export function requireType(value, type) {
  if (value instanceof Array) {
    for (const val of value) {
      if ((typeof val) !== type) {
        return false;
      }
    }
    return true;
  }
  return typeof value === type;
}

export function requireValidEmail(value) {
  if(requireType(value, 'string')) {
    const emailRegex = /.+\@.+\..+/;
    return emailRegex.test(value);
  }
}

export function requireLengthGreaterThan(value, length) {
  if (typeof value.length !== 'undefined') {
    return value.length > length;
  }
  return false;
}