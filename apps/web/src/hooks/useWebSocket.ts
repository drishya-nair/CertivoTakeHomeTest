"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export interface WebSocketState {
  isConnected: boolean;
  error: string | null;
  socket: Socket | null;
}

export function useWebSocket(url: string = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000") {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    error: null,
    socket: null,
  });
  
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socket = io(url, {
      transports: ["websocket"],
      autoConnect: true,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on("connect", () => {
      setState(prev => ({
        ...prev,
        isConnected: true,
        error: null,
        socket,
      }));
    });

    socket.on("disconnect", () => {
      setState(prev => ({
        ...prev,
        isConnected: false,
        socket,
      }));
    });

    socket.on("connect_error", (error) => {
      setState(prev => ({
        ...prev,
        isConnected: false,
        error: error.message,
        socket,
      }));
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [url]);

  const emit = (event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return {
    ...state,
    emit,
    on,
    off,
  };
}
