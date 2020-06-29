import React from 'react';
import socketIOClient from "socket.io-client";
import _ from 'lodash';

export const socket = socketIOClient("http://localhost:5000/");

const pseudos = ["bob","lola","joe","jean","yves","robin","gwenn"];

const colors = ["yellow","orange","red","blue","green"];

export const selfPlayer = { 
  pseudo: `${pseudos[Math.floor(Math.random() * pseudos.length)]}${Math.floor(Math.random()* 100)}`,
  score: 0,
  drawer: false,
  color: colors[Math.floor(Math.random() * colors.length)],
};

export const controlsContext = React.createContext(null);

export function controlsReducer(controls, action) {
  switch (action.type) {
    case 'BRUSH_COLOR':
    	return { ...controls, brushColor: action.payload.control};
    case 'BACKGROUND':
    	return { ...controls, background: action.payload.control};
    case 'BRUSH_SIZE':
      return { ...controls, brushSize: action.payload.control};
    case 'CLEAR_CANVAS':
      return { ...controls, clearCanvas: true};
    case 'UNCLEAR_CANVAS':
      return { ...controls, clearCanvas: false};
    default:
      throw new Error();
  }
}

export const isGameLiveContext = React.createContext(null);

export function isGameLiveReducer(isGameLive, action) {
  switch (action.type) {
    case 'LIVE':
      return isGameLive=true;
    case 'TRANSITION':
      return isGameLive=false;
    default:
      throw new Error();
  }
}

export const playersContext = React.createContext(null);

export const isCurrentDrawer = (players) => {
  let currentDrawer = players.filter(player => player.drawer);
  if (!_.isEmpty(currentDrawer)) {
    return currentDrawer[0].pseudo === selfPlayer.pseudo;
  }
}