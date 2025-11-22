import { app } from "electron"

export const getArgument = () => {
  const argsArray = process.argv.slice(app.isPackaged ? 1 : 2)
  if (argsArray.length >= 2) {
    const filePath = process.argv[1]
    return filePath
  }
  return null
}
