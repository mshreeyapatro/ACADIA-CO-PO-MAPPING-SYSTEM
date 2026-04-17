import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('faculty');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    const result = await register(name, email, password, role);
    setLoading(false);
    
    if (result.success) {
      setSuccess('Account registered successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-body)' }}>
      <div className="panel" style={{ width: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2>Create Account</h2>
          <p className="text-secondary">Join the CO-PO Attainment System</p>
        </div>
        
        {error && <div className="badge badge-danger" style={{ display: 'block', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}
        {success && <div className="badge badge-success" style={{ display: 'block', marginBottom: '20px', textAlign: 'center' }}>{success}</div>}
        
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Full Name</label>
            <input 
              type="text" 
              className="table-input" 
              style={{ width: '100%', padding: '10px' }}
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Email Address</label>
            <input 
              type="email" 
              className="table-input" 
              style={{ width: '100%', padding: '10px' }}
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Password</label>
            <input 
              type="password" 
              className="table-input" 
              style={{ width: '100%', padding: '10px' }}
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              minLength={6}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>Account Role</label>
            <select 
              className="table-input" 
              style={{ width: '100%', padding: '10px' }}
              value={role} 
              onChange={e => setRole(e.target.value)}
            >
              <option value="faculty">Faculty / Instructor</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', padding: '12px' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
          <p>Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 'bold' }}>Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
