#ifndef WOLF_COMPAT_BIOS_H
#define WOLF_COMPAT_BIOS_H
static inline unsigned bioskey(int cmd) { (void)cmd; return 0; }
#endif
