import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AccessibilityControls } from './components/accessibility/AccessibilityControls';
import { BoxAssemblyAnimation } from './components/BoxAssemblyAnimation';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardOverviewPage from './pages/DashboardOverviewPage';
import ProductosPage from './pages/ProductosPage';
import VentasPage from './pages/VentasPage';
import MovimientosPage from './pages/MovimientosPage';
import PedidosPage from './pages/PedidosPage';
import EstadisticasPage from './pages/EstadisticasPage';
import UsuariosPage from './pages/UsuariosPage';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <LanguageProvider>
        <ThemeProvider>
          <AccessibilityProvider>
            <AuthProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  <Route
                    path="/app"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<DashboardOverviewPage />} />
                    <Route
                      path="productos"
                      element={
                        <ProtectedRoute requiredModule="productos">
                          <ProductosPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="catalogo"
                      element={
                        <ProtectedRoute requiredModule="productos">
                          <ProductosPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="ventas"
                      element={
                        <ProtectedRoute requiredModule="ventas">
                          <VentasPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="movimientos"
                      element={
                        <ProtectedRoute requiredModule="movimientos">
                          <MovimientosPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="pedidos"
                      element={
                        <ProtectedRoute requiredModule="pedidos">
                          <PedidosPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="estadisticas"
                      element={
                        <ProtectedRoute requiredModule="estadisticas">
                          <EstadisticasPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="usuarios"
                      element={
                        <ProtectedRoute requiredModule="usuarios">
                          <UsuariosPage />
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <BoxAssemblyAnimation />
                <AccessibilityControls />
              </BrowserRouter>
            </AuthProvider>
          </AccessibilityProvider>
        </ThemeProvider>
      </LanguageProvider>
    </MotionConfig>
  );
}
