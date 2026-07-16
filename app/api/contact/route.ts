import { NextRequest, NextResponse } from "next/server";
import * as yup from "yup";

import { initLeadWorkflow, verifyCaptcha } from "@lib/contactForm";
import { FEATURE_CONTACT } from "@lib/features";
import { logError } from "@lib/logger";
import { isSchemaValid } from "@lib/utils";

export async function POST(request: NextRequest) {
  if (!FEATURE_CONTACT) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const schema = yup
    .object({
      contactName: yup.string().required(),
      contactEmail: yup.string().required(),
      contactMessage: yup.string().required(),
      token: yup.string().required(),
    })
    .required();

  try {
    const body = await request.json();

    if (!(await isSchemaValid(schema, body))) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    if (!(await verifyCaptcha(body.token))) {
      return NextResponse.json({ error: "Invalid captcha" }, { status: 403 });
    }

    await initLeadWorkflow(body);
    return NextResponse.json({ sent: true });
  } catch (error) {
    logError("contact-api", error, {
      hasBody: !!request.body,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
