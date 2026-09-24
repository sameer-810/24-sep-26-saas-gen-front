import { http } from "@/shared/api/http";

/** Fetches an auth-protected endpoint as a blob and saves it as a file. */
export async function downloadAuthenticatedFile(path: string, filename: string) {
  const res = await http.get(path, { responseType: "blob" });
  const url = URL.createObjectURL(res.data as Blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
