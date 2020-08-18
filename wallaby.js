module.exports = () => ({
  // debug: true,

  // trace: true,

  files: [
    'package.json',
    'tsconfig.json',
    'src/**/*.ts',
    '!src/main.ts',
    '!src/app/app.module.ts',
    '!src/**/*.spec.ts',
  ],

  tests: ['src/**/*.spec.ts'],

  env: {
    type: 'node',
  },

  testFramework: 'jest',

  setup(wallaby) {
    const jestConfig = require('./package.json').jest;
    wallaby.testFramework.configure(jestConfig);
  },

  preprocessors: {
    '**/*.js?(x)': (file) =>
      require('@babel/core').transform(file.content, {
        sourceMap: true,
        filename: file.path,
        presets: [require('babel-preset-jest')],
      }),
  },
});
