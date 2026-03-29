import { Navigate, Route, Routes } from 'react-router-dom';
import RequireRole from './components/RequireRole';
import ToastStack from './components/ToastStack';
import { AuthProvider } from './context/AuthContext';
import { LiveProvider } from './context/LiveContext';
import AdminDashboard from './pages/admin/AdminDashboard';
import BusinessDashboard from './pages/business/BusinessDashboard';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterBusinessPage from './pages/RegisterBusinessPage';
import RegisterCustomerPage from './pages/RegisterCustomerPage';

export default function App() {
  return (
    <AuthProvider>
      <LiveProvider>
        <div className="ui-app-shell">
          <ToastStack />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register/customer" element={<RegisterCustomerPage />} />
            <Route path="/register/business" element={<RegisterBusinessPage />} />

            <Route
              path="/admin"
              element={
                <RequireRole role="Admin">
                  <AdminDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/business"
              element={
                <RequireRole role="Business">
                  <BusinessDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/customer"
              element={
                <RequireRole role="Customer">
                  <CustomerDashboard />
                </RequireRole>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </LiveProvider>
    </AuthProvider>
  );
}
