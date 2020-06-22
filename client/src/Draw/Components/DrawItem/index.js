import React, { useState, useEffect } from "react";
import { CountdownCircleTimer } from 'react-countdown-circle-timer'

import { socket } from '../../Helpers';
import './DrawItem.scss';

const ClockContent = ({ remainingTime, word }) => {
  if (remainingTime === 0) {
    return <div className="timer">Waiting for new game...</div>;
  }

  return (
    <div className="timer">
      <div className="text">{word}</div>
    </div>
  );
};

const DrawItem = () => {
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
	  <div className="drawItem container">
	    <div className="timer"> 
        { isNaN(timer) &&
          <div>Wait next game</div> }
        { !isNaN(timer) &&
          <CountdownCircleTimer
          isPlaying
          duration={10}
          colors={[['#59DD4D', 0.4], ['#59DD4D', 0.4], ['#EF094E']]}
          >
            <ClockContent word={word}></ClockContent>
          </CountdownCircleTimer>
        }
        
      </div>
	  </div>
  );
}

export default DrawItem;


