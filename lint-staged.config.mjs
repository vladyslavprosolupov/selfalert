export default {
  '*.{js,cjs,mjs,ts,cts,mts}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,yml,yaml}': 'prettier --write',
  '.{nvmrc,prettierrc}': 'prettier --write --ignore-unknown',
}
