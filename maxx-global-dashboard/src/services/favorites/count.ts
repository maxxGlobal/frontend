import api from "../../lib/api";

// Favori sayısını döndüren basit servis
export async function getFavoriteCount(): Promise<number> {
  const res = await api.get("/favorites/count");
  // Swagger örneği: { success:true, data: 5, ... }
  return res.data?.data ?? 0;
}
