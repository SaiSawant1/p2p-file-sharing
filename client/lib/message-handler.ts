"use client";
import { Message, MessageType } from "@/types";

export const createMessage = (
  msgType: MessageType,
  sessionId?: string,
  sdp?: string,
  candidate?: string,
): Message => {
  switch (msgType) {
    case "CREATE_SESSION":
      return { type: "CREATE_SESSION" };
    case "JOIN_SESSION":
      return { type: "JOIN_SESSION", sessionId };
    case "OFFER":
      return { type: "OFFER", sessionId, sdp };
    case "ANSWER":
      return { type: "ANSWER", sessionId, sdp };
    case "ICE_CANDIDATE":
      return { type: "ICE_CANDIDATE", sessionId, sdp, candidate };
    default:
      throw new Error(`Unknown message type: ${msgType}`);
  }
};

export const consumeMessage = (msg: Message): {
  sessionId?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
} => {
  switch (msg.type) {
    case "SESSION_CREATED":
      return { sessionId: msg.sessionId };
    case "PEER_CONNECTED":
      return { sessionId: msg.sessionId };
    case "OFFER":
      return {
        sessionId: msg.sessionId,
        sdp: msg.sdp ? JSON.parse(msg.sdp) : undefined,
      };
    case "ANSWER":
      return {
        sessionId: msg.sessionId,
        sdp: msg.sdp ? JSON.parse(msg.sdp) : undefined,
      };
    case "ICE_CANDIDATE":
      return {
        sessionId: msg.sessionId,
        candidate: msg.candidate ? JSON.parse(msg.candidate) : undefined,
      };
    default:
      return {};
  }
};
