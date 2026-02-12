#ifndef WOLF_ORACLE_COMPAT_H
#define WOLF_ORACLE_COMPAT_H

#include <stdint.h>
#include <stddef.h>
#include <errno.h>
#include <sys/stat.h>

#ifndef far
#define far
#endif
#ifndef near
#define near
#endif
#ifndef huge
#define huge
#endif
#ifndef _seg
#define _seg
#endif
#ifndef _far
#define _far
#endif
#ifndef _near
#define _near
#endif
#ifndef _huge
#define _huge
#endif
#ifndef interrupt
#define interrupt
#endif
#ifndef pascal
#define pascal
#endif
#ifndef cdecl
#define cdecl
#endif
#ifndef __cdecl
#define __cdecl
#endif
#ifndef __far
#define __far
#endif
#ifndef __near
#define __near
#endif
#ifndef __interrupt
#define __interrupt
#endif

#ifndef O_BINARY
#define O_BINARY 0
#endif
#ifndef O_TEXT
#define O_TEXT 0
#endif
#ifndef S_IREAD
#define S_IREAD S_IRUSR
#endif
#ifndef S_IWRITE
#define S_IWRITE S_IWUSR
#endif
#ifndef S_IFREG
#define S_IFREG 0100000
#endif
#ifndef MK_FP
#define MK_FP(seg, ofs) ((void *)((uintptr_t)(ofs)))
#endif
#ifndef FP_SEG
#define FP_SEG(p) (0)
#endif
#ifndef FP_OFF
#define FP_OFF(p) ((unsigned)((uintptr_t)(p) & 0xffffu))
#endif

#ifndef EINVFMT
#define EINVFMT EINVAL
#endif

#ifndef WOLF_SET_LOW_WORD
#define WOLF_SET_LOW_WORD(var, val)                                     \
  do {                                                                  \
    uintptr_t __wolf_ptr_tmp = (uintptr_t)(var);                        \
    __wolf_ptr_tmp = (__wolf_ptr_tmp & ~((uintptr_t)0xffffu)) |         \
                     ((uintptr_t)((uint16_t)(val)));                    \
    (var) = (__typeof__(var))__wolf_ptr_tmp;                            \
  } while (0)
#endif

#ifndef WOLF_WRITE_U16_INC
#define WOLF_WRITE_U16_INC(ptr, val)                                    \
  do {                                                                  \
    *((uint16_t *)(void *)(ptr)) = (uint16_t)(val);                     \
    (ptr) += sizeof(uint16_t);                                          \
  } while (0)
#endif

#ifndef WOLF_READ_U16_INC
#define WOLF_READ_U16_INC(ptr)                                           \
  ({                                                                     \
    uint16_t __wolf_read_u16 = *((uint16_t *)(void *)(ptr));            \
    (ptr) += sizeof(uint16_t);                                           \
    __wolf_read_u16;                                                     \
  })
#endif

#ifndef WOLF_READ_U8_INC
#define WOLF_READ_U8_INC(ptr)                                             \
  ({                                                                      \
    uint8_t __wolf_read_u8 = *((uint8_t *)(void *)(ptr));                \
    (ptr) = (__typeof__(ptr))((uint8_t *)(void *)(ptr) + sizeof(uint8_t));\
    __wolf_read_u8;                                                      \
  })
#endif

#ifndef WOLF_COMPAT_REG_SHIMS
#define WOLF_COMPAT_REG_SHIMS
static int _AX, _BX, _CX, _DX, _SI, _DI;
static int _AH, _AL, _BH, _BL, _CH, _CL, _DH, _DL;
#endif

#ifndef _argc
#define _argc 0
#endif
#ifndef _argv
#define _argv ((char **)0)
#endif

#endif
