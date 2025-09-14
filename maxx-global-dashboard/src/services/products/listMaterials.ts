import axios from "axios";

export async function listMaterials(signal?: AbortSignal): Promise<string[]> {
  const token = localStorage.getItem("token"); // login sonrası sakladığınız token

  const res = await axios.get<{ success: boolean; data: string[] }>(
    "/api/products/filters/materials", // baseURL’inize göre ayarlayın
    {
      signal,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "*/*",
      },
    }
  );

  return res.data.data ?? [];
}
