import React, { useState, useReducer, useEffect } from "react";
import { socket, selfPlayer,
        playersContext,
        controlsContext, controlsReducer,
        isGameLiveContext, isGameLiveReducer } from './Helpers';
import { Space, Row, Col } from 'antd';
import { UserLabel } from './Components/Commons';
import DrawControls from './Components/DrawControls'
import Chat from './Components/Chat'
import DrawArea from './Components/DrawArea'
import Rank from './Components/Rank'
import DrawItem from './Components/DrawItem'
import './index.scss';

socket.emit('new player', selfPlayer);

const Draw = () => { 
  const [players, setPlayers] = useState([selfPlayer]);
  const [isGameLive, isGameLiveDispatch] = useReducer(isGameLiveReducer, true);

  const initialControls = { 
    brushColor: { r: 0, g: 0, b: 0, a: 1 }, 
    brushSize: 5,
    background: { r: 255, g: 255, b: 255, a: 1},
    clearCanvas: false
  };
  const [controls, controlsDispatch] = useReducer(controlsReducer, initialControls);

  useEffect(() => {
    socket.on('players update', (liveplayers) => {
      setPlayers(liveplayers);
    });
    return () => {
      socket.off('players update');
    };
  }, []);

  return (
    <div className="master-container">
    <playersContext.Provider value={players}>
    <isGameLiveContext.Provider value={{isGameLive, isGameLiveDispatch}}>
    <controlsContext.Provider value={{controls, controlsDispatch}}>
      <Row style={{'height':40}}>
        <Col className="logo" span={4}>
          Draw
        </Col>
        <Col span={4} offset={16}>
          <div style={{ 'float':'right', 'marginRight':20 }}>
          <UserLabel user={selfPlayer}>
          </UserLabel>
          </div>
        </Col>
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
                  <Rank players={players}>
                  </Rank>
                </Col>
              </Row>
            <Chat>
            </Chat>
          </Space>
        </Col>
        <Col span={14}>
          <Space direction="vertical" size={0}>
            <DrawControls>
            </DrawControls>
            <DrawArea>
            </DrawArea>
          </Space>
        </Col>
      </Row>
    </controlsContext.Provider>
    </isGameLiveContext.Provider>
    </playersContext.Provider>
    </div>
  )
}

export default Draw;