import React, { useState, useEffect, useRef, useContext } from "react";
import Immutable from 'immutable';
import { socket, isCurrentDrawer, 
        playersContext, controlsContext, 
        isGameLiveContext } from '../../Helpers';
import './DrawArea.scss';

const DrawArea = () => {
  const players = useContext(playersContext);
  const {isGameLive} = useContext(isGameLiveContext);
  const {controls, controlsDispatch} = useContext(controlsContext);
  const [lineControls, setLineControls] = useState([]);
  const [lines, setLines] = useState(new Immutable.List());
  const [isDrawing, setIsDrawing] = useState(false);
  const drawArea = useRef();

  useEffect(() => {
    socket.on('drawing mouse down', (p) => {
      const point = new Immutable.Map({ x: p.x, y: p.y, });
      setLineControls(prevLineControls => prevLineControls.concat([controls]));
      setLines(prevLines => prevLines.push(new Immutable.List([point, point])));
    });

    socket.on('drawing mouse move', (p) => {
      const point = new Immutable.Map({ x: p.x, y: p.y, });
      setLines(prevLines => 
         prevLines.updateIn([prevLines.size - 1], line => line.push(point))
      );
    });
    if (controls.clearCanvas === true) {
      setLineControls([]);
      setLines(new Immutable.List());
      controlsDispatch({type: 'UNCLEAR_CANVAS'});
    }
  return () => {
      socket.off('drawing mouse down');
      socket.off('drawing mouse move');
    };
  },[controls]);

  useEffect(() => {
    socket.on('change brush color control', (color) => {  
      controlsDispatch({type: 'BRUSH_COLOR', payload: { control: color.rgb}});
    });

    socket.on('change background control', (color) => {  
      controlsDispatch({type: 'BACKGROUND', payload: { control: color.rgb}});
    });

    socket.on('change brush size control', (size) => {  
      controlsDispatch({type: 'BRUSH_SIZE', payload: { control: size}});
    });

    socket.on('clear canvas', () => {  
      setLines(new Immutable.List());
      setLineControls([]);
    });

    return () => {
      socket.off('change brush color control');
      socket.off('change background control');
      socket.off('change brush size control');
      socket.off('clear canvas');
    };
  },[]);

  const handleMouseDown = (mouseEvent) => {
    const point = relativeCoordinatesForEvent(mouseEvent);
    setLineControls(prevLineControls => prevLineControls.concat([controls]));
    setLines(prevLines => prevLines.push(new Immutable.List([point, point])));
    setIsDrawing(true);
    socket.emit('drawing mouse down', point);
  }

  const handleMouseMove = (mouseEvent) => {
    if (isDrawing && lines !== new Immutable.List()) {
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
        className="drawArea main-container"
        ref={drawArea}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ "background": `rgb(
                  ${controls.background.r},
                  ${controls.background.g},
                  ${controls.background.b},
                  ${controls.background.a}`,
                  "pointerEvents": isCurrentDrawer(players) && isGameLive ? "unset" : "none"  }}
      >
       <Drawing lines={lines} lineControls={lineControls}></Drawing>
      </div>
  )
}

const Drawing = ({lines, lineControls}) => {
  return (
    <svg className="drawing">
      {(lines || []).map((line, index) => (
        <DrawingLine key={index} line={line} lineControl={lineControls[index]}/>
      ))}
    </svg>
  )
}

const DrawingLine = ({line, lineControl}) => {
  const pathData = "M " + line.map(p => {
    return `${p.get('x')} ${p.get('y')}`;
  })
  .join(" L ");

  return <path 
          className="path" d={pathData} 
          style={{ "stroke": `rgb(${lineControl.brushColor.r},${lineControl.brushColor.g},${lineControl.brushColor.b},${lineControl.brushColor.a}`, "strokeWidth": lineControl.brushSize }}
        />; 
}

export default DrawArea;