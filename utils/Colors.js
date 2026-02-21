export const COLORS = {
  // Ground
  road: { day: 0x4a4a5e, night: 0x1a1a2e },
  sidewalk: { day: 0xc8b89a, night: 0x5d5060 },
  grass: { day: 0x6bcb77, night: 0x1e3a1e },
  roadMarkings: { day: 0xffffff, night: 0x888888 },

  // Buildings — North (Office)
  officeLeft: { day: 0x1565c0, night: 0x0d2b4e },
  officeRight: { day: 0x1976d2, night: 0x1237a0 },
  officeTop: { day: 0x42a5f5, night: 0x1a52a8 },
  officeWindow: { day: 0xb3e5fc, night: 0xffe566 },

  // Buildings — East (Restaurant)
  restLeft: { day: 0xd84315, night: 0x5c1a07 },
  restRight: { day: 0xe64a19, night: 0x7a200a },
  restTop: { day: 0xbf360c, night: 0x4a1205 },
  restNeon: { night: 0xff80ab },

  // Buildings — West (Park)
  parkGrass: { day: 0x66bb6a, night: 0x1b3d1b },
  treeA: { day: 0x43a047, night: 0x1b2e1b },
  treeB: { day: 0x2e7d32, night: 0x112311 },
  treeSakura: { day: 0xf48fb1, night: 0x4a1b2e },
  fountain: { day: 0x29b6f6, night: 0x0047ab },

  // Buildings — South (Construction)
  concrete: { day: 0x9e9e9e, night: 0x424242 },
  scaffold: { day: 0xff8f00, night: 0xb35c00 },
  safetyFence: 0xffd600,

  // Traffic lights
  lightRed: 0xef5350,
  lightYellow: 0xfff176,
  lightGreen: 0x66bb6a,
  lightPost: 0x37474f,

  // Vehicles (day) — random pick
  vehicleColors: [
    0xef5350, 0x42a5f5, 0xffca28, 0x66bb6a, 0xab47bc,
    0xff7043, 0x26c6da, 0xec407a, 0x78909c, 0x8d6e63,
  ],
  vehicleWindow: { day: 0xb3e5fc, night: 0x1a237e },
  headlight: 0xfffde7,
  taillight: 0xff1744,

  // Weather
  rainDrop: 0xaeccdb,
  snowFlake: 0xffffff,
  overlayRain: { alpha: 0.3, color: 0x4a6572 },
  overlaySnow: { alpha: 0.15, color: 0xb0bec5 },
  overlayBlizzard: { alpha: 0.5, color: 0x2a3040 },
  overlayNight: { alpha: 0.4, color: 0x050d1a },

  // UI
  uiBg: 'rgba(10, 15, 30, 0.85)',
  uiBorder: '#2A4A7F',
  uiText: '#E0F0FF',
  uiAccent: '#4FC3F7',
  uiSuccess: '#66BB6A',
  uiDanger: '#EF5350',
}

/**
 * Get color for current time mode
 * @param {{ day: number, night: number }} colorPair
 * @param {'day' | 'night'} mode
 * @returns {number}
 */
export function getColor(colorPair, mode = 'day') {
  if (typeof colorPair === 'number') return colorPair
  return colorPair[mode] ?? colorPair.day
}
