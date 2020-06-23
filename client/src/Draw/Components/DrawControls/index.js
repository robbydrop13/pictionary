import React from "react";
import './DrawControls.scss';
import { isCurrentDrawerContext } from '../../Helpers';

const DrawControls = () => {
	const isCurrentDrawer = React.useContext(isCurrentDrawerContext);
  	return (	
  		<div className="drawControls main-container"> Controls ? {isCurrentDrawer ? "yes" : "no"}</div>
  	);
}

export default DrawControls;