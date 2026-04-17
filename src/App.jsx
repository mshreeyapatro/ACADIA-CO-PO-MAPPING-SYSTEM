import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import CreateTest from './pages/CreateTest';
import AddQuestions from './pages/AddQuestions';
import StudentMarks from './pages/StudentMarks';
import ManageStudents from './pages/ManageStudents';
import CoMapping from './pages/CoMapping';
import AttainmentAnalysis from './pages/AttainmentAnalysis';
import ReportsDashboard from './pages/ReportsDashboard';
import DetailedReport from './pages/DetailedReport';
import Login from './pages/Login';
import Register from './pages/Register';
import { TestProvider } from './context/TestContext';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Wrapper to handle redirection elegantly
const AppLayout = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  // If not authenticated and we aren't on auth routes, react-router handles this below,
  // but we can conditionally show sidebar
  return (
    <div className="app-container">
      {isAuthenticated && <Sidebar />}
      <main className="main-content" style={{ marginLeft: isAuthenticated ? '50px' : '0' }}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <TestProvider>
          <AppLayout>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><CreateTest /></ProtectedRoute>} />
              <Route path="/add-questions" element={<ProtectedRoute><AddQuestions /></ProtectedRoute>} />
              <Route path="/manage-students" element={<ProtectedRoute><ManageStudents /></ProtectedRoute>} />
              <Route path="/student-marks" element={<ProtectedRoute><StudentMarks /></ProtectedRoute>} />
              <Route path="/co-mapping" element={<ProtectedRoute><CoMapping /></ProtectedRoute>} />
              <Route path="/analysis" element={<ProtectedRoute><AttainmentAnalysis /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><ReportsDashboard /></ProtectedRoute>} />
              <Route path="/reports/:id" element={<ProtectedRoute><DetailedReport /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Login />} />
            </Routes>
          </AppLayout>
        </TestProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
