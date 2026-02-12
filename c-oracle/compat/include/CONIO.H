#ifndef WOLF_COMPAT_CONIO_H
#define WOLF_COMPAT_CONIO_H

static inline int kbhit(void) { return 0; }
static inline int getch(void) { return 0; }
static inline int ungetch(int c) { return c; }
static inline int cprintf(const char *fmt, ...) {
  (void)fmt;
  return 0;
}
static inline void gotoxy(int x, int y) {
  (void)x;
  (void)y;
}
static inline void clrscr(void) {}
static inline void textcolor(int c) { (void)c; }
static inline void textbackground(int c) { (void)c; }
static inline void window(int left, int top, int right, int bottom) {
  (void)left;
  (void)top;
  (void)right;
  (void)bottom;
}

#endif
