import React, { useReducer } from "react";
import { Space, Row, Col, Select, Badge } from 'antd';
import _ from 'lodash';
import './DrawControls.scss';
import { isCurrentDrawerContext, controlsReducer } from '../../Helpers';
import { ColorPicker, UserTag } from './../Commons';

const { Option } = Select;

const DrawControls = ({players}) => {
	const isCurrentDrawer = React.useContext(isCurrentDrawerContext);
	const currentDrawer = players.filter(player => player.drawer);
	//console.log(players.filter(player => player.drawer)[0].pseudo);
	// si je mets le drawer partout, je peux en fait virer le isCurrentDrawer partout.
	// condition sur le isEmpty en bas
	//rgb(${controls.brushColor.r},${controls.brushColor.g},${controls.brushColor.b},${controls.brushColor.a}

	const initialControls = { 
		brushColor: { r: 0, g: 0, b: 0, a: 1 }, 
		brushSize: 3,
		background: { r: 255, g: 255, b: 255, a: 1}
	};

	const [controls, controlsDispatch] = useReducer(controlsReducer, initialControls);

	const onBrushColorChange = (color) => {
    controlsDispatch({type: 'BRUSH_COLOR', payload: { control: color.rgb}});
  };
  
  const onBackgroundChange = (color) => {
    controlsDispatch({type: 'BACKGROUND', payload: { control: color.rgb}});
  };

  const onBrushSizeChange = (size) => {
    controlsDispatch({type: 'BRUSH_SIZE', payload: { control: size}});
  };

  return (	
 		<div className="main-container">
 			
 			{isCurrentDrawer ? ( 
 				<Row justify="space-around" align="middle" style={{'height':60}}>
	 				<Col span={6}>
	 					<Space direction="horizontal" align="center">
	 						<div>Brush Color</div>
	 						<div style={{'margin-top':6}} >
	 							<ColorPicker handleChange={onBrushColorChange} color={controls.brushColor}></ColorPicker> 
			 				</div>
			 			</Space>
	 				</Col>
	 				<Col span={6}>
	 					<Space direction="horizontal" align="center">
	 						<div>Background</div>
	 						<div style={{'margin-top':6}} >
	 							<ColorPicker handleChange={onBackgroundChange} color={controls.background}></ColorPicker> 
			 				</div>
			 			</Space>
	 				</Col>
	 				<Col span={6}>
	 						<Space direction="horizontal" align="center">
	 							<div>Brush Size</div>
	 							<Select defaultValue={controls.brushSize} style={{ width: 64}} bordered={false} onChange={onBrushSizeChange}>
	 								<Option value={1}><span><Badge count={1}></Badge></span></Option>
	 								<Option value={2}><span><Badge count={2}></Badge></span></Option>
	 								<Option value={3}><span><Badge count={3}></Badge></span></Option>
	 							</Select> 
			 				</Space>
	 				</Col>
 				</Row>
 			) : ( 
 				<Row justify="space-around" align="middle" style={{'height':60}}>
 						{ !_.isEmpty(currentDrawer) && !isCurrentDrawer && 
 							<Space direction="horizontal" align="center">
 								<UserTag user={currentDrawer[0]}></UserTag>
 								<span style={{ "fontSize":15, "margin-left": 8}}>{currentDrawer[0].pseudo} is drawing...</span>
 							</Space>
 						}
 				</Row>
 			)}
 			
 		</div>
 	);
}

export default DrawControls;