#ifndef WOLF_COMPAT_MEM_H
#define WOLF_COMPAT_MEM_H
#include_next <string.h>

#ifndef _fmemcpy
#define _fmemcpy memcpy
#endif
#ifndef _fmemset
#define _fmemset memset
#endif

#endif
