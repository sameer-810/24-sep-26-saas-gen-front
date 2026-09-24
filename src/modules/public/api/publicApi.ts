import { publicHttp } from "@/shared/api/publicHttp";
import type { ContactPayload, PublicWebsite } from "../types";

type Envelope<T> = { data: T; message?: string };

export const publicApi = {
  async website() {
    const res = await publicHttp.get<Envelope<PublicWebsite>>("/website");
    return res.data.data;
  },

  async contact(payload: ContactPayload) {
    const res = await publicHttp.post<Envelope<unknown>>("/contact", payload);
    return res.data;
  },
};
