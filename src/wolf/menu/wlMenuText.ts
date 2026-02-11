function fnv1a(hash: number, value: number): number {
  return Math.imul((hash ^ (value >>> 0)) >>> 0, 16777619) >>> 0;
}

function clampI32(v: number, minv: number, maxv: number): number {
  return Math.max(minv, Math.min(maxv, v | 0)) | 0;
}

export function idUs1UsPrintHash(cursorX: number, cursorY: number, textLen: number, color: number, fontWidth: number): number {
  const width = textLen < 0 ? 0 : (textLen * (fontWidth <= 0 ? 8 : fontWidth));
  const nx = (cursorX + width) | 0;
  const ny = cursorY | 0;
  let h = 2166136261 >>> 0;
  h = fnv1a(h, nx);
  h = fnv1a(h, ny);
  h = fnv1a(h, color);
  return h >>> 0;
}

export function idUs1UsCPrintHash(windowX: number, windowW: number, textLen: number, align: number, fontWidth: number): number {
  const fw = fontWidth <= 0 ? 8 : (fontWidth | 0);
  const textW = (textLen < 0 ? 0 : (textLen | 0)) * fw;
  let cx = windowX | 0;
  if ((align & 1) === 0) {
    const centeredOffset = ((windowW - textW) / 2) | 0;
    cx = (windowX + centeredOffset) | 0;
  } else {
    cx = (windowX + (windowW - textW - 4)) | 0;
  }
  let h = 2166136261 >>> 0;
  h = fnv1a(h, cx);
  h = fnv1a(h, textW);
  h = fnv1a(h, align);
  return h >>> 0;
}

export function idUs1UsDrawWindowHash(x: number, y: number, w: number, h: number, frameColor: number, fillColor: number): number {
  const area = w < 0 || h < 0 ? 0 : ((w * h) | 0);
  let hash = 2166136261 >>> 0;
  hash = fnv1a(hash, x);
  hash = fnv1a(hash, y);
  hash = fnv1a(hash, area);
  hash = fnv1a(hash, frameColor);
  hash = fnv1a(hash, fillColor);
  return hash >>> 0;
}

export function wlMenuUsControlPanelHash(screen: number, cursor: number, inputMask: number, menuItems: number): number {
  let c = cursor | 0;
  if (inputMask & 1) c -= 1;
  if (inputMask & 2) c += 1;

  if (menuItems > 0) {
    while (c < 0) c += menuItems;
    c %= menuItems;
  } else {
    c = 0;
  }

  let s = screen | 0;
  if (inputMask & 4) {
    s = (c + 1) | 0;
  }
  if (inputMask & 8) {
    s = 0;
    c = 0;
  }

  let h = 2166136261 >>> 0;
  h = fnv1a(h, s);
  h = fnv1a(h, c);
  h = fnv1a(h, menuItems);
  return h >>> 0;
}

export function wlMenuDrawMainMenuHash(selected: number, enabledMask: number, episode: number): number {
  const sel = selected & 7;
  const enabled = (enabledMask >> sel) & 1;
  let h = 2166136261 >>> 0;
  h = fnv1a(h, sel);
  h = fnv1a(h, enabled);
  h = fnv1a(h, episode);
  return h >>> 0;
}

export function wlMenuDrawMenuHash(menuId: number, cursor: number, itemCount: number, disabledMask: number, scroll: number): number {
  const count = itemCount <= 0 ? 1 : (itemCount | 0);
  let cur = cursor | 0;
  while (cur < 0) cur += count;
  cur %= count;

  let tries = 0;
  while (((disabledMask >> cur) & 1) !== 0 && tries < count) {
    cur = (cur + 1) % count;
    tries += 1;
  }

  let h = 2166136261 >>> 0;
  h = fnv1a(h, menuId);
  h = fnv1a(h, cur);
  h = fnv1a(h, scroll);
  return h >>> 0;
}

