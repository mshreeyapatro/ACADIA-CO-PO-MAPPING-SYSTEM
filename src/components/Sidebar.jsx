import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Sidebar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div>
        <h2>Acadia</h2>
        {user && (
          <div style={{ padding: '0 24px', marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <div>Welcome, {user?.name?.split(' ')[0]}</div>
            <div style={{ textTransform: 'capitalize', fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>{user.role} Account</div>
          </div>
        )}
      </div>
      <div className="nav-links" style={{ flexGrow: 1 }}>
        <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Create Test
        </NavLink>
        <NavLink to="/add-questions" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Add Questions
        </NavLink>
        <NavLink to="/manage-students" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Manage Students
        </NavLink>
        <NavLink to="/student-marks" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Enter Marks
        </NavLink>
        <NavLink to="/co-mapping" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          View Mapping
        </NavLink>
        <NavLink to="/analysis" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Attainment Analysis
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Past Reports
        </NavLink>
      </div>

      <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)' }}>
        <button
          className="btn btn-secondary"
          style={{ width: '100%', borderColor: 'transparent', textAlign: 'left', padding: '10px' }}
          onClick={logout}
        >
          ⎋ Sign Out
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
