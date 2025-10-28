import type { Vec3f } from "./vec3f";
import type { GraphicsOverrideParameterType } from "./GraphicsOverrideParameterType";

export interface GraphicsParameterOverridePacket {
  values: {
    key: number;
    value: Vec3f;
  }[];
  biome_identifier: string;
  parameter_type: GraphicsOverrideParameterType;
  reset: boolean;
}
