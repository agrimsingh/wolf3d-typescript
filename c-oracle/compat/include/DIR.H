#ifndef WOLF_COMPAT_DIR_H
#define WOLF_COMPAT_DIR_H
#include <stdint.h>
#include_next <dirent.h>

#ifndef FA_RDONLY
#define FA_RDONLY 0x01
#endif
#ifndef FA_HIDDEN
#define FA_HIDDEN 0x02
#endif
#ifndef FA_SYSTEM
#define FA_SYSTEM 0x04
#endif
#ifndef FA_LABEL
#define FA_LABEL 0x08
#endif
#ifndef FA_DIREC
#define FA_DIREC 0x10
#endif
#ifndef FA_ARCH
#define FA_ARCH 0x20
#endif

struct ffblk {
  char ff_reserved[21];
  char ff_attrib;
  uint16_t ff_ftime;
  uint16_t ff_fdate;
  uint32_t ff_fsize;
  char ff_name[260];
};

static inline int findfirst(const char *pattern, struct ffblk *blk, int attrib) {
  (void)pattern;
  (void)blk;
  (void)attrib;
  return -1;
}

static inline int findnext(struct ffblk *blk) {
  (void)blk;
  return -1;
}
#endif
