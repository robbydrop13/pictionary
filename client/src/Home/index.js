import React from 'react';
import * as ROUTES from './../routes';
import { BrowserRouter as Router, Link } from 'react-router-dom';

const Home = () => (
	<div> <Link to={ROUTES.DRAW}>Play</Link></div>
);

export default Home;