import React from 'react';
import PropTypes from 'prop-types';

const Leaderboard = ({ points, leaderboard }) => (
  <div>
    <p className="mb-2">Your Points: {points}</p>
    <ul className="list-decimal list-inside">
      {leaderboard.length > 0 ? leaderboard.map((user, index) => (
        <li key={index} className="mb-1">{user.name}: {user.score}</li>
      )) : <li>No rankings yet.</li>}
    </ul>
  </div>
);

Leaderboard.propTypes = {
  points: PropTypes.number.isRequired,
  leaderboard: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    score: PropTypes.number,
  })),
};

export default Leaderboard;