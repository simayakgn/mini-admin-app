import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "primereact/resources/themes/lara-light-blue/theme.css"; // Tema
import "primereact/resources/primereact.min.css"; // PrimeReact core css
import "primeicons/primeicons.css"; // PrimeIcons
import "./i18n";

import "./index.css";
import App from "./App";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
