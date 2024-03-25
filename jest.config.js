// jest.config.js
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['src/**/*.ts'],
    reporters: [
      'default',
      ['jest-junit', { outputDirectory: 'test-results/junit' }],
    ],
  };
  