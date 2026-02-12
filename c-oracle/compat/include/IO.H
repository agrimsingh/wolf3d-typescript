#ifndef WOLF_COMPAT_IO_H
#define WOLF_COMPAT_IO_H
#include_next <unistd.h>
#include_next <fcntl.h>

static inline long filelength(int fd) {
  off_t current = lseek(fd, 0, SEEK_CUR);
  if (current == (off_t)-1) {
    return -1;
  }
  off_t end = lseek(fd, 0, SEEK_END);
  if (end == (off_t)-1) {
    return -1;
  }
  (void)lseek(fd, current, SEEK_SET);
  return (long)end;
}

#endif
