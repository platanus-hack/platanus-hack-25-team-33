export type FirebaseCredential =
  | {
      providerId: "google.com"
      idToken: string
      accessToken: string
    }
  | {
      providerId: "github.com"
      accessToken: string
    }
  | {
      providerId: "apple.com"
      idToken: string
      accessToken: string
    }
