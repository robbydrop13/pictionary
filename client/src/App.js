import React, { useState, useEffect, useRef } from "react";
import { Space, Row, Col, Form, Input, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import socketIOClient from "socket.io-client";
import Immutable from 'immutable';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import './App.css';

const socket = socketIOClient("http://localhost:5000/");

const pseudos = ["bob","lola","joe","jean","yves","robin","gwenn"];
const selfPlayer = { 
  pseudo: pseudos[Math.floor(Math.random() * pseudos.length)],
  score: 0,
  drawer: false,
};

socket.emit('new player', selfPlayer);


// ______________________________________________  RANK  ____________________________________________________________

const Rank = ({ players }) => {
  const [word, setWord] = useState("");
  const [timer, setTimer] = useState();



  useEffect(() => {
    socket.on('new word', ({newWord, timer}) => {
      setWord(newWord);
      setTimer(timer);
      console.log(newWord);
      console.log(timer);
      });
  }, []);

  useEffect(() => {
    setInterval(() => { 
      setTimer(prevTimer => prevTimer - 1000);
    }, 1000);
  }, []);

  return (
    <div className="rank container"> 
      <Row>
        <Col span={12}>
          <RankingList players={players} >
          </RankingList>
        </Col>
        <Col span={12}>
          <DrawItem word={word} timer={timer}> 
          </DrawItem>
        </Col>
      </Row>
    </div>
  )
}

const RankingList = ({players}) => {
  const compare = ( a, b ) => {
    if ( a.score < b.score ){
      return -1;
    }
    if ( a.score > b.score ){
      return 1;
    }
    return 0;
  }

  return (
  <div className="rankingList">
    <p>{ players.length } players</p>
    { players.sort(compare).map((user, index) =>
      <p key={user.pseudo}>
        {index+1}. {user.pseudo} - 
        <span> {user.score} points</span>
        {user.drawer && 
           <span> <EditOutlined /></span>
        }
      </p>
    )}
  </div>
)}

const DrawItem = ({word, timer}) => 
  <div>
    <div className="timer"> {timer ? timer : "Wait next game"} </div>
    <div className="drawItem"> {word} </div>
  </div>


// ______________________________________________  CHAT  ____________________________________________________________

const Chat = () => {

  const [messages, setMessages] = useState([]);
  
  const onSendMessage = ({text}) => {
    var message = {
      id: uuidv4(),
      sender: selfPlayer.pseudo,
      text: text,
    }
    socket.emit('new message', message);
    setMessages(prevMessages => prevMessages.concat(message));
  }

  useEffect(() => {
    socket.on('new message', (message) => {
      setMessages(prevMessages => prevMessages.concat(message));
    });
  }, []);

  return (
    <div className="chat container"> 
      <Messages messages={messages}></Messages>
      <CurrentMessage sendMessage={onSendMessage}></CurrentMessage>
    </div>
  )
}

const Messages = ({messages}) => 
  <div className="messages">
    {messages.map(message =>
      <p key={message.id}>{message.sender}: {message.text}</p>
    )}
  </div>

const CurrentMessage = ({sendMessage}) => {
  const [form] = Form.useForm();
  
  return (
    <div className="currentMessage">
      <Form
        form={form}
        onFinish={sendMessage}
      >
        <Form.Item name="text" label="Note">
          <Input />
        </Form.Item>
      <Button
        type="primary" 
        htmlType="submit"
      >Send</Button>
      </Form>
    </div>
  )
}

// __________________________________________  DRAW CONTROLS  ________________________________________________________

const DrawControls = ({isCurrentDrawer}) => 
  <div className="drawControls container"> Controls ? {isCurrentDrawer ? "yes" : "no"}</div>

// ____________________________________________  DRAW AREA  __________________________________________________________

const DrawArea = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [lines, setLines] = useState(new Immutable.List());
  const drawArea = useRef();

  useEffect(() => {
    socket.on('drawing mouse down', (p) => {
      const point = new Immutable.Map({ x: p.x, y: p.y, });
      setLines(prevLines => prevLines.push(new Immutable.List([point, point])));
    });

    socket.on('drawing mouse move', (p) => {
      const point = new Immutable.Map({ x: p.x, y: p.y, });
      setLines(prevLines => 
         prevLines.updateIn([prevLines.size - 1], line => line.push(point))
      );
    });
  },[]);

  const handleMouseDown = (mouseEvent) => {
    const point = relativeCoordinatesForEvent(mouseEvent);
    setLines(prevLines => prevLines.push(new Immutable.List([point, point])));
    setIsDrawing(true);
    socket.emit('drawing mouse down', point);
  }

  const handleMouseMove = (mouseEvent) => {
    if (isDrawing) {
      const point = relativeCoordinatesForEvent(mouseEvent);
      setLines(prevLines => 
       prevLines.updateIn([prevLines.size - 1], line => line.push(point))
      );
      socket.emit('drawing mouse move', point);
    }
  }

  const handleMouseUp = () => {
    setIsDrawing(false);
  }

  const relativeCoordinatesForEvent = (mouseEvent) => {
    const boundingRect = drawArea.current.getBoundingClientRect();
    return new Immutable.Map({
      x: mouseEvent.clientX - boundingRect.left,
      y: mouseEvent.clientY - boundingRect.top,
    });
  }

  return (
    <div
        className="drawArea container"
        ref={drawArea}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
       <Drawing lines = {lines} ></Drawing>
      </div>
  )
}

const Drawing = ({lines}) => {
  return (
    <svg className="drawing">
      {lines && lines.map((line, index) => (
        <DrawingLine key={index} line={line} />
      ))}
    </svg>
  )
}

const DrawingLine = ({line}) => {
  const pathData = "M " + line.map(p => {
    return `${p.get('x')} ${p.get('y')}`;
  })
  .join(" L ");

  return <path className="path" d={pathData} />; 
}


const App = () => { 
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
    <div className="masterContainer">
    <Row>
      <Col span={10}>
        <Space direction="vertical" size={0}>
          <Rank players={players}>
          </Rank>
          <Chat>
          </Chat>
        </Space>
      </Col>
      <Col span={14}>
        <Space direction="vertical" size={0}>
          <DrawControls isCurrentDrawer={isCurrentDrawer}>
          </DrawControls>
          <DrawArea>
          </DrawArea>
        </Space>
      </Col>
    </Row>
    </div>
  )
}

export default App;
