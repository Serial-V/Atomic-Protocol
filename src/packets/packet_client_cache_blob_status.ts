
export interface ClientCacheBlobStatusPacket {
  misses: number;
  haves: number;
  missing: number[];
  have: number[];
}
