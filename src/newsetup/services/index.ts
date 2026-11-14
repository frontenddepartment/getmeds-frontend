/**
 * NEW SETUP — single entry point for the added workflows' services.
 * Swap the mock exports for real backend clients here; UI imports only from "@/newsetup/services".
 */
export { crm, sales, records } from "./mock";
export * from "./types";
export * from "./statuses";
