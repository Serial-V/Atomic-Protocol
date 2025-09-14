
export interface BookEditPacket {
  type: "replace_page" | "add_page" | "delete_page" | "swap_pages" | "sign";
  slot: number;
  undefined: {  page_number: number;
  text: string;
  photo_name: string;} | {  page_number: number;
  text: string;
  photo_name: string;} | {  page_number: number;} | {  page1: number;
  page2: number;} | {  title: string;
  author: string;
  xuid: string;};
}
