import { logError } from "@lib/logger";

export const isSchemaValid = async (schema: any, body: any) => {
  try {
    const status = await schema.isValid(body);
    return status;
  } catch (error) {
    logError("isSchemaValid", error);
    return false;
  }
};
