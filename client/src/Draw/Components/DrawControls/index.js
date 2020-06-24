import React, { useState, useReducer } from "react";
import { Space, Row, Col } from 'antd';
import './DrawControls.scss';
import { isCurrentDrawerContext, controlsReducer } from '../../Helpers';
import { ColorPicker } from './../Commons';

const DrawControls = () => {
	const isCurrentDrawer = React.useContext(isCurrentDrawerContext);

	const initialControls = { 
		brushColor: { r: 0, g: 0, b: 0, a: 1 }, 
		brushSize: 3, 
		background: { r: 255, g: 255, b: 255, a: 1}
	};

	const [controls, controlsDispatch] = useReducer(controlsReducer, initialControls);

	const onBrushColorChange = (color) => {
    controlsDispatch({type: 'BRUSH_COLOR', payload: { control: color.rgb}});
  };

  const onBrushSizeChange = (size) => {
    controlsDispatch({type: 'BRUSH_SIZE', payload: { control: size}});
  };
  
  const onBackgroundChange = (color) => {
    controlsDispatch({type: 'BACKGROUND', payload: { control: color.rgb}});
  };

  return (	
 		<div className="drawControls main-container">
 			
 			{isCurrentDrawer ? ( 
 				<Row vertical-alignment="middle">

	 				<Col span={8}>

	 					<Space direction="horizontal" align="center" className="drawControl">
	 						<div className="drawControlLabel">Brush Color</div>
	 						<ColorPicker handleChange={onBrushColorChange} color={controls.brushColor}></ColorPicker> 
			 			</Space>
	 				</Col>
	 				<Col span={8}>
	 					<div className="drawControl">
	 						<div>Brush Size</div>
	 						<div style={{ background:`rgb(${controls.brushColor.r},${controls.brushColor.g},${controls.brushColor.b},${controls.brushColor.a})`, height:10, width:10}}></div>
	 						<div style={{ background:`rgb(${controls.background.r},${controls.background.g},${controls.background.b},${controls.background.a})`, height:10, width:10}}></div>
	 					</div>
	 				</Col>
	 				<Col span={8}>
	 					<Space direction="horizontal" align="center" className="drawControl">
	 						<div className="drawControlLabel">Brush Color</div>
	 						<ColorPicker handleChange={onBackgroundChange} color={controls.background}></ColorPicker> 
			 			</Space>
	 				</Col>

 				</Row>
 			) : ( 
 				<div> Robin is drawing
 				</div>
 			)}
 			
 		</div>
 	);
}

export default DrawControls;