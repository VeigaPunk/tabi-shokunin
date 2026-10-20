// Playwright Test configuration for the round-13 accessible-selector loopback
// demonstration. It is intentionally confined to this evidence directory:
// the only test file is aria-loopback.spec.mjs, output goes to ./artifacts,
// snapshots are never updated or generated, and fail artifacts are line-only.
export default {
  testDir: '.',
  testMatch: /aria-loopback\.spec\.mjs$/,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30000,
  expect: {
    timeout: 2500,
  },
  reporter: [['line']],
  outputDir: './artifacts',
  updateSnapshots: 'none',
  ignoreSnapshots: false,
  use: {
    headless: true,
    actionTimeout: 3000,
    navigationTimeout: 5000,
    trace: 'off',
    video: 'off',
    screenshot: 'off',
    serviceWorkers: 'block',
  },
};
