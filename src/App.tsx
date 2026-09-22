import { Navigate, Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import RoleHomeRedirect from "./routes/RoleHomeRedirect";
import LoginPage from "./pages/public/LoginPage";
import LayoutAdmin from "./layouts/Layout";
import PublicRoute from "./routes/PublicRoute";
import { Toaster } from "./components/ui/sonner";
import SpecialitiesPage from "./pages/admin/SpecialitiesPage";
import AnimeLoader from "./components/custom/AnimeLoader";
import DoctorsPage from "./pages/admin/DoctorsPage";
import UsersPage from "./pages/admin/UsersPage";
import PatientsPage from "./pages/admin/PatientsPage";
import AttendedPatientsPage from "./pages/admin/AttendedPatientsPage";
import CreateSchedulesPage from "./pages/admin/CreateSchedulesPage";
import ShedulesPage from "./pages/admin/ShedulesPage";
import MySchedulesPage from "./pages/admin/MySchedulesPage";
import { ADMIN_ROLE, DOCTOR_ROLE, SECRETARY_ROLE } from "./config/roles";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Simular carga inicial de la aplicación
    const loadApp = async () => {
      try {
        // Simular carga de recursos críticos
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsLoading(false);

        // delay para mostrar el contenido suavemente
        setTimeout(() => {
          setShowContent(true);
        }, 100);
      } catch (error) {
        console.error("Error loading app:", error);
        setIsLoading(false);
        setShowContent(true);
      }
    };

    loadApp();
  }, []);

  if (isLoading) {
    return <AnimeLoader />;
  }

  return (
    <>
      <main
        className={`transition-opacity duration-500 w-full h-screen overflow-hidden ${
          showContent ? "opacity-100" : "opacity-0"
        }`}
      >
        <Routes>
          {/* Rutas públicas */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route element={<LayoutAdmin />}>
              {/* Punto de entrada tras el login: redirige según el rol */}
              <Route path="/home" element={<RoleHomeRedirect />} />

              {/* Admin y secretaria: especialidades, doctores, pacientes y creación de agendas */}
              <Route
                element={
                  <RoleRoute allowedRoles={[ADMIN_ROLE, SECRETARY_ROLE]} />
                }
              >
                <Route path="/specialities" element={<SpecialitiesPage />} />
                <Route path="/doctors" element={<DoctorsPage />} />
                <Route path="/patients" element={<PatientsPage />} />
                <Route
                  path="/schedules/create"
                  element={<CreateSchedulesPage />}
                />
              </Route>

              {/* Solo admin: usuarios y listado general de agendas programadas */}
              <Route element={<RoleRoute allowedRoles={[ADMIN_ROLE]} />}>
                <Route path="/users" element={<UsersPage />} />
                <Route path="/schedules" element={<ShedulesPage />} />
              </Route>

              {/* Admin y doctor: sus propias agendas y los pacientes que ha atendido */}
              <Route
                element={
                  <RoleRoute allowedRoles={[ADMIN_ROLE, DOCTOR_ROLE]} />
                }
              >
                <Route
                  path="/patients/attended"
                  element={<AttendedPatientsPage />}
                />
                <Route path="/schedules/mine" element={<MySchedulesPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to={"/login"} replace />} />
        </Routes>
      </main>
      <Toaster position="top-center" closeButton={true} />
    </>
  );
}

export default App;
