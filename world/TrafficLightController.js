/**
 * Đèn giao thông 2 phase: xanh → vàng (~2s) → đổi phase. Xe gặp đèn vàng dừng tại vạch; đã lố vạch thì đi tiếp.
 * Phase 0: Ngang (0,1) xanh rồi vàng, Dọc (2,3) đỏ.
 * Phase 1: Ngang đỏ, Dọc (2,3) xanh rồi vàng.
 */

const GREEN_DURATION_MS = 15000
const YELLOW_DURATION_MS = 2000

let phase = 0
let phaseStartTime = null
/** 'green' | 'yellow' — đang xanh hay đang vàng cho hướng được ưu tiên */
let subPhase = 'green'

/**
 * Gọi mỗi frame.
 * @param {number} now - performance.now()
 */
export function updateTrafficLight(now) {
  if (phaseStartTime == null) phaseStartTime = now
  const elapsed = now - phaseStartTime
  if (subPhase === 'green') {
    if (elapsed >= GREEN_DURATION_MS) {
      subPhase = 'yellow'
      phaseStartTime = now
    }
  } else {
    if (elapsed >= YELLOW_DURATION_MS) {
      phase = 1 - phase
      subPhase = 'green'
      phaseStartTime = now
    }
  }
}

/**
 * @param {number} laneId 0..3
 * @returns {boolean} true nếu đèn đỏ
 */
export function isRedForLane(laneId) {
  if (laneId === 0 || laneId === 1) return phase === 1
  return phase === 0
}

/** true nếu làn đang đèn vàng (hướng vừa hết xanh) */
export function isYellowForLane(laneId) {
  if (subPhase !== 'yellow') return false
  return (laneId <= 1 && phase === 0) || (laneId >= 2 && phase === 1)
}

/** true nếu làn phải dừng tại vạch (đỏ hoặc vàng; đã qua vạch thì đi tiếp — xử lý trong VehicleLayer) */
export function mustStopForLane(laneId) {
  return isRedForLane(laneId) || isYellowForLane(laneId)
}

/** Phase: 0 = ngang xanh, 1 = dọc xanh */
export function getPhase() {
  return phase
}

export function getPhaseStartTime() {
  return phaseStartTime
}

export function getSubPhase() {
  return subPhase
}
