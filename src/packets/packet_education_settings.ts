
export interface EducationSettingsPacket {
  CodeBuilderDefaultURI: string;
  CodeBuilderTitle: string;
  CanResizeCodeBuilder: boolean;
  disable_legacy_title_bar: boolean;
  post_process_filter: string;
  screenshot_border_path: string;
  has_agent_capabilities: boolean;
  agent_capabilities: {  has: boolean;
  can_modify_blocks: boolean;};
  HasOverrideURI: boolean;
  OverrideURI: string;
  HasQuiz: boolean;
  has_external_link_settings: boolean;
  external_link_settings: {  has: boolean;
  url: string;
  display_name: string;};
}
