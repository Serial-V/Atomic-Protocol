
export interface MapDecoration {
  type: "marker_white" | "marker_green" | "marker_red" | "marker_blue" | "cross_white" | "triangle_red" | "square_white" | "marker_sign" | "marker_pink" | "marker_orange" | "marker_yellow" | "marker_teal" | "triangle_green" | "small_square_white" | "mansion" | "monument" | "no_draw" | "village_desert" | "village_plains" | "village_savanna" | "village_snowy" | "village_taiga" | "jungle_temple" | "witch_hut =>" | "marker_white" | "marker_green" | "marker_red" | "marker_blue" | "cross_white" | "triangle_red" | "square_white" | "marker_sign" | "marker_pink" | "marker_orange" | "marker_yellow" | "marker_teal" | "triangle_green" | "small_square_white" | "mansion" | "monument" | "no_draw" | "village_desert" | "village_plains" | "village_savanna" | "village_snowy" | "village_taiga" | "jungle_temple" | "witch_hut";
  rotation: number;
  x: number;
  y: number;
  label: string;
  color_abgr: number;
}
