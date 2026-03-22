import next from 'eslint-config-next';

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  {
    ignores: ['public/**', '*.config.js', 'prisma/**/*.cjs', 'eslint.config.mjs'],
  },
  ...next,
  {
    rules: {
      // React 19 / eslint-plugin-react-hooks@7 is very strict; common fetch-on-mount patterns are fine here.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];

export default eslintConfig;
