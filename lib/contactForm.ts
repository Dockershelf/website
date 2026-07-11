import axios from "axios";

import { initLeadWorkflow } from "@lib/contact/workflow";
import { logError } from "@lib/logger";

export { initLeadWorkflow };

export async function verifyCaptcha(token: string): Promise<boolean> {
  try {
    const res = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_API_SECRET}&response=${token}`,
      undefined,
      { timeout: 10_000, signal: AbortSignal.timeout(10_000) }
    );
    if (res.data.success) {
      return true;
    }
    return false;
  } catch (error) {
    logError("verify-captcha", error);
    return false;
  }
}
