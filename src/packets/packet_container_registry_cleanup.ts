
import type { FullContainerName } from "./FullContainerName";

export interface ContainerRegistryCleanupPacket {
  removed_containers: FullContainerName[];
}
