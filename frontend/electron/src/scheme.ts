export const appScheme =
  process.mas === true || process.windowsStore === true
    ? "jp.codingcafe.signal"
    : "jp.codingcafe.signal.dev"

export const authCallbackUrl = `${appScheme}://auth-callback`
