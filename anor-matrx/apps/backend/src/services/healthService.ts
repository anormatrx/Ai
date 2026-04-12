import http from '../providers/httpClient';

export async function pingExternal(url: string) {
  const res = await http.get(url);
  return res.status;
}
