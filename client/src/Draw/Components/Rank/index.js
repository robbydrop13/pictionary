import React from "react";
import { StarFilled } from '@ant-design/icons';

import './Rank.scss';
import { UserTag } from './../Commons';

const Rank = ({players}) => {
  const compare = ( a, b ) => {
    if ( a.score < b.score ){
      return -1;
    }
    if ( a.score > b.score ){
      return 1;
    }
    return 0;
  }

  return (
    <div className="rank container">
      { players.sort(compare).slice(0,5).map((user, index) =>
        <div className="userRank" key={user.pseudo}>
          <UserTag user={user}></UserTag>
          <span className="userScore" >{user.pseudo} - {user.score}</span><StarFilled className="scoreIcon" />
        </div>
      )}
    </div>
)}

export default Rank;