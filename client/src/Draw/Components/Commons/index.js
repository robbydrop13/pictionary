import React from 'react';

export const UserTag = ({user}) => (
	<div className={`userTag ${user.color}Tag`}> {user.pseudo.charAt(0).toUpperCase()}</div>
);