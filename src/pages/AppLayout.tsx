import React from "react";
import logo from "/logo.png";

type AppLayoutProps = {
  children: React.ReactNode;
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sabit, transparan logo */}
      <img
        src={logo}
        alt="logo"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80 pointer-events-none z-0 w-72 h-72"
      />

      {/* Ana içerik */}
      <div className="relative z-10">{children}</div>
      <h2
        style={{
          textAlign: "center",
          marginTop: "180px",
          color: "#2E9FC9", // Buradaki değeri isteğinize göre artırabilirsiniz
        }}
      >
        Mini Admin App
      </h2>
    </div>
  );
};

export default AppLayout;
