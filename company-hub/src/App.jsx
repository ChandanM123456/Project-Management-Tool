import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import CompanyRegister from "./pages/CompanyRegister.jsx";
import CompanyLogin from "./pages/CompanyLogin.jsx";
import SelectRole from "./pages/SelectRole.jsx";
import ManagerLogin from "./pages/ManagerLogin.jsx";
import ManagerRegister from "./pages/ManagerRegister.jsx";
import EmployeeLogin from "./pages/EmployeeLogin.jsx";
import EmployeeRegister from "./pages/EmployeeRegister.jsx";
import ShareForm from "./pages/ShareForm.jsx";
import SharedEmployeeForm from "./pages/SharedEmployeeForm.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import EmployeeDashboard from "./pages/EmployeeDashboard.jsx";
import Employees from "./pages/Employees.jsx";
import Projects from "./pages/Projects.jsx";
import Tasks from "./pages/Tasks.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";
import OnboardingForm from "./pages/OnboardingForm.jsx";
import OnboardingSuccess from "./pages/OnboardingSuccess.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

export default function App() {
  const ProtectedRoute = ({ children, requiredRole = null }) => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.log("ProtectedRoute: No token, redirecting to /login");
      return <Navigate to="/login" replace />;
    }

    // If specific role is required
    if (requiredRole === "manager") {
      const managerId = localStorage.getItem("manager_id");
      const companyId = localStorage.getItem("company_id");
      if (!managerId || !companyId) {
        console.log("ProtectedRoute: Missing manager credentials, redirecting to /login");
        return <Navigate to="/login" replace />;
      }
    } else if (requiredRole === "employee") {
      const employeeId = localStorage.getItem("employee_id");
      if (!employeeId) {
        console.log("ProtectedRoute: Missing employee credentials, redirecting to /employee/login");
        return <Navigate to="/employee/login" replace />;
      }
    }

    return children;
  };

  const EmployeeRoute = ({ children }) => {
    return <ProtectedRoute requiredRole="employee">{children}</ProtectedRoute>;
  };

  const ManagerRoute = ({ children }) => {
    return <ProtectedRoute requiredRole="manager">{children}</ProtectedRoute>;
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Default route - redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Public Routes */}
          <Route path="/register" element={<CompanyRegister />} />
          <Route path="/login" element={<CompanyLogin />} />
          <Route path="/choose-role" element={<SelectRole />} />
          <Route path="/manager/login" element={<ManagerLogin />} />
          <Route path="/manager/register" element={<ManagerRegister />} />
          <Route path="/employee/login" element={<EmployeeLogin />} />
          <Route path="/employee/register" element={<EmployeeRegister />} />
          <Route path="/share-invite" element={<ShareForm />} />
          <Route path="/employee/onboard" element={<SharedEmployeeForm />} />
          <Route path="/employee/onboard/:token" element={<SharedEmployeeForm />} />
          
          {/* Onboarding Routes */}
          <Route path="/onboard/:token" element={<OnboardingForm />} />
          <Route path="/onboarding-success" element={<OnboardingSuccess />} />
          
          {/* Manager Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ManagerRoute>
                <ErrorBoundary>
                  <Dashboard />
                </ErrorBoundary>
              </ManagerRoute>
            } 
          />
          <Route 
            path="/employees" 
            element={
              <ManagerRoute>
                <ErrorBoundary>
                  <Employees />
                </ErrorBoundary>
              </ManagerRoute>
            } 
          />
          <Route 
            path="/projects" 
            element={
              <ManagerRoute>
                <ErrorBoundary>
                  <Projects />
                </ErrorBoundary>
              </ManagerRoute>
            } 
          />
          <Route 
            path="/tasks" 
            element={
              <ManagerRoute>
                <ErrorBoundary>
                  <Tasks />
                </ErrorBoundary>
              </ManagerRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ManagerRoute>
                <ErrorBoundary>
                  <Reports />
                </ErrorBoundary>
              </ManagerRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ManagerRoute>
                <ErrorBoundary>
                  <Settings />
                </ErrorBoundary>
              </ManagerRoute>
            } 
          />
          
          {/* Employee Protected Routes */}
          <Route 
            path="/employee/dashboard" 
            element={
              <EmployeeRoute>
                <ErrorBoundary>
                  <EmployeeDashboard />
                </ErrorBoundary>
              </EmployeeRoute>
            } 
          />

          {/* Catch all route - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
