
import type { Uuid } from "./uuid";

export interface ShowStoreOfferPacket {
  offer_id: Uuid;
  redirect_type: "marketplace" | "dressing_room" | "third_party_server_page";
}
