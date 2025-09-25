// Navbar.tsx
import React from "react";
import { Menu } from "primereact/menu";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";


type NavbarProps = {
  onThemeChange: (theme: string) => void;
  onLanguageChange: (lang: string) => void;
};

export default function Navbar({
  onThemeChange,
  onLanguageChange,
}: NavbarProps) {
  const navigate = useNavigate();
  const menu = React.useRef<Menu>(null);
  const { t } = useTranslation();

  const navItems = [
    { label: t("translation.dashboard"), command: () => navigate("/") },
    {
      label: t("translation.employees"),
      command: () => navigate("/employees"),
    },
    {
      label: t("translation.assignments"),
      command: () => navigate("/assignments"),
    },
    {
      label: t("translation.trainings"),
      command: () => navigate("/trainings"),
    },
  ];

  const settingsItems = [
    {
      label: t("settings"),
      items: [
        { label: "Light", command: () => onThemeChange("light") },
        { label: "Dark", command: () => onThemeChange("dark") },
      ],
    },
    {
      label: t("language"),
      items: [
        { label: "TR", command: () => onLanguageChange("tr") },
        { label: "EN", command: () => onLanguageChange("en") },
      ],
    },
  ];
  return (
    <div className="flex justify-center p-3 shadow-md bg-white">
      <div className="flex gap-6 items-center">
        {navItems.map((item) => (
          <Button
            key={item.label}
            label={item.label}
            className="p-button-text"
            onClick={item.command}
          />
        ))}
        {/* Settings Button */}
        <Menu model={settingsItems} popup ref={menu} />
        <Button
          icon="pi pi-cog"
          className="p-button-text"
          onClick={(e) => menu.current?.toggle(e)}
        />
      </div>
    </div>
  );
}
