#ifndef WOLF_COMPAT_DOS_H
#define WOLF_COMPAT_DOS_H

#include <stdint.h>
#include <string.h>

typedef struct WORDREGS { uint16_t ax, bx, cx, dx, si, di, cflag, flags; } WORDREGS;
typedef struct BYTEREGS { uint8_t al, ah, bl, bh, cl, ch, dl, dh; } BYTEREGS;
union REGS { WORDREGS x; BYTEREGS h; };

typedef struct SREGS { uint16_t es, cs, ss, ds; } SREGS;
typedef void (*interrupt_handler_t)(void);
typedef int (*harderr_handler_t)(unsigned, int, int, int);

static inline int int86(int int_no, union REGS *inregs, union REGS *outregs) {
  (void)int_no;
  (void)inregs;
  (void)outregs;
  return 0;
}

static inline int int86x(int int_no, union REGS *inregs, union REGS *outregs, struct SREGS *sregs) {
  (void)int_no;
  (void)inregs;
  (void)outregs;
  (void)sregs;
  return 0;
}

static inline void segread(struct SREGS *s) {
  if (s) {
    s->es = s->cs = s->ss = s->ds = 0;
  }
}

static inline void geninterrupt(int int_no) { (void)int_no; }

static inline interrupt_handler_t getvect(int int_no) {
  (void)int_no;
  return (interrupt_handler_t)0;
}

static inline void setvect(int int_no, interrupt_handler_t handler) {
  (void)int_no;
  (void)handler;
}

struct diskfree_t {
  uint16_t total_clusters;
  uint16_t avail_clusters;
  uint16_t sectors_per_cluster;
  uint16_t bytes_per_sector;
};

struct dostime_t {
  uint8_t hour;
  uint8_t minute;
  uint8_t second;
  uint8_t hsecond;
};

static inline unsigned _dos_getdiskfree(unsigned drive, struct diskfree_t *diskspace) {
  (void)drive;
  if (diskspace) {
    memset(diskspace, 0, sizeof(*diskspace));
  }
  return 0;
}

static inline unsigned _dos_gettime(struct dostime_t *timep) {
  if (timep) {
    memset(timep, 0, sizeof(*timep));
  }
  return 0;
}

static inline int inportb(unsigned port) {
  (void)port;
  return 0;
}

static inline void outportb(unsigned port, int value) {
  (void)port;
  (void)value;
}

static inline int peek(unsigned seg, unsigned off) {
  (void)seg;
  (void)off;
  return 0;
}

static inline int peekb(unsigned seg, unsigned off) {
  (void)seg;
  (void)off;
  return 0;
}

static inline void poke(unsigned seg, unsigned off, int value) {
  (void)seg;
  (void)off;
  (void)value;
}

static inline void pokeb(unsigned seg, unsigned off, int value) {
  (void)seg;
  (void)off;
  (void)value;
}

static inline void harderr(harderr_handler_t handler) {
  (void)handler;
}

#endif
