import { JWT } from "google-auth-library"
import { google } from "googleapis"
import { serverOnly } from "./server-only"

// Mark this module as server-only
console.log(serverOnly)

// This is the JSON file that was uploaded to the sources
const serviceAccountJson = {
  type: "service_account",
  project_id: "calorie-tracking-453317",
  private_key_id: "7ff11448ad0bcaabea5683966269aa27717e8174",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD2Qm2v9Igb3XB6\n9a8UpI+4SfEO/XUCA3gqaSg7Gjds0+PrKqunVBd3xEJ+ljr5M9Kz/bv7bJ3Jov2W\nB2CJW4cVDT0THC9IHWWXf8KwGadteSIRZFKwpkQnJFDVaoiXmXTFQKy9NEhI25ut\nuH4sN/pJfKgz52Wqg0W4jKwNxJN1DTxlKbZlPAsH0vm8L8gIm6+e/rIaMbeA+9cn\nOFlekdnSzpJ5N83A+q20CemgFBGhGZTm2mAn2yd1t+I4bsgej92t2Gg6+dr4tsD5\nvnBkbQSnrmsl5hLY6CzAYgoYC8W8ZraK6B35qIcnZ8UUQG4KieYrGVwt1u3/34gN\nfw9ecGrxAgMBAAECggEAAY+96c+zAD5Ts939lt50l+/znUtTZjfDGr2lE+Ml0v1G\nKIXha/m8HLGBSKwVN6va9sILnJ0y2vt+NDguEK484ehNYU2hCB9UErbjTrpu6lYu\n2w8pcqN4Zpz+ll0uFOeHx/YU6rP59qW71oMHPtU5alvyH/+/opTbcFTKlx55HBTl\nuyfXsiFacy5b7YiMkWU5M+7zPC3DbiHmrLDt+kN1d1tjjDS/sa03f0o3UBE+J1VK\nIr67P+kuMHfCS5uhmA6HYIdvDr2y6uwrsMSj1FStgvKBhNGb4UkUNNeg2eo6EuJX\n0ZbUwwj6RIeXY0DaQKAaHyoXjasEn0ULQwyJKz6GZQKBgQD//IkYdCeGd9pqwZue\n3xv+xKGP+ulmY3V4dfkgfpRflbhzsJb4Akw8Dm4wQJrbP/oM5oFV2kjB80bmQcLk\nc4zmiqROb/5WE/v/zgCF7Yo8wHJS8f0sYrDTLQaBF/zHy/H1NbndccfRwcOWZhLM\nmY55mISVewEEwlNWwyWkIY/gTQKBgQD2RcLkJISutduF4pqrXuob/aPs0lSE5bOT\nqoQx7aIpmZLpaoHf53BUbM8QMup6eH6D9CrmQCKtmOKc6W9qUy/2UTFZO3qEAS50\ns+FlLwwQguBAqUJrIPjC2z/qDtyBgTmDQAaaJNd3ARCW+WviKwqkuXcUXUegNZ7B\nwKK5nghnNQKBgDxQ8rSyWcXTY8GX0OVESMJk7nSQeIJJmRpDIepIKQnEq2uHBmt1\njyTveYMhFdvnXTHA9mSWRGJ+wgvrHtLZby+7Jy/cL590ogIKNhFYgSQDbGyi3Daj\nImr/xvKQBl3FbkOK3zqQXrbL4xwC/Rb8b5ezGjpmezz11NEytiHQTqhZAoGAYd71\nhe9RX5FcTYfxydstlLQnOk2YUzxqMmwYnzL+OCQVM3glZxM2HAcl/x0M/GD4fn5B\nskGYxn60yIEoywuGSxCXWQv/M4i4qp52G90noUQx1OCvSZ3P3rh9XQpM7ZaqgZOn\nTAkKK/wbWLSFAFv0neQrA8fSWEQW9I8W3EeGtWUCgYEA5sMY/4Q0Yw7E0TpMj01I\nxeD03KPl/nTAiNXRC6kaPtPpYMNRsaGO3Gq/k1YsCoCNEX5hl1LBL+Bj3KL7H29m\n+rQ/VereF4Td1gqKG9XCIqfMqwurRQCIX02z0hXJwRrQBSpljERDM6PUvO/9XJGr\nAgNOOzBJ8K7M8ZQ/2VEOKeU=\n-----END PRIVATE KEY-----\n",
  client_email: "calorie-tracker@calorie-tracking-453317.iam.gserviceaccount.com",
  client_id: "116781456409003332512",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/calorie-tracker%40calorie-tracking-453317.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
}

// Function to get Google Sheets client using the service account JSON
// This function should only be called on the server side
export async function getGoogleSheetsClientFromJson() {
  // Make sure we're on the server side
  if (typeof window !== "undefined") {
    throw new Error("This function can only be called on the server side")
  }

  try {
    // Create JWT client
    const client = new JWT({
      email: serviceAccountJson.client_email,
      key: serviceAccountJson.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"],
    })

    // Authorize the client
    await client.authorize()

    // Create Google Sheets API client
    const sheets = google.sheets({ version: "v4", auth: client })
    const drive = google.drive({ version: "v3", auth: client })

    return { sheets, drive, client }
  } catch (error) {
    console.error("Error initializing Google Sheets client from JSON:", error)
    throw error
  }
}

// Export the service account details for use in other parts of the app
export const serviceAccountDetails = {
  projectId: serviceAccountJson.project_id,
  clientEmail: serviceAccountJson.client_email,
  privateKey: serviceAccountJson.private_key,
}
