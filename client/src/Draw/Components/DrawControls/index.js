import React from "react";
import './DrawControls.scss';

const DrawControls = ({isCurrentDrawer}) => 
  <div className="drawControls main-container"> Controls ? {isCurrentDrawer ? "yes" : "no"}</div>

export default DrawControls;