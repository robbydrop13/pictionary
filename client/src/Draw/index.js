import React, { useState, useEffect } from "react";
import { Space, Row, Col } from 'antd';
import _ from 'lodash';
import './index.scss';

import { socket, selfPlayer, isCurrentDrawerContext } from './Helpers';

import DrawControls from './Components/DrawControls'
import Chat from './Components/Chat'
import DrawArea from './Components/DrawArea'
import Rank from './Components/Rank'
import DrawItem from './Components/DrawItem'

socket.emit('new player', selfPlayer);

const Draw = () => { 
  const [players, setPlayers] = useState([selfPlayer]);
  const [isCurrentDrawer, setIsCurrentDrawer] = useState(false);
  

  useEffect(() => {
    socket.on('players update', (liveplayers) => {
      setPlayers(liveplayers);
      var currentDrawer = liveplayers.filter(player => player.drawer);
      if (!_.isEmpty(currentDrawer)) {
        if (currentDrawer[0].pseudo == selfPlayer.pseudo) {
          setIsCurrentDrawer(true);
        } else {
          setIsCurrentDrawer(false);
        }
      }
    });
  }, []);

  return (
    <div className="master-container">
    <isCurrentDrawerContext.Provider value={isCurrentDrawer}>
      <Row>
        <Col span={10}>
          <Space direction="vertical" size={0}>
              <Row>
                <Col span={12}>
                  <DrawItem> 
                  </DrawItem>
                </Col>
                <Col span={12}>
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
            <DrawControls>
            </DrawControls>
            <DrawArea>
            </DrawArea>
          </Space>
        </Col>
      </Row>
    </isCurrentDrawerContext.Provider>
    </div>
  )
}

export default Draw;