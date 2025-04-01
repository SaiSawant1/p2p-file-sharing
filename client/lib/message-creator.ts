import { Message, MessageType } from "@/types";

export const messageCreator = (
  msgType: MessageType,
  sessionId?: string,
  sdp?: string,
  candidate?: string,
): Message => {
  if (msgType === "CREATE_SESSION") {
    return {
      type: "CREATE_SESSION",
    } as Message;
  } else if (msgType === "JOIN_SESSION") {
    return {
      type: "JOIN_SESSION",
      sessionId: sessionId,
    } as Message;
  } else if (msgType === "OFFER") {
    return {
      type: "OFFER",
      sessionId: sessionId,
      sdp: sdp,
    };
  } else {
    return {
      type: "ICE_CANDIDATE",
      sessionId: sessionId,
      sdp: sdp,
      candidate: candidate,
    };
  }
};
