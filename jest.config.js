module.exports = {
  projects: [
    {
      // Pure logic tests — no React Native environment.
      // We bypass jest-expo's preset entirely to avoid its react-native
      // test environment setup, which hangs on Linux CI for non-UI tests.
      displayName: 'logic',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/packages/**/*.test.ts',
        '<rootDir>/packages/**/__tests__/**/*.ts',
        '<rootDir>/stores/**/*.test.ts',
        '<rootDir>/stores/**/__tests__/**/*.ts',
      ],
      transform: {
        '^.+\\.tsx?$': [
          'babel-jest',
          {
            presets: ['@babel/preset-typescript', '@babel/preset-react'],
            plugins: ['@babel/plugin-transform-modules-commonjs'],
          },
        ],
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
      moduleNameMapper: {
        '^zustand/middleware$': '<rootDir>/__mocks__/zustand-middleware.js',
        '^@react-native-async-storage/async-storage$':
          '@react-native-async-storage/async-storage/jest/async-storage-mock',
      },
    },
  ],
  testTimeout: 15000,
  collectCoverageFrom: [
    'packages/**/*.ts',
    'stores/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    'packages/engine/**': { lines: 80, functions: 80 },
    global: { lines: 60 },
  },
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
};
