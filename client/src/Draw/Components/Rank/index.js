import React, {useContext} from "react";
import { playersContext } from '../../Helpers';
import { UserLabel } from './../Commons';
import './Rank.scss';

const Rank = () => {
  const players = useContext(playersContext);
  const compare = ( a, b ) => {
    if ( a.score < b.score ){
      return 1;
    }
    if ( a.score > b.score ){
      return -1;
    }
    return 0;
  }

  return (
    <div className="container">
      { players.sort(compare).slice(0,5).map((user, index) =>
        <div key={user.pseudo} style={{'marginBottom':8}}>
          <UserLabel user={user}>
          </UserLabel>
        </div>
      )}
    </div>
)}

export default Rank;