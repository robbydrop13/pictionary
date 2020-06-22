import socketIOClient from "socket.io-client";

export const socket = socketIOClient("http://localhost:5000/");

const pseudos = ["bob","lola","joe","jean","yves","robin","gwenn"];

const colors = ["yellow","orange","red","blue","green"];

export const selfPlayer = { 
  pseudo: pseudos[Math.floor(Math.random() * pseudos.length)],
  score: 0,
  drawer: false,
  color: colors[Math.floor(Math.random() * colors.length)],
};