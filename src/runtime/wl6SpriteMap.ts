// Maps plane1 actor kind values to base VSWAP sprite ids (relative to first sprite chunk).
export function spriteIdForActorKind(kind: number): number {
  const k = kind | 0;

  // Guard
  if ((k >= 108 && k < 116) || (k >= 144 && k < 152) || (k >= 180 && k < 188)) return 50;
  // Officer
  if ((k >= 116 && k < 124) || (k >= 152 && k < 160) || (k >= 188 && k < 196)) return 238;
  // SS
  if ((k >= 126 && k < 134) || (k >= 162 && k < 170) || (k >= 198 && k < 206)) return 138;
  // Dog
  if ((k >= 134 && k < 142) || (k >= 170 && k < 178) || (k >= 206 && k < 214)) return 99;
  // Mutant
  if ((k >= 216 && k < 224) || (k >= 234 && k < 242) || (k >= 252 && k < 260)) return 187;

  // Boss and special entities.
  switch (k) {
    case 160: return 321; // Fake Hitler
    case 178: return 349; // Hitler
    case 179: return 400; // General Fettgesicht
    case 196: return 312; // Schabbs
    case 197: return 389; // Gretel
    case 214: return 300; // Hans
    case 215: return 364; // Otto
    case 224: return 288; // Ghost red
    case 225: return 290; // Ghost pink
    case 226: return 292; // Ghost orange
    case 227: return 294; // Ghost blue
    default:
      return 50;
  }
}
