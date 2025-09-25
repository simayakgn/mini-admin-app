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
      label: t("Settings"),
      items: [
        {
          label: "Light",
          icon: "pi pi-sun", // güneş ikonu
          command: () => onThemeChange("light"),
        },
        {
          label: "Dark",
          icon: "pi pi-moon", // ay ikonu
          command: () => onThemeChange("dark"),
        },
      ],
    },
    {
      label: t("Language"),
      items: [
        { label: "TR", command: () => onLanguageChange("tr") },
        { label: "EN", command: () => onLanguageChange("en") },
      ],
    },
  ];
  return (
    <div className="flex justify-center items-center shadow-md bg-white h-24 px-10">
      <div className="flex gap-10 items-center text-lg">
        {navItems.map((item) => (
          <Button
            key={item.label}
            label={item.label}
            className="p-button-text"
            style={{ fontSize: "24px", height: "80px" }}
            onClick={item.command}
          />
        ))}
        {/* Settings Button */}
        <Menu model={settingsItems} popup ref={menu} />
        <Button
          icon="pi pi-cog custom-gear"
          className="p-button-rounded p-button-text"
          style={{ fontSize: "32px", width: "60px", height: "60px" }}
          onClick={(e) => menu.current?.toggle(e)}
        />
      </div>
    </div>
  );
}
