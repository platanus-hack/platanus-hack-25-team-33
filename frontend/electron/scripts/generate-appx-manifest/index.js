import dotenv from "dotenv" // Import dotenv to handle environment variables
import { readFile, writeFile } from "fs/promises" // Use fs/promises for asynchronous file operations
import { Builder, parseStringPromise } from "xml2js" // ES module format for xml2js
import packageJson from "../../package.json" assert { type: "json" } // Import version from package.json

dotenv.config({ path: "../../.env" }) // Load environment variables from .env file

const appxManifestPath = "../../appxmanifest-template.xml" // Path to appxmanifest.xml
const appxManifestOutPath = "../../appxmanifest.xml"
const builder = new Builder()

try {
  // Get version from package.json
  const version = packageJson.version

  // Get publisher display name from environment variable
  const publisher = process.env.WINDOWS_PUBLISHER
  const publisherDisplayName = process.env.WINDOWS_PUBLISHER_DISPLAY_NAME
  const packageIdentityName = process.env.WINDOWS_PACKAGE_IDENTITY_NAME
  const packageDisplayName = process.env.WINDOWS_PACKAGE_DISPLAY_NAME
  const packageDescription = process.env.WINDOWS_PACKAGE_DESCRIPTION

  // Read the appxmanifest.xml file asynchronously
  const data = await readFile(appxManifestPath, "utf8")

  // Parse the XML data
  const result = await parseStringPromise(data)

  // Update Identity.Version and PublisherDisplayName
  if (result.Package && result.Package.Identity) {
    result.Package.Identity[0].$.Version = `${version}.0` // e.g., "0.2.0.0"
    result.Package.Identity[0].$.Name = packageIdentityName
    result.Package.Identity[0].$.Publisher = publisher
  }

  if (result.Package && result.Package.Properties) {
    if (result.Package.Properties[0].PublisherDisplayName) {
      result.Package.Properties[0].PublisherDisplayName[0] =
        publisherDisplayName
    }
    if (result.Package.Properties[0].DisplayName) {
      result.Package.Properties[0].DisplayName[0] = packageDisplayName
    }
    if (result.Package.Properties[0].Description) {
      result.Package.Properties[0].Description[0] = packageDescription
    }
  }

  // Convert the updated XML object back to a string
  const updatedXml = builder.buildObject(result)

  // Write the updated XML to appxmanifest.xml
  await writeFile(appxManifestOutPath, updatedXml, "utf8")

  console.log(
    "Successfully updated appxmanifest.xml with version",
    version,
    "and PublisherDisplayName",
    publisherDisplayName,
  )
} catch (err) {
  console.error("Error updating appxmanifest.xml:", err)
}
