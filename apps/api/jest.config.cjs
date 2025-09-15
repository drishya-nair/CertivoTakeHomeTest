/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  moduleFileExtensions: ['ts', 'js'],
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.(ts)$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'esnext',
          target: 'es2020',
          moduleResolution: 'node',
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
          isolatedModules: true,
        },
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
};


