import { getAxiosInstance } from ".";

export const createPublish = async (payload: any) => {
  const api = getAxiosInstance();
  const { data } = await api.put("/publish", payload);
  return data;
}