import React from 'react';
import { BrowserRouter as Link } from 'react-router-dom';
import * as ROUTES from './../routes';

const Home = () => (
	<div> <Link to={ROUTES.DRAW}>Play</Link></div>
);

export default Home;