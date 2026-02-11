export function audioReducePacked(
  soundMode: number,
  musicMode: number,
  digiMode: number,
  eventKind: number,
  soundId: number,
): number {
  let playing = -1;

  switch (eventKind | 0) {
    case 0:
      soundMode = soundId & 0x3;
      break;
    case 1:
      musicMode = soundId & 0x3;
      break;
    case 2:
      if ((soundMode | 0) !== 0 || (digiMode | 0) !== 0) {
        playing = soundId & 0xff;
      }
      break;
    case 3:
      playing = -1;
      break;
    default:
      break;
  }

  return (((soundMode & 0x3) << 18) | ((musicMode & 0x3) << 16) | ((digiMode & 0x3) << 14) | ((playing + 1) & 0x3fff)) | 0;
}
