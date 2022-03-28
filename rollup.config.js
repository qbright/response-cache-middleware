import typescript from '@rollup/plugin-typescript';

export default {
  input: 'lib/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
  },
  external: ['path-to-regexp'], // <-- suppresses the warning
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
    }),
  ],
};
