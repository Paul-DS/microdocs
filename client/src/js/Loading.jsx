import React from 'react';

require('../styles/Loading.scss');

export default class Loading extends React.Component {
  render () {
    return (
      <div className="loading-container">
        <svg width='50px' height='50px' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" className="loading">
        	<circle cx="50" cy="50" r="40" stroke="rgba(0, 0, 0, 0.1)" fill="none" strokeWidth="16"></circle>
        	<circle cx="50" cy="50" r="40" strokeDasharray="60 200" stroke="#06a7ea" fill="none" strokeWidth="16">
        		<animateTransform attributeName="transform" type="rotate" values="0 50 50;180 50 50;360 50 50;" keyTimes="0;0.5;1" dur="0.8s" repeatCount="indefinite" begin="0s"></animateTransform>
        	</circle>
        </svg>
      </div>
    );
  }
}
