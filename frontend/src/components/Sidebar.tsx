import React from "react";
import { Link } from "react-router-dom";
import Button from "../uikit/Button";

const SIDEBAR_LINKS = [
  { to: "/admin/dashboard", label: "Главная" },
  { to: "/admin/categories", label: "Категории" },
  { to: "/admin/sliders", label: "Слайдеры" },
  { to: "/admin/users", label: "Пользователи" },
  { to: "/admin/products", label: "Продукты" },
  { to: "/admin/brands", label: "Бренды" },
  { to: "/admin/requests", label: "Звявки" },
  { to: "/admin/orders", label: "Заказы" },
];

const linkClasses =
  "block p-2 hover:bg-[#6366F1] hover:text-white rounded transition-colors";

const SidebarLink: React.FC<{ to: string; label: string }> = ({
  to,
  label,
}) => (
  <li className="mb-4">
    <Link to={to} className={linkClasses}>
      {label}
    </Link>
  </li>
);

const Sidebar: React.FC = () => {
  const handleLogout = (): void => {
    localStorage.removeItem("token");
    window.location.href = "/admin/login";
  };

  return (
    <aside className="w-64 bg-[#1E293B] text-white p-4 border-r border-[#E5E7EB] flex flex-col">
      <header className="mb-6">
        <h2 className="text-xl font-serif">SVMotors</h2>
      </header>

      <nav aria-label="Sidebar Navigation" className="flex-1">
        <ul>
          {SIDEBAR_LINKS.map(({ to, label }) => (
            <SidebarLink key={to} to={to} label={label} />
          ))}
        </ul>
      </nav>

      <footer className="pt-4">
        <Button variant="primary" onClick={handleLogout}>
          Выход
        </Button>
      </footer>
    </aside>
  );
};

export default Sidebar;
