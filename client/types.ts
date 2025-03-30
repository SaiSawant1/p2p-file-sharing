type MessageType =
  | "CREATE_SESSION"
  | "SESSION_CREATED"
  | "JOIN_SESSION"
  | "PEER_CONNECTED"
  | "OFFER"
  | "ANSWER"
  | "ICE_CANDIDATE";

export interface Message {
  type: MessageType;
  sessionId: string;
  sdp?: string;
  candidate?: string;
}
