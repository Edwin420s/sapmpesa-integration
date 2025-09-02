import React from 'react';
import './DashboardCards.css';

const DashboardCard = ({ icon, value, title, color }) => {
  return (
    <div className="dashboard-card">
      <div className="card-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="card-content">
        <div className="card-value">{value}</div>
        <h3 className="card-title">{title}</h3>
      </div>
    </div>
  );
};

const DashboardCards = ({ stats }) => {
  return (
    <div className="dashboard-cards">
      {stats.map((stat, index) => (
        <DashboardCard
          key={index}
          icon={stat.icon}
          value={stat.value}
          title={stat.title}
          color={stat.color}
        />
      ))}
    </div>
  );
};

export default DashboardCards;
