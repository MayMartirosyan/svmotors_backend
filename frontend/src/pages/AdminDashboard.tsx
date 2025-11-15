import React from "react";
import { Link } from "react-router-dom";

const DashboardCard: React.FC<{
  title: string;
  link: string;
  text: string;
}> = ({ title, link, text }) => (
  <div className="bg-white p-4 rounded shadow border border-gray-200">
    <h3 className="text-lg text-slate-800">{title}</h3>
    <p className="text-slate-800">
      <Link to={link} className="text-indigo-500 hover:underline">
        {text}
      </Link>
    </p>
  </div>
);

const AdminDashboard: React.FC = () => {
  const dashboardItems = [
    {
      title: "Templates",
      link: "/admin/templates",
      text: "Manage templates here.",
    },
    {
      title: "Categories",
      link: "/admin/categories",
      text: "Manage categories here.",
    },

    {
      title: "Sliders",
      link: "/admin/sliders",
      text: "Manage sliders here.",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-serif text-slate-800 mb-4">
        Добро пожаловать в админ панель Kas Auto 
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {dashboardItems.map((item) => (
          <DashboardCard
            key={item.link}
            title={item.title}
            link={item.link}
            text={item.text}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
