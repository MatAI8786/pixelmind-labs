import nextJest from 'next/jest';

const createJestConfig = nextJest({ dir: './' });

const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setupTests.ts'],
  testMatch: ['<rootDir>/test/**/*.(test|spec).ts?(x)', '<rootDir>/src/**/*.test.ts?(x)'],
};

export default createJestConfig(config);
