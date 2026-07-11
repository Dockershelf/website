import axios from "axios";
import crypto from "crypto";

import type { ContactSubmission } from "./types";

export function isMailchimpConfigured(): boolean {
  return Boolean(
    process.env.MAILCHIMP_API_BASE_URL &&
    process.env.MAILCHIMP_API_KEY &&
    process.env.MAILCHIMP_LIST_ID
  );
}

export async function checkUserOnMailchimpList(
  data: ContactSubmission
): Promise<boolean> {
  const apiUrl = process.env.MAILCHIMP_API_BASE_URL;
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  const email = data.contactEmail;

  try {
    const emailHash = crypto.createHash("md5").update(email).digest("hex");
    const response = await axios({
      method: "GET",
      url: `${apiUrl}/3.0/lists/${listId}/members/${emailHash}`,
      auth: {
        username: "apikey",
        password: apiKey || "",
      },
      timeout: 10_000,
      signal: AbortSignal.timeout(10_000),
    });

    return (
      response.data.email_address == email &&
      response.data.status == "subscribed"
    );
  } catch {
    // 404 / network errors ⇒ treat as not subscribed
    return false;
  }
}

export async function addUserMailchimp(data: ContactSubmission): Promise<void> {
  const apiUrl = process.env.MAILCHIMP_API_BASE_URL;
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  const email = data.contactEmail;

  const response = await axios({
    method: "POST",
    url: `${apiUrl}/3.0/lists/${listId}/members?skip_merge_validation=true`,
    auth: {
      username: "apikey",
      password: apiKey || "",
    },
    timeout: 10_000,
    signal: AbortSignal.timeout(10_000),
    data: {
      email_address: email,
      status: "subscribed",
    },
  });

  if (response.status != 200) {
    throw new Error("Mailchimp subscribe failed");
  }
}
