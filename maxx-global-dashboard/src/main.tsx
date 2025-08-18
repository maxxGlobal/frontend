import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RegisterForm from "./features/auth/RegisterForm";

import "./assets/css/index.css";
import "./assets/css/fonts.css";
import "./assets/style.css";

const qc = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <RegisterForm />
    </QueryClientProvider>
  </React.StrictMode>
);
