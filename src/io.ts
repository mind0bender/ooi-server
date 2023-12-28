import ansiColors from "ansi-colors";
import { server } from "./index";
import { Server, Socket } from "socket.io";

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

io.on("connection", (user: Socket) => {
  console.log(
    `++ user: ${ansiColors.greenBright(user.id)} | ${io.sockets.sockets.size}`
  );
  user.emit("connected");
  user.emit("rooms_change", [...user.rooms]);

  user.on("create_room", (roomId: string) => {
    if (roomId && !roomId.startsWith("admin:"))
      if (io.sockets.adapter.rooms.has(roomId)) {
        user.emit("room_exists", roomId);
        return;
      }
    user.join(roomId);
    user.join(`admin:${roomId}`);
    user.emit("room_created", roomId);

    user.emit("rooms_change", [...user.rooms]);
  });

  user.on(
    "accept_join",
    ({
      userId,
      roomId,
      accept,
    }: {
      userId: string;
      roomId: string;
      accept: boolean;
    }) => {
      if (user.rooms.has(`admin:${roomId}`)) {
        if (accept) {
          const requesterUser: Socket | undefined =
            io.sockets.sockets.get(userId);
          requesterUser?.join(roomId);
          requesterUser?.emit("rooms_change", [...user.rooms]);

          user.to(userId).emit("join_accepted", {
            roomId,
          });
        }
      }
    }
  );

  user.on("join_room_ask", (roomId: string) => {
    if (!io.sockets.adapter.rooms.has(roomId)) {
      user.emit("join_room_ask_res", { exists: false, roomId });
      return;
    }
    user.emit("join_room_ask_res", { exists: true, roomId });

    user.to(`admin:${roomId}`).emit("join_room_ask", {
      userId: user.id,
      roomId,
    });
  });

  user.on(
    "join_room_ask_res",
    ({ roomId, userId }: { userId: string; roomId: string }) => {
      user.emit("join_room_ask", { roomId, userId });
    }
  );

  user.on("join_accepted", ({ roomId }: { roomId: string }) => {
    user.emit("join_accepted", { roomId });
  });

  user.on("check_room_exists", (roomId: string) => {
    if (io.sockets.adapter.rooms.has(roomId)) {
      user.emit("check_room_exists_res", { roomId, exists: true });
      return;
    }
    user.emit("check_room_exists_res", { roomId, exists: false });
  });

  user.on("disconnect", () => {
    console.log(
      `-- user: ${ansiColors.red(user.id)} | ${io.sockets.sockets.size}`
    );
  });
});
