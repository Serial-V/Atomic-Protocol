
import type { Element } from "./Element";

export interface SetHudPacket {
  elements: Element[];
  visibility: "hide" | "reset";
}
