import { io } from "socket.io-client";
import { BASEURL } from "./App";

const URL = BASEURL;

export const socket = io(URL);
