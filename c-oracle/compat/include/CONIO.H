#ifndef WOLF_COMPAT_CONIO_H
#define WOLF_COMPAT_CONIO_H
static inline int kbhit(void) { return 0; }
static inline int getch(void) { return 0; }
static inline int ungetch(int c) { return c; }
static inline int cprintf(const char *fmt, ...) { (void)fmt; return 0; }
#endif
