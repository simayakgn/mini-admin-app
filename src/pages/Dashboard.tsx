// import { useSettings } from "../context/SettingsContext";
// import { translations } from "../i18n";

// export default function Dashboard() {
//   const { language, theme } = useSettings();

//   return (
//     <div
//       className={`${
//         theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
//       } p-4`}
//     >
//       <h2 className="text-xl">{translations[language].dashboard}</h2>
//     </div>
//   );
// }

import React from "react";
import AppLayout from "../pages/AppLayout";
import { useSettings } from "../context/SettingsContext";
import { useTranslation } from "react-i18next";

const Dashboard: React.FC = () => {
  const { theme } = useSettings();
  const { t } = useTranslation(); // Çeviri hook'u

  return (
    <AppLayout>
      <div
        className={`${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
        } p-4`}
      >
        <h2 className="text-xl">{t("translation.dashboard")}</h2>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
