import { Dropdown } from "primereact/dropdown";
import type { DropdownChangeEvent } from "primereact/dropdown";
import { useSettings } from "../context/SettingsContext";

export default function SettingsPage() {
  const { theme, setTheme, language, setLanguage } = useSettings();

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Settings</h2>
      <div className="flex gap-4">
        <Dropdown
          value={theme}
          options={[
            { label: "Light", value: "light" },
            { label: "Dark", value: "dark" },
          ]}
          onChange={(e: DropdownChangeEvent) => {
            console.log("Settings changed:", e.value); // 👈 buraya bak
            setTheme(e.value);
          }}
        />

        <Dropdown
          value={language}
          options={[
            { label: "Türkçe", value: "tr" },
            { label: "English", value: "en" },
          ]}
          onChange={(e: DropdownChangeEvent) => {
            console.log("Settings changed:", e.value); // 👈 buraya bak
            setLanguage(e.value);
          }}
        />
      </div>
    </div>
  );
}
