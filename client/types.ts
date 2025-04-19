export const MessageType = {
  CREATE_SESSION: "CREATE_SESSION",
  JOIN_SESSION: "JOIN_SESSION",
  SESSION_CREATED: "SESSION_CREATED",
  PEER_CONNECTED: "PEER_CONNECTED",
  OFFER: "OFFER",
  ANSWER: "ANSWER",
  ICE_CANDIDATE: "ICE_CANDIDATE",
  ERROR: "ERROR",
} as const;

export type Message = {
  type: keyof typeof MessageType;
  sessionId?: string;
  sdp?: string;
  candidate?: string;
};
