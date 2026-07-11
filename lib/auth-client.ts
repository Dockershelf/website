"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Browser Better Auth client. Safe to import from client components;
 * server soft-gates /admin and /api/auth when FEATURE_BLOG is off.
 */
export const authClient = createAuthClient();
