import { logError } from "@lib/logger";

import {
  addUserMailchimp,
  checkUserOnMailchimpList,
  isMailchimpConfigured,
} from "./mailchimp";
import { sendContactEmail } from "./resend";
import { addSpreadsheetRow, isSheetsConfigured } from "./sheets";
import type { ContactSubmission } from "./types";

/**
 * Contact pipeline: Resend is required for success.
 * Mailchimp and Google Sheets are best-effort after Resend succeeds.
 */
export async function initLeadWorkflow(data: ContactSubmission): Promise<void> {
  await sendContactEmail(data);

  if (isMailchimpConfigured()) {
    try {
      const alreadySubscribed = await checkUserOnMailchimpList(data);
      if (!alreadySubscribed) {
        await addUserMailchimp(data);
      }
    } catch (error) {
      logError("contact-mailchimp-side-effect", error, {
        sideEffect: "mailchimp",
      });
    }
  }

  if (isSheetsConfigured()) {
    try {
      await addSpreadsheetRow(data);
    } catch (error) {
      logError("contact-sheets-side-effect", error, {
        sideEffect: "sheets",
      });
    }
  }
}
