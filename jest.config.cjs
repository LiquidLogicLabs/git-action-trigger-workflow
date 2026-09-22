/** @type {import('jest').Config} */
module.exports = {
  // Coverage ratchet: the measured values when this was introduced, floored to the
  // integer below so the gate catches a real regression without failing on
  // sub-percent variation. A floor to raise, never to lower -- if a change
  // legitimately reduces coverage, say so in the commit rather than editing this
  // quietly.
  coverageThreshold: {
    global: {
      statements: 58,
      branches: 38,
      functions: 61,
      lines: 60
    }
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/e2e/**/*.test.ts'],
  clearMocks: true,
};


