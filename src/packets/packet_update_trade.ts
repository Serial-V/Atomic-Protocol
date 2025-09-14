
import type { WindowID } from "./WindowID";
import type { WindowType } from "./WindowType";
import type { Varint64 } from "./varint64";
import type { Nbt } from "./nbt";

export interface UpdateTradePacket {
  window_id: WindowID;
  window_type: WindowType;
  size: number;
  trade_tier: number;
  villager_unique_id: Varint64;
  entity_unique_id: Varint64;
  display_name: string;
  new_trading_ui: boolean;
  economic_trades: boolean;
  offers: Nbt;
}
