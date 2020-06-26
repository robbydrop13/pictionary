import React, { useState, useReducer, useEffect } from "react";
import { Space, Row, Col } from 'antd';
import _ from 'lodash';
import './index.scss';

import { socket, selfPlayer, 
        isCurrentDrawerContext, isCurrentDrawerReducer,
        controlsContext, controlsReducer } from './Helpers';

import DrawControls from './Components/DrawControls'
import Chat from './Components/Chat'
import DrawArea from './Components/DrawArea'
import Rank from './Components/Rank'
import DrawItem from './Components/DrawItem'

socket.emit('new player', selfPlayer);

const Draw = () => { 
  const [players, setPlayers] = useState([selfPlayer]);
  const [isCurrentDrawer, isCurrentDrawerDispatch] = useReducer(isCurrentDrawerReducer, false);

  const initialControls = { 
    brushColor: { r: 0, g: 0, b: 0, a: 1 }, 
    brushSize: 5,
    background: { r: 255, g: 255, b: 255, a: 1}
  };
  const [controls, controlsDispatch] = useReducer(controlsReducer, initialControls);

  useEffect(() => {
    socket.on('players update', (liveplayers) => {
      setPlayers(liveplayers);
      var currentDrawer = liveplayers.filter(player => player.drawer);
      if (!_.isEmpty(currentDrawer)) {
        if (currentDrawer[0].pseudo === selfPlayer.pseudo) {
          isCurrentDrawerDispatch({type: "SET_DRAWER"});
        } else {
          isCurrentDrawerDispatch({type: "SET_NOT_DRAWER"});
        }
      }
    });
    return () => {
      socket.off('players update');
    };
  }, []);

  return (
    <div className="master-container">
    <isCurrentDrawerContext.Provider value={isCurrentDrawer}>
    <controlsContext.Provider value={{controls, controlsDispatch}}>
      <Row style={{'height':40}}>
        Hello
      </Row>
      <Row>
        <Col span={10}>
          <Space direction="vertical" size={0}>
              <Row justify="space-around" align="top" style={{'height':200}}>
                <Col span={10}>
                  <DrawItem> 
                  </DrawItem>
                </Col>
                <Col span={10}>
                  <Rank players={players} >
                  </Rank>
                </Col>
              </Row>
            <Chat>
            </Chat>
          </Space>
        </Col>
        <Col span={14}>
          <Space direction="vertical" size={0}>
            <DrawControls 
              players={players} 
            >
            </DrawControls>
            <DrawArea 
            >
            </DrawArea>
          </Space>
        </Col>
      </Row>
    </controlsContext.Provider>
    </isCurrentDrawerContext.Provider>
    </div>
  )
}

export default Draw;