"use client";
import { Message, MessageType } from "@/types";

export const createMessage = (
  type: keyof typeof MessageType,
  sessionId?: string,
  sdp?: string,
  candidate?: string,
): Message => {
  return {
    type,
    sessionId,
    sdp,
    candidate,
  };
};

export const consumeMessage = (msg: Message) => {
  return {
    sessionId: msg.sessionId,
    sdp: msg.sdp ? JSON.parse(msg.sdp) as RTCSessionDescriptionInit : undefined,
    candidate: msg.candidate
      ? JSON.parse(msg.candidate) as RTCIceCandidateInit
      : undefined,
  };
};
