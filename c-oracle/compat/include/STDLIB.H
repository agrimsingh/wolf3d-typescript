#ifndef WOLF_COMPAT_STDLIB_H
#define WOLF_COMPAT_STDLIB_H
#include_next <stdlib.h>
#include <stdio.h>

static inline char *wolf_ultoa_base(unsigned long value, char *str, int base) {
  static const char digits[] = "0123456789abcdefghijklmnopqrstuvwxyz";
  char tmp[65];
  int i = 0;
  int j = 0;

  if (!str) {
    return str;
  }
  if (base < 2 || base > 36) {
    str[0] = '\0';
    return str;
  }
  if (value == 0) {
    str[0] = '0';
    str[1] = '\0';
    return str;
  }
  while (value) {
    tmp[i++] = digits[value % (unsigned long)base];
    value /= (unsigned long)base;
  }
  while (i > 0) {
    str[j++] = tmp[--i];
  }
  str[j] = '\0';
  return str;
}

static inline char *ultoa(unsigned long value, char *str, int base) {
  return wolf_ultoa_base(value, str, base);
}

static inline char *ltoa(long value, char *str, int base) {
  unsigned long magnitude;
  char *out = str;

  if (!str) {
    return str;
  }
  if (base < 2 || base > 36) {
    str[0] = '\0';
    return str;
  }
  if (value < 0 && base == 10) {
    *out++ = '-';
    magnitude = (unsigned long)(-(value + 1)) + 1UL;
  } else {
    magnitude = (unsigned long)value;
  }
  wolf_ultoa_base(magnitude, out, base);
  return str;
}

static inline char *itoa(int value, char *str, int base) {
  return ltoa((long)value, str, base);
}
#endif
