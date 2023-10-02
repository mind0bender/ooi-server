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

  user.on("create_room", (roomId: string) => {
    if (io.sockets.adapter.rooms.has(roomId)) {
      user.emit("room_exists", roomId);
      return;
    }
    user.join(roomId);
    user.emit("room_created", roomId);
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
