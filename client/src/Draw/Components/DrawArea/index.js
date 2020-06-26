import React, { useState, useEffect, useRef, useContext } from "react";
import Immutable from 'immutable';
import { socket, isCurrentDrawerContext, controlsContext } from '../../Helpers';
import './DrawArea.scss';


const DrawArea = () => {
  const {controls, controlsDispatch} = useContext(controlsContext);
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
    return () => {
      socket.off('drawing mouse down');
      socket.off('drawing mouse move');
    };
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
        className="drawArea main-container"
        ref={drawArea}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ "background": `rgb(${controls.background.r},${controls.background.g},${controls.background.b},${controls.background.a}` }}
      >
       <Drawing lines = {lines}></Drawing>
      </div>
  )
}

const Drawing = ({lines}) => {
  return (
    <svg className="drawing">
      {lines && lines.map((line, index) => (
        <DrawingLine key={index} line={line}/>
      ))}
    </svg>
  )
}

const DrawingLine = ({line}) => {
  const {controls, controlsDispatch} = React.useContext(controlsContext);
  const pathData = "M " + line.map(p => {
    return `${p.get('x')} ${p.get('y')}`;
  })
  .join(" L ");

  return <path 
          className="path" d={pathData} 
          style={{ "stroke": `rgb(${controls.brushColor.r},${controls.brushColor.g},${controls.brushColor.b},${controls.brushColor.a}`, "strokeWidth": controls.brushSize }}
        />; 
}

// faire que les controls soient rattachés à un path unique à chaque fois.

export default DrawArea;