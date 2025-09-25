import { SettingsProvider } from "./context/SettingsContext";
import { useRef } from "react";
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EmployeesPage from "./pages/Employees";
import TrainingsPage from "./pages/Trainings";
import AssignmentsPage from "./pages/Assignments";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Navbar from "./pages/Navbar";
import { useTranslation } from "react-i18next";
import "./i18n"; // i18n setup'ını import et
import { Button } from "primereact/button";

function App() {
  const toastRef = useRef<Toast>(null);
  const { i18n } = useTranslation();
  const showSuccess = () => {
    toastRef.current?.show({
      severity: "success",
      summary: "Başarılı",
      detail: "İşlem tamamlandı",
    });
  };

  return (
    <SettingsProvider>
      <BrowserRouter>
        <Toast ref={toastRef} />
        <ConfirmDialog />

        {/* Navbar Component */}
        <Navbar
          onThemeChange={(theme) => console.log("Tema değişti:", theme)}
          onLanguageChange={(lang) => i18n.changeLanguage(lang)}
        />

        {/* Örnek: Toast testi için buton */}
        <Button
          label="Show Toast"
          icon="pi pi-check"
          className="p-button-success"
          onClick={showSuccess}
        />

        {/* Sayfa yönlendirmeleri */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/trainings" element={<TrainingsPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;
