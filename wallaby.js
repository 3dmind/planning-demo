/*
  eslint @typescript-eslint/no-var-requires: 0
 */
module.exports = () => {
  return {
    files: [
      '!src/**/*.module.ts',
      '!src/**/*.spec.ts',
      '!src/main.ts',
      '!src/app/**',
      '!src/prisma/**',
      '!src/modules/**/repositories/**/prisma*.repository.ts',
      '!src/modules/**/repositories/**/*repository.provider.ts',
      '!src/**/*.controller.ts',
      'package.json',
      'tsconfig.json',
      'src/**/*.ts',
      'test/builder/**/*.ts',
    ],

    tests: ['!src/**/*.controller.spec.ts', 'src/**/*.spec.ts'],

    runMode: 'onsave',

    env: {
      type: 'node',
    },

    testFramework: 'jest',

    setup: function(wallaby) {
      const jestConfig = require('./package.json').jest;
      wallaby.testFramework.configure(jestConfig);
    },

    preprocessors: {
      '**/*.js': (file) =>
        require('@babel/core').transform(file.content, {
          sourceMap: true,
          filename: file.path,
          presets: [require('babel-preset-jest')],
        }),
    },

    debug: true,
    // trace: true,
  };
};
