import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";

import { useAppDispatch, useAppSelector } from "@redux/hooks";
import { setPresence, setTyping } from "@redux/slices/chatSlice";
import { pushNotification } from "@redux/slices/notificationSlice";
import { SOCKET_URL } from "@utils/constants";

import { SocketEvents, type ClientToServerEvents, type ServerToClientEvents } from "./events";

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketContextValue {
  socket: AppSocket | null;
  connected: boolean;
  emitTyping: (conversationId: string, isTyping: boolean) => void;
  emitSendMessage: (conversationId: string, text: string) => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
  emitTyping: () => undefined,
  emitSendMessage: () => undefined,
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth.accessToken);
  const userId = useAppSelector((s) => s.auth.user?.id);

  const socketRef = useRef<AppSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!accessToken) return undefined;

    // `autoConnect: false` so we can configure listeners safely first; we then
    // call `.connect()` once everything is wired. The dashboard works offline
    // without an actual server — connect errors are silently absorbed.
    const socket: AppSocket = io(SOCKET_URL, {
      autoConnect: false,
      auth: { token: accessToken },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2_000,
    });

    socketRef.current = socket;

    socket.on(SocketEvents.connect, () => setConnected(true));
    socket.on(SocketEvents.disconnect, () => setConnected(false));
    socket.io.on("reconnect_attempt", () => setConnected(false));

    socket.on(SocketEvents.notificationNew, (n) => {
      dispatch(pushNotification(n));
    });

    socket.on(SocketEvents.typing, (payload) => {
      dispatch(setTyping(payload));
    });

    socket.on(SocketEvents.presence, (payload) => {
      dispatch(setPresence(payload));
    });

    // suppress noisy errors when no server is reachable (mock mode)
    socket.io.on("error", () => undefined);

    socket.connect();

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, dispatch]);

  const value = useMemo<SocketContextValue>(
    () => ({
      socket: socketRef.current,
      connected,
      emitTyping: (conversationId, isTyping) => {
        if (!userId) return;
        socketRef.current?.emit(SocketEvents.typing, {
          conversationId,
          userId,
          isTyping,
        });
      },
      emitSendMessage: (conversationId, text) => {
        socketRef.current?.emit(SocketEvents.sendMessage, {
          conversationId,
          text,
        });
      },
    }),
    [connected, userId],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
