const actual = jest.requireActual('zustand/middleware');

module.exports = {
  ...actual,
  // Strip persistence in tests — no AsyncStorage calls, no async init.
  // Store logic is tested; persistence is Zustand's concern, not ours.
  persist: (config) => config,
  createJSONStorage: () => ({
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  }),
};
