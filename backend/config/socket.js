import { Server } from "socket.io";
import jwt from "jsonwebtoken";
let io;
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: true,
      credentials: true,
    },
  });
  io.use((socket, next) => {
    try {
      const cookieHeader = socket.request.headers.cookie;
      if (!cookieHeader) {
        return next(new Error("Authentication error: No cookies found"));
      }
      const cookies = Object.fromEntries(
        cookieHeader.split("; ").map(c => c.split("="))
      );
      const token = cookies.token || cookies.sellerToken;
      if (!token) {
        return next(new Error("Authentication error: No token found"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.id) {
        socket.userId = decoded.id;
      } else if (decoded.email) {
         socket.userId = decoded.email; 
      }
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.userId})`);
    if (socket.userId) {
      socket.join(`user_${socket.userId}`);
    }
    socket.on("join_seller_room", () => {
      socket.join("sellers");
    });
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
  return io;
};
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
