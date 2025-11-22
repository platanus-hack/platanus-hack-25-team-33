import { Theme as BaseTheme } from "../theme/Theme.js"

declare module "@emotion/react" {
  export interface Theme extends BaseTheme {}
}
