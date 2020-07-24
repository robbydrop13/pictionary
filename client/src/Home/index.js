import React from 'react';
import { Link } from 'react-router-dom';
import * as ROUTES from './../routes';
import { Space, Row, Col, Button } from 'antd';

const Home = () => (
	<div className="master-container" style={{'height':1024}}>
		<Row>
			<Col span={12} offset={6}>
				<Row justify="center">
					Draw
				</Row>
				<Row justify="center">
					Rules
				</Row>
				<Row justify="center">
					<Button> <Link to={ROUTES.DRAW}>Play</Link></Button>
				</Row>
			</Col>
		</Row>
	</div>
);

// SELECT LANGUAGE
// ENTER PSEUDO
// RULES


export default Home;