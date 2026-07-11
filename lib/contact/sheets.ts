import { google } from "googleapis";

import type { ContactSubmission } from "./types";

export function isSheetsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY &&
    process.env.GOOGLE_SPREADSHEET_ID &&
    process.env.GOOGLE_SPREADSHEET_NAME
  );
}

const getGoogleClient = async (clientEmail: string, privateKey: string) => {
  return google.auth.getClient({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });
};

const authorizeSheets = async (clientEmail: string, privateKey: string) => {
  const client = await getGoogleClient(clientEmail, privateKey);
  return google.sheets({
    version: "v4",
    auth: client,
  });
};

export async function addSpreadsheetRow(
  data: ContactSubmission
): Promise<void> {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/gm, "\n");
  const sheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SPREADSHEET_NAME;

  if (!clientEmail || !privateKey || !sheetId || !sheetName) {
    throw new Error("Google Sheets is not configured");
  }

  const range = `${sheetName}!A3`;
  const date = new Date();
  const sheets = await authorizeSheets(clientEmail, privateKey);

  await sheets.spreadsheets.values.append(
    {
      spreadsheetId: sheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [data.contactEmail, data.contactName, data.contactMessage, date],
        ],
      },
    },
    { timeout: 10_000 }
  );
}
