/** @type {import('@commitlint').Config} */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [2, 'always', ['sentence-case', 'start-case']],
  },
}

export default config
