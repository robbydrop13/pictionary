import React, { useState, useEffect } from "react";
import { CountdownCircleTimer } from 'react-countdown-circle-timer'

import { socket, isCurrentDrawerContext } from '../../Helpers';
import './DrawItem.scss';

const ClockContent = ({ remainingTime, word, isCurrentDrawer }) => {

  if (word === "") {
    return (
      <div className="timer">
        <div className="waitText">Waiting for next game</div>
      </div>
    );
  }

  if (word === "XTRANSITION") {
    return (
      <div className="timer">
        <div className="waitText">XXX</div>
      </div>
    );
  }
  
  if (isCurrentDrawer) {
    return (
      <div className="timer">
        <div className="text">{word.toUpperCase()}</div>
      </div>
    );
  }

  return (
      <div className="timer">
        <div className="waitText">Time to guess!</div>
      </div>
  );
};

const DrawItem = () => {
  const isCurrentDrawer = React.useContext(isCurrentDrawerContext);
	const [word, setWord] = useState("");
  const [timer, setTimer] = useState(8);
  const [countdownKey, setCountdownKey] = useState(1);
  //const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    socket.on('new word', ({newWord, newTimer}) => {
      //setIsPlaying(true);
      setWord(newWord);
      setTimer(newTimer/1000 - 1);
      setCountdownKey(prevCountdownKey => prevCountdownKey + 1);
      console.log(newWord);
      console.log(countdownKey);
      });
  }, []);

  return (
	  <div className="container">
      <div className="timer-wrapper"> 
          <CountdownCircleTimer
          isPlaying
          duration={timer}
          colors={[['#59DD4D', 0.4], ['#59DD4D', 0.4], ['#EF094E']]}
          key={countdownKey}
          >
            <ClockContent word={word} isCurrentDrawer={isCurrentDrawer}></ClockContent>
          </CountdownCircleTimer>
      </div>
	  </div>
  );
}

export default DrawItem;


