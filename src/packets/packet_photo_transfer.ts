
export interface PhotoTransferPacket {
  image_name: string;
  image_data: string;
  book_id: string;
  photo_type: number;
  source_type: number;
  owner_entity_unique_id: number;
  new_photo_name: string;
}
