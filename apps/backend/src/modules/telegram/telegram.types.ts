export type TelegramUpdate = {
  update_id?: number;
  message?: TelegramMessage;
};

export type TelegramMessage = {
  message_id: number;
  chat: {
    id: number | string;
  };
  text?: string;
  caption?: string;
  photo?: TelegramPhotoSize[];
};

export type TelegramPhotoSize = {
  file_id: string;
  file_unique_id?: string;
  width?: number;
  height?: number;
  file_size?: number;
};

export type TelegramGetFileResponse = {
  ok: boolean;
  result?: {
    file_id: string;
    file_unique_id?: string;
    file_size?: number;
    file_path?: string;
  };
  description?: string;
};

export type TelegramSendMessageResponse = {
  ok: boolean;
  description?: string;
};
