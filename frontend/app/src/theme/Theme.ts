export interface Theme {
  isLightContent: boolean // if true, text color is light and background color is dark
  font: string
  monoFont: string
  canvasFont: string
  themeColor: string
  onSurfaceColor: string // content color on themeColor
  darkBackgroundColor: string
  backgroundColor: string
  secondaryBackgroundColor: string
  editorBackgroundColor: string // control pane / arrange view / tempo editor
  editorGridColor: string
  editorSecondaryGridColor: string
  dividerColor: string
  popupBorderColor: string
  textColor: string
  secondaryTextColor: string
  tertiaryTextColor: string
  pianoKeyBlack: string
  pianoKeyWhite: string
  pianoWhiteKeyLaneColor: string
  pianoBlackKeyLaneColor: string
  pianoHighlightedLaneColor: string
  pianoLaneEdgeColor: string
  ghostNoteColor: string
  recordColor: string
  shadowColor: string
  highlightColor: string
  greenColor: string
  redColor: string
  yellowColor: string
}

const darkTheme: Theme = {
  isLightContent: true,
  font: "Inter, -apple-system, BlinkMacSystemFont, Avenir, Lato",
  monoFont: "Roboto Mono, monospace",
  canvasFont: "Arial",
  themeColor: "hsl(230, 70%, 55%)",
  onSurfaceColor: "#ffffff",
  textColor: "#ffffff",
  secondaryTextColor: "hsl(223, 12%, 60%)",
  tertiaryTextColor: "#5a6173",
  dividerColor: "hsl(224, 12%, 24%)",
  popupBorderColor: "hsl(228, 10%, 13%)",
  darkBackgroundColor: "hsl(228, 10%, 13%)",
  backgroundColor: "hsl(228, 10%, 16%)",
  secondaryBackgroundColor: "hsl(227, 10%, 22%)",
  editorBackgroundColor: "hsl(228, 10%, 13%)",
  editorSecondaryGridColor: "hsl(224, 12%, 19%)",
  editorGridColor: "hsl(224, 12%, 26%)",
  pianoKeyBlack: "#272a36",
  pianoKeyWhite: "#fbfcff",
  pianoWhiteKeyLaneColor: "hsl(228, 10%, 16%)",
  pianoBlackKeyLaneColor: "hsl(228, 10%, 13%)",
  pianoHighlightedLaneColor: "hsl(230, 23%, 20%)",
  pianoLaneEdgeColor: "hsl(228, 10%, 18%)",
  ghostNoteColor: "#444444",
  recordColor: "#dd3c3c",
  shadowColor: "rgba(0, 0, 0, 0.1)",
  highlightColor: "#8388a51a",
  greenColor: "#31DE53",
  redColor: "#DE5267",
  yellowColor: "#DEB126",
}

const lightTheme: Theme = {
  isLightContent: false,
  font: "Inter, -apple-system, BlinkMacSystemFont, Avenir, Lato",
  monoFont: "Roboto Mono, monospace",
  canvasFont: "Arial",
  themeColor: "hsl(230, 70%, 55%)",
  onSurfaceColor: "#ffffff",
  textColor: "#000000",
  secondaryTextColor: "hsl(223, 12%, 40%)",
  tertiaryTextColor: "#7a7f8b",
  dividerColor: "hsl(223, 12%, 80%)",
  popupBorderColor: "#e0e0e0",
  darkBackgroundColor: "hsl(228, 20%, 95%)",
  backgroundColor: "#ffffff",
  secondaryBackgroundColor: "hsl(227, 20%, 95%)",
  editorBackgroundColor: "#ffffff",
  editorGridColor: "hsl(223, 12%, 86%)",
  editorSecondaryGridColor: "hsl(223, 12%, 92%)",
  pianoKeyBlack: "#272a36",
  pianoKeyWhite: "#fbfcff",
  pianoWhiteKeyLaneColor: "#ffffff",
  pianoBlackKeyLaneColor: "hsl(228, 10%, 96%)",
  pianoHighlightedLaneColor: "hsl(228, 70%, 97%)",
  pianoLaneEdgeColor: "hsl(228, 10%, 92%)",
  ghostNoteColor: "hsl(223, 12%, 80%)",
  recordColor: "#ee6a6a",
  shadowColor: "rgba(0, 0, 0, 0.1)",
  highlightColor: "#f5f5fa",
  greenColor: "#56DE83",
  redColor: "#DE8287",
  yellowColor: "#DEBE56",
}

export const themes = {
  dark: darkTheme,
  light: lightTheme,
} as const

export const themeNames = Object.keys(themes) as (keyof typeof themes)[]
export type ThemeType = (typeof themeNames)[number]
