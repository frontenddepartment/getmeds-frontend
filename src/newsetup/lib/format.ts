export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });
