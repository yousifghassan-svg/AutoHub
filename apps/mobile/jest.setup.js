jest.mock('@react-native-async-storage/async-storage', () => {
  let store = new Map();
  return {
    setItem: jest.fn(async (k, v) => {
      store.set(k, v);
    }),
    getItem: jest.fn(async (k) => store.get(k) ?? null),
    removeItem: jest.fn(async (k) => {
      store.delete(k);
    }),
    clear: jest.fn(async () => {
      store = new Map();
    }),
  };
});
