import { Resend } from "resend";

import type { ContactSubmission } from "./types";

const OUTBOUND_TIMEOUT_MS = 10_000;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms = OUTBOUND_TIMEOUT_MS
): Promise<T> {
  const signal = AbortSignal.timeout(ms);
  return await new Promise<T>((resolve, reject) => {
    const onAbort = () =>
      reject(new Error(`Contact outbound timed out after ${ms}ms`));
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      }
    );
  });
}

/**
 * Primary contact delivery. Success of the contact API depends on this call.
 * Throws when Resend is misconfigured or emails.send fails.
 */
export async function sendContactEmail(
  data: ContactSubmission
): Promise<{ id: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;
  const fromName = process.env.EMAIL_FROM_NAME || "Website";
  const to = process.env.CONTACT_TO;

  if (!apiKey || !fromEmail || !to) {
    throw new Error("Contact email is not configured");
  }

  const resend = new Resend(apiKey);
  const safeName = escapeHtml(data.contactName);
  const safeEmail = escapeHtml(data.contactEmail);
  const safeMessage = escapeHtml(data.contactMessage).replace(/\n/g, "<br />");

  const { data: result, error } = await withTimeout(
    resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      replyTo: data.contactEmail,
      subject: `New message from ${data.contactName}`,
      html: `
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Message:</strong></p>
      <p>${safeMessage}</p>
    `,
      text: [
        `Name: ${data.contactName}`,
        `Email: ${data.contactEmail}`,
        "",
        data.contactMessage,
      ].join("\n"),
    })
  );

  if (error) {
    throw new Error(error.message || "Resend emails.send failed");
  }

  if (!result?.id) {
    throw new Error("Resend emails.send returned no message id");
  }

  return { id: result.id };
}
