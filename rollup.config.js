import typescript from '@rollup/plugin-typescript';

export default {
  input: 'lib/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'umd',
    name: 'ResponseCacheMiddleware',
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
    }),
  ],
};
