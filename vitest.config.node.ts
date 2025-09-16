/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'node',
    globals: true,
    environment: 'node', // 🔹 Entorno Node para API routes
    globalSetup: ['./tests/setup/globalSetup.ts'], // 🔹 Setup global de variables
    setupFiles: ['./tests/setup/testDatabase.ts'], // 🔹 Setup BDD mockeada
    include: [
      'tests/api/**/*.test.ts',
      'tests/node/**/*.test.ts',
      'lib/**/*.test.ts',
      'models/**/*.test.ts'
    ], // 🔹 Solo tests backend
    exclude: [
      'tests/components/**',
      'tests/hooks/**',
      'tests/pages/**'
    ], // 🔹 Excluir tests frontend
    testTimeout: 10000, // 🔹 Mayor timeout para BDD
  },
});