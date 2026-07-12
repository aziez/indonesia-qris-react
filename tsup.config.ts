import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/core/index.ts', 'src/react/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
});
