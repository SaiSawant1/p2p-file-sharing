"use client";
import { Message, MessageType } from "@/types";

export const createMessage = (
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

export const consumeMessage = (msg: Message): { sessionId?: string } => {
  if (msg.type === "SESSION_CREATED") {
    if (msg.sessionId) {
      return { sessionId: msg.sessionId };
    } else {
      console.log("NO Session Id Found.");
      return { sessionId: "" };
    }
  } else {
    return {};
  }
};