export function wlMenuCpNewGameHash(difficulty: number, episode: number, startLevel: number, weapon: number): number {
  const level = (startLevel + ((episode & 3) * 10)) | 0;
  const hp = clampI32((100 - difficulty * 10) | 0, 10, 100);
  let h = 2166136261 >>> 0;
  h = fnv1a(h, level);
  h = fnv1a(h, hp);
  h = fnv1a(h, weapon);
  return h >>> 0;
}

export function wlMenuCpViewScoresHash(top0: number, top1: number, top2: number, top3: number, top4: number, newScore: number): number {
  const board = [top0 | 0, top1 | 0, top2 | 0, top3 | 0, top4 | 0];
  let pos = 5;
  for (let i = 0; i < 5; i++) {
    if ((newScore | 0) > board[i]!) {
      pos = i;
      break;
    }
  }
  if (pos < 5) {
    for (let j = 4; j > pos; j--) {
      board[j] = board[j - 1]!;
    }
    board[pos] = newScore | 0;
  }

  let h = 2166136261 >>> 0;
  for (let i = 0; i < 5; i++) {
    h = fnv1a(h, board[i]!);
  }
  h = fnv1a(h, pos);
  return h >>> 0;
}

export function wlMenuCpSoundHash(soundMode: number, musicMode: number, digiMode: number, action: number): number {
  let sm = soundMode | 0;
  let mm = musicMode | 0;
  let dm = digiMode | 0;
  switch (action & 3) {
    case 0:
      sm = (sm + 1) & 3;
      break;
    case 1:
      mm = (mm + 1) & 3;
      break;
    case 2:
      dm = (dm + 1) & 3;
      break;
    default:
      sm = 0;
      mm = 0;
      dm = 0;
      break;
  }
  let h = 2166136261 >>> 0;
  h = fnv1a(h, sm);
  h = fnv1a(h, mm);
  h = fnv1a(h, dm);
  return h >>> 0;
}

export function wlMenuCpControlHash(mouseEnabled: number, joystickEnabled: number, sensitivity: number, action: number): number {
  let m = mouseEnabled ? 1 : 0;
  let j = joystickEnabled ? 1 : 0;
  let s = sensitivity | 0;
  switch (action & 3) {
    case 0:
      m ^= 1;
      break;
    case 1:
      j ^= 1;
      break;
    case 2:
      s = clampI32(s + 1, 0, 20);
      break;
    default:
      s = clampI32(s - 1, 0, 20);
      break;
  }
  let h = 2166136261 >>> 0;
  h = fnv1a(h, m);
  h = fnv1a(h, j);
  h = fnv1a(h, s);
  return h >>> 0;
}

export function wlMenuMessageHash(messageLen: number, waitForAck: number, inputMask: number, rng: number): number {
  const shown = messageLen < 0 ? 0 : (messageLen | 0);
  const closed = waitForAck ? ((inputMask & 1) ? 1 : 0) : 1;
  let h = 2166136261 >>> 0;
  h = fnv1a(h, shown);
  h = fnv1a(h, closed);
  h = fnv1a(h, rng & 0xff);
  return h >>> 0;
}

export function wlTextHelpScreensHash(page: number, totalPages: number, inputMask: number, rng: number): number {
  const total = totalPages <= 0 ? 1 : (totalPages | 0);
  let p = page | 0;
  if (inputMask & 1) p -= 1;
  if (inputMask & 2) p += 1;
  while (p < 0) p += total;
  p %= total;

  let h = 2166136261 >>> 0;
  h = fnv1a(h, p);
  h = fnv1a(h, total);
  h = fnv1a(h, rng & 0xffff);
  return h >>> 0;
}

export function wlTextEndTextHash(textLen: number, scrollPos: number, speed: number, inputMask: number): number {
  const maxScroll = textLen < 0 ? 0 : ((textLen * 8) | 0);
  let pos = (scrollPos + (speed <= 0 ? 1 : speed)) | 0;
  if (inputMask & 1) {
    pos = (pos + 32) | 0;
  }
  pos = clampI32(pos, 0, maxScroll);

  let h = 2166136261 >>> 0;
  h = fnv1a(h, pos);
  h = fnv1a(h, maxScroll);
  h = fnv1a(h, inputMask & 0xff);
  return h >>> 0;
}
