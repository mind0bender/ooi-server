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
  console.log(`++ user: ${ansiColors.greenBright(user.id)}`);
  user.emit("connected");
  user.on("disconnect", () => {
    console.log(`-- user: ${ansiColors.red(user.id)}`);
  });
});
