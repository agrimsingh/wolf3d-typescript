export function menuReducePacked(screen: number, cursor: number, action: number, itemCount: number): number {
  let s = screen | 0;
  let c = cursor | 0;
  const count = Math.max(1, itemCount | 0);

  switch (action | 0) {
    case 0:
      c = (c + count - 1) % count;
      break;
    case 1:
      c = (c + 1) % count;
      break;
    case 2:
      s = c + 1;
      c = 0;
      break;
    case 3:
      s = 0;
      c = 0;
      break;
    default:
      break;
  }

  return (((s & 0xff) << 8) | (c & 0xff)) | 0;
}

export function measureTextPacked(textLen: number, maxWidthChars: number): number {
  if ((maxWidthChars | 0) <= 0) {
    return 0;
  }
  const width = Math.min(textLen | 0, maxWidthChars | 0);
  let lines = Math.floor((textLen | 0) / (maxWidthChars | 0));
  if ((textLen | 0) % (maxWidthChars | 0) !== 0) {
    lines++;
  }
  if (lines === 0) {
    lines = 1;
  }

  return (((lines & 0xffff) << 16) | (width & 0xffff)) | 0;
}
