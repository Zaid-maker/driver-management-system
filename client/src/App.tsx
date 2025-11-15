import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DriverList from './pages/DriverList';
import DriverForm from './pages/DriverForm';
import DriverDetail from './pages/DriverDetail';
import CreateDriverAccount from './pages/CreateDriverAccount';
import Calendar from './pages/Calendar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route
              path="calendar"
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="drivers"
              element={
                <ProtectedRoute requireAdmin>
                  <DriverList />
                </ProtectedRoute>
              }
            />
            <Route
              path="drivers/new"
              element={
                <ProtectedRoute requireAdmin>
                  <DriverForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="create-driver-account"
              element={
                <ProtectedRoute requireAdmin>
                  <CreateDriverAccount />
                </ProtectedRoute>
              }
            />
            <Route path="drivers/:id" element={<DriverDetail />} />
            <Route
              path="drivers/:id/edit"
              element={
                <ProtectedRoute requireAdmin>
                  <DriverForm />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
