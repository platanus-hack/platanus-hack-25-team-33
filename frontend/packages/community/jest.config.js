export default {
  transform: { "\\.[jt]s?$": ["ts-jest", { tsconfig: { allowJs: true } }] },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.[jt]s$": "$1",
  },
}
