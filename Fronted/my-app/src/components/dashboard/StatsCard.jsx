import React from 'react';

const StatsCard = ({ title, value, icon, color }) => {
  return (
    <div className={`card border-${color} shadow-sm`}>
      <div className="card-body">
        <div className="row align-items-center">
          <div className="col">
            <h6 className="card-title text-muted mb-2">{title}</h6>
            <h3 className="card-text fw-bold">{value}</h3>
          </div>
          <div className="col-auto">
            <i className={`${icon} fa-2x text-${color}`}></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;