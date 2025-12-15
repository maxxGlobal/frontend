import axios from "axios";
import { getAcceptLanguageHeader, getPreferredLanguage } from "../../utils/language";

export async function listMaterials(signal?: AbortSignal): Promise<string[]> {
  const token = localStorage.getItem("token"); // login sonrası sakladığınız token

  const res = await axios.get<{ success: boolean; data: string[] }>(
    "/api/products/filters/materials", // baseURL’inize göre ayarlayın
    {
      signal,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
        "Accept-Language": getAcceptLanguageHeader(getPreferredLanguage()),
      },
    }
  );

  return res.data.data ?? [];
}
