import { io, Socket } from "socket.io-client";

export function createSocket(baseUrl: string, token?: string): Socket {
  const socket = io(baseUrl, { auth: { token }, autoConnect: true });
  return socket;
}


