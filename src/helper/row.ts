import { RowDataPacket } from 'mysql2';

export interface UserRow extends RowDataPacket {
  id: string;
  name: string;
  email: string;
  image: string | null;
  user_type: string;
  hashed_password?: string;
  favorite_ids: string[];
}

export interface SessionRow extends RowDataPacket {
  session_token: string;
  user_id: string;
  expires: string;
}

export interface ProductRow extends RowDataPacket {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  category: string;
  latitude: number;
  longitude: number;
  price: number;
  user_id: string;
  created_at: Date;
}

export interface ProductUserRow extends RowDataPacket {
  userId: string;
  userName: string | null;
  userEmail: string;
  userImage: string | null;
  userType: string;
}

export type ProductWithUserRow = ProductRow & ProductUserRow;

export interface Message {
  messageId: string;
  text: string | null;
  image: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  sender: {
    id: string | null;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  receiver: {
    id: string | null;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export interface Conversation {
  conversationId: number;
  conversationName: string | null;
  conversationCreatedAt: string;
  messages: Message[]; // 메시지 배열
  users: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  }[]; // 참여자 배열
}

export interface UserConversationRow extends RowDataPacket {
  userId: string;
  userName: string;
  userEmail: string;
  userImage: string | null;
  conversations: Conversation[] | null; // 파싱된 JSON 객체 배열
}
