/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'react',
    globals: true,
    environment: 'jsdom', // 🔹 Entorno jsdom para React
    setupFiles: ['./setupTests.ts'], // 🔹 Setup original con jest-dom
    include: [
      'tests/components/**/*.test.tsx',
      'tests/hooks/**/*.test.ts',
      'tests/pages/**/*.test.tsx',
      'components/**/*.test.tsx',
      'hooks/**/*.test.ts'
    ], // 🔹 Solo tests frontend
    exclude: [
      'tests/api/**',
      'tests/node/**',
      'lib/**/*.test.ts',
      'models/**/*.test.ts'
    ], // 🔹 Excluir tests backend
    testTimeout: 5000, // 🔹 Timeout menor para UI
  },
});