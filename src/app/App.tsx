import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Appointments } from "./components/Appointments";
import { Patients } from "./components/Patients";
import { Odontogram } from "./components/Odontogram";
import { Budgets } from "./components/Budgets";
import { Toaster } from "sonner";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/appointments"
            element={<Appointments />}
          />
          <Route path="/patients" element={<Patients />} />
          <Route
            path="/patients/:id/odontogram"
            element={<Odontogram />}
          />
          <Route path="/budgets" element={<Budgets />} />
          <Route
            path="/billing"
            element={
              <div className="p-6">
                <h1>Facturación - En desarrollo</h1>
              </div>
            }
          />
          <Route
            path="/settings"
            element={
              <div className="p-6">
                <h1>Configuración - En desarrollo</h1>
              </div>
            }
          />
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;