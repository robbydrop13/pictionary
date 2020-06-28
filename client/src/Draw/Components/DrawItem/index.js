import React, { useState, useEffect, useContext } from "react";
import { socket, isCurrentDrawer, playersContext, controlsContext } from '../../Helpers';
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
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
        <div className="text">{remainingTime}</div>
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
  const players = useContext(playersContext);
  const {controlsDispatch} = useContext(controlsContext);
	const [word, setWord] = useState("");
  const [timer, setTimer] = useState(9);
  const [countdownKey, setCountdownKey] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    socket.on('new word', ({newWord, newTimer}) => {
      setIsPlaying(true);
      setWord(newWord);
      setTimer(newTimer/1000 - 1);
      setCountdownKey(prevCountdownKey => prevCountdownKey + 1);
      controlsDispatch({type: 'CLEAR_CANVAS'});
      console.log(newWord);
      console.log(countdownKey);
      });
    return () => {
      socket.off('new word');
    };
  }, []);

  // useEffect(() => {
  //   socket.on('win', () => {
  //     setWord('XTRANSITION');
  //     setTimer(4);
  //     setCountdownKey(prevCountdownKey => prevCountdownKey + 1);
  //     });
  //   return () => {
  //     socket.off('win');
  //   };
  // }, []);

  return (
	  <div className="container">
      <div className="timer-wrapper"> 
          <CountdownCircleTimer
          isPlaying={isPlaying}
          duration={timer}
          colors={[['#59DD4D', 0.4], ['#59DD4D', 0.4], ['#EF094E']]}
          key={countdownKey}
          >
            <ClockContent word={word} isCurrentDrawer={isCurrentDrawer(players)}></ClockContent>
          </CountdownCircleTimer>
      </div>
	  </div>
  );
}

export default DrawItem;


