import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';
import { socket, selfPlayer } from '../../Helpers';
import { Row, Col, Divider, Form, Input, Button } from 'antd';
import { UserTag } from './../Commons';
import { SendOutlined } from '@ant-design/icons'; 
import './Chat.scss';

const Chat = () => {

  const [messages, setMessages] = useState([]);
  
  const onSendMessage = ({text}) => {
    var message = {
      id: uuidv4(),
      sender: selfPlayer,
      text: text,
    }
    socket.emit('new message', message);
    setMessages(prevMessages => prevMessages.concat(message));
  }

  useEffect(() => {
    socket.on('new message', (message) => {
      setMessages(prevMessages => prevMessages.concat(message));
    });
    return () => {
      socket.off('new message');
    };
  }, []);

  return (
    <div className="chat main-container"> 
      <Messages messages={messages}></Messages>
      <Divider />
      <CurrentMessage sendMessage={onSendMessage}></CurrentMessage>
    </div>
  )
}

const Messages = ({messages}) => {

  const messageStyling = (message) => {
    switch(message.sender.pseudo) {
      case selfPlayer.pseudo:
        return "selfMessage";
      case "Draw!":
        return "systemMessage";
      default:
        return "message";
    }
  }

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current.scrollIntoView({ behavior: "smooth" }), 200);
  }

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="messages">
      {messages.map(message =>
        <Row key={message.id} 
            justify={message.sender.pseudo===selfPlayer.pseudo ? "end" : "start"}>
          <Col span={12}>
          <div className={messageStyling(message)}>
            
              <UserTag user={message.sender}></UserTag>
              <div className="senderMessage">
                <span>{message.sender.pseudo}</span>
                <div className="messageText"> {message.text} </div>
              </div>
           
          </div>
          </Col>
        </Row>
      )}
      <div 
        style={{ float:"left", clear: "both" }}
        ref={messagesEndRef}>
      </div>
    </div>
  )
}

const CurrentMessage = ({sendMessage}) => {
  const [form] = Form.useForm();
  const messageInput = useRef(null);
  
  const onFinish = (value) => {
    sendMessage(value);
    form.resetFields();
    messageInput.current.focus()
  }

  return (
    <div className="currentMessage">
      <Form
        form={form}
        onFinish={onFinish}
        layout="inline"
      >
        <Form.Item name="text"
        wrapperCol={{ sm: 24 }} style={{ flex: "auto", paddingRight: 20, marginLeft: 13 }}
        rules={[{ required: true, message: ' ' }]}
        >
          <Input ref={messageInput}/>
        </Form.Item>
        <Form.Item>
        <Button
          type="primary" 
          htmlType="submit"
        ><SendOutlined style={{ position: "absolute", top: 7, left: 11 }}/></Button>
        </Form.Item>
      </Form> 
    </div>
  )
}

export default Chat;