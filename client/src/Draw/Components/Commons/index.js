import React, { useState } from 'react';
import reactCSS from 'reactcss';
import { SketchPicker } from 'react-color';

export const UserTag = ({user}) => (
	<div className={`userTag ${user.color}Tag`}> {user.pseudo.charAt(0).toUpperCase()}</div>
);

export const ColorPicker = ({handleChange, color}) => {
  
  const [displayColorPicker, setDisplayColorPicker] = useState(false); 

  const handleClick = () => {
    setDisplayColorPicker(prevDisplayColorPicker => !prevDisplayColorPicker);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  const styles = reactCSS({
      'default': {
        color: {
          width: '36px',
          height: '14px',
          borderRadius: '2px',
          background: `rgba(${ color.r }, ${ color.g }, ${ color.b }, ${ color.a })`,
        },
        swatch: {
          padding: '5px',
          background: '#fff',
          borderRadius: '1px',
          boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
          display: 'inline-block',
          cursor: 'pointer',
        },
        popover: {
          position: 'absolute',
          zIndex: '2',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    });

  return (
      <div>
        <div style={ styles.swatch } onClick={ handleClick }>
          <div style={ styles.color } />
        </div>
        { displayColorPicker ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ handleClose }/>
          <SketchPicker color={ color } onChange={ handleChange } />
        </div> : null }

      </div>
  )
}