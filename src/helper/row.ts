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

export interface UserConversationRow extends RowDataPacket {
  userId: string;
  userName: string;
  userEmail: string;
  userImage: string;
  conversationId: string | null;
  conversationName: string | null;
  conversationCreatedAt: string | null;
  messageId: string | null;
  messageText: string | null;
  messageImage: string | null;
  messageCreatedAt: string | null;
  messageUpdatedAt: string | null;
  senderId: string | null;
  senderName: string | null;
  senderEmail: string | null;
  senderImage: string | null;
  receiverId: string | null;
  receiverName: string | null;
  receiverEmail: string | null;
  receiverImage: string | null;
}
