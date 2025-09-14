
export interface ModalFormResponsePacket {
  form_id: number;
  has_response_data: boolean;
  data: string;
  has_cancel_reason: boolean;
  undefined: {  cancel_reason: "closed" | "busy";};
}
