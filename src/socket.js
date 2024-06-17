import { io } from "socket.io-client";

const URL = "https://hubapi.fly.dev";

export const socket = io(URL);
