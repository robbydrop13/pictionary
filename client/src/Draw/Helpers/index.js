import socketIOClient from "socket.io-client";
import React from 'react';

export const socket = socketIOClient("http://localhost:5000/");

const pseudos = ["bob","lola","joe","jean","yves","robin","gwenn"];

const colors = ["yellow","orange","red","blue","green"];

export const selfPlayer = { 
  pseudo: `${pseudos[Math.floor(Math.random() * pseudos.length)]}${Math.floor(Math.random()* 100)}`,
  score: 0,
  drawer: false,
  color: colors[Math.floor(Math.random() * colors.length)],
};

export const isCurrentDrawerContext = React.createContext(null);

export function controlsReducer(controls, action) {
  switch (action.type) {
    case 'BRUSH_COLOR':
    	return { ...controls, brushColor: action.payload.control};
    case 'BACKGROUND':
    	return { ...controls, background: action.payload.control};
    case 'BRUSH_SIZE':
      return { ...controls, brushSize: action.payload.control};
    default:
      throw new Error();
  }
}