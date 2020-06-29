import React, { useContext} from "react";
import _ from 'lodash';
import { socket, isCurrentDrawer, 
		playersContext, controlsContext,
		isGameLiveContext } from '../../Helpers';
import { Space, Row, Col, Select, Badge, Button } from 'antd';
import { ColorPicker, UserTag } from './../Commons';
import './DrawControls.scss';

const { Option } = Select;

const DrawControls = () => {
	const players = useContext(playersContext);
	const {isGameLive} = useContext(isGameLiveContext);
	const {controls, controlsDispatch} = useContext(controlsContext);
	const currentDrawer = players.filter(player => player.drawer);

	const onBrushColorChange = (color) => {
    controlsDispatch({type: 'BRUSH_COLOR', payload: { control: color.rgb}});
    socket.emit('change brush color control', color);
  };
  
  const onBackgroundChange = (color) => {
    controlsDispatch({type: 'BACKGROUND', payload: { control: color.rgb}});
    socket.emit('change background control', color);
  };

  const onBrushSizeChange = (size) => {
    controlsDispatch({type: 'BRUSH_SIZE', payload: { control: size}});
    socket.emit('change brush size control', size);
  };

  const onClearCanvas = () => {
  	controlsDispatch({type: 'CLEAR_CANVAS'});
  	socket.emit('clear canvas');
  }

  return (	
 		<div className="main-container">
 			
 			{isCurrentDrawer(players) ? ( 
 				<Row justify="space-around" align="middle" style={{'height':60}}>
	 				<Col span={5}>
	 					<Space direction="horizontal" align="center">
	 						<div>Brush Color</div>
	 						<div style={{'marginTop':6}} >
	 							<ColorPicker handleChange={onBrushColorChange} color={controls.brushColor}></ColorPicker> 
			 				</div>
			 			</Space>
	 				</Col>
	 				<Col span={5}>
	 					<Space direction="horizontal" align="center">
	 						<div>Background</div>
	 						<div style={{'marginTop':6}} >
	 							<ColorPicker handleChange={onBackgroundChange} color={controls.background}></ColorPicker> 
			 				</div>
			 			</Space>
	 				</Col>
	 				<Col span={5}>
	 						<Space direction="horizontal" align="center">
	 							<div>Brush Size</div>
	 							<Select defaultValue={controls.brushSize} style={{ width: 64}} bordered={false} onChange={onBrushSizeChange}>
	 								<Option value={1}><span><Badge count={1}></Badge></span></Option>
	 								<Option value={3}><span><Badge count={2}></Badge></span></Option>
	 								<Option value={5}><span><Badge count={3}></Badge></span></Option>
	 								<Option value={7}><span><Badge count={4}></Badge></span></Option>
	 								<Option value={9}><span><Badge count={5}></Badge></span></Option>
	 							</Select> 
			 				</Space>
	 				</Col>
	 				<Col span={5}>
	 						<Space direction="horizontal" align="center">
	 							<Button style={{ width: 64}} type="link" onClick={onClearCanvas}>
	 								Clear Canvas
	 							</Button> 
			 				</Space>
	 				</Col>
 				</Row>
 			) : ( 
 				<Row justify="space-around" align="middle" style={{'height':60}}>
 						{ !_.isEmpty(currentDrawer) && !isCurrentDrawer(players) && 
 							<Space direction="horizontal" align="center">
 								<UserTag user={currentDrawer[0]}></UserTag>
 								<span style={{ "fontSize":15, "marginLeft": 8}}>{currentDrawer[0].pseudo}{isGameLive ? " is drawing..." : " draws next"}</span>
 							</Space>
 						}
 				</Row>
 			)}
 			
 		</div>
 	);
}

export default DrawControls;