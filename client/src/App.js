import React from 'react';
import './App.scss';

import { BrowserRouter as Router, Route } from 'react-router-dom';
import DrawPage from './Draw';
import HomePage from './Home';

import * as ROUTES from './routes';

const App = () => (

  <Router>
        
    <Route exact path={ROUTES.HOME} component={HomePage} />
    <Route path={ROUTES.DRAW} component={DrawPage} />

  </Router>

);



export default App;

  
