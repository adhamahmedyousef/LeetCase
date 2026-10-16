const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../extension/settings.js'), 'utf8');
function environment(saved = {}) {
  const listeners = new Set();
  const chrome = { storage: {
    onChanged: { addListener: listener => listeners.add(listener) },
    local: {
      get: async key => ({ [key]: saved[key] }),
      async set(values) {
        for (const [key, newValue] of Object.entries(values)) {
          const oldValue = saved[key]; saved[key] = newValue;
          for (const listener of listeners) listener({ [key]: { oldValue, newValue } }, 'local');
        }
      },
    },
  } };
  const open = () => {
    const context = vm.createContext({ chrome, LeetCase: {} });
    vm.runInContext(source, context);
    return context.LeetCase.settings;
  };
  return { open, chrome, saved };
}
test('Color Mode defaults off and persists across fresh extension contexts', async () => {
  const env = environment();
  const first = env.open(); await first.ready;
  assert.equal(first.colorMode, false);
  await first.setColorMode(true);
  const reopened = env.open(); await reopened.ready;
  assert.equal(reopened.colorMode, true);
  await reopened.setColorMode(false);
  assert.equal(first.colorMode, false);
  assert.equal(env.saved.leetcaseColorMode, false);
});
test('changes reach open tabs once, and a failed save retains previous state', async () => {
  const env = environment({ leetcaseColorMode: true });
  const first = env.open(), second = env.open();
  await Promise.all([first.ready, second.ready]);
  const received = [];
  second.subscribe(enabled => received.push(enabled));
  await first.setColorMode(false);
  assert.deepEqual(received, [false]);
  env.chrome.storage.local.set = async () => { throw new Error('Storage failed'); };
  await assert.rejects(first.setColorMode(true));
  assert.equal(first.colorMode, false);
});
test('a change during initial loading wins over the older storage snapshot', async () => {
  const env = environment();
  let resolve;
  env.chrome.storage.local.get = () => new Promise(done => { resolve = done; });
  const settings = env.open();
  await env.chrome.storage.local.set({ leetcaseColorMode: true });
  resolve({ leetcaseColorMode: false });
  await settings.ready;
  assert.equal(settings.colorMode, true);
});
