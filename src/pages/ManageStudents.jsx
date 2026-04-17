import React, { useContext, useRef, useState } from 'react';
import Papa from 'papaparse';
import { TestContext } from '../context/TestContext';

function ManageStudents() {
  const { students, setStudents, marks, setMarks } = useContext(TestContext);
  const fileInputRef = useRef(null);
  
  const [successMsg, setSuccessMsg] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentData, setNewStudentData] = useState({ id: '', name: '', batch: '', section: '' });
  
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ id: '', name: '', batch: '', section: '' });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        if (results.data && results.data.length > 0) {
           const newStudents = results.data.map((row, index) => ({
             id: row.id || row.ID || `S${index+1}_csv`,
             name: row.name || row.Name || `Student ${index+1}`,
             batch: row.batch || row.Batch || '2024',
             section: row.section || row.Section || 'A'
           }));
           setStudents(newStudents);
           setSuccessMsg(`Imported ${newStudents.length} students successfully.`);
           setTimeout(() => setSuccessMsg(""), 3000);
        } else {
           alert("CSV is empty or invalid format. Please include at least 'id' and 'name' columns.");
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      error: function() {
        alert("Failed to parse CSV file.");
      }
    });
  };

  const handleAddStudent = () => {
    if (!newStudentData.id || !newStudentData.name) {
      alert("Please provide both ID and Name.");
      return;
    }
    if (students.some(s => s.id === newStudentData.id)) {
      alert("Student ID already exists.");
      return;
    }
    setStudents([...students, newStudentData]);
    setShowAddModal(false);
    setNewStudentData({ id: '', name: '', batch: '', section: '' });
    setSuccessMsg("Student added successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDelete = (studentId) => {
    if (window.confirm("Are you sure you want to delete this student? Their entered marks will be permanently removed.")) {
      setStudents(students.filter(s => s.id !== studentId));
      
      // Clean up marks payload to avoid ghost data
      const updatedMarks = { ...marks };
      delete updatedMarks[studentId];
      setMarks(updatedMarks);

      setSuccessMsg("Student deleted gracefully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const startEdit = (student) => {
    setEditingId(student.id);
    setEditData({ id: student.id, name: student.name, batch: student.batch || '', section: student.section || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = () => {
    if (!editData.id || !editData.name) {
      alert("ID and Name fields cannot be empty.");
      return;
    }
    if (editData.id !== editingId && students.some(s => s.id === editData.id)) {
      alert("This ID is already taken by another student.");
      return;
    }

    setStudents(students.map(s => {
      if (s.id === editingId) {
        return { ...s, id: editData.id, name: editData.name, batch: editData.batch, section: editData.section };
      }
      return s;
    }));

    // If ID changed, migrate marks to new ID
    if (editData.id !== editingId && marks[editingId]) {
      const updatedMarks = { ...marks };
      updatedMarks[editData.id] = updatedMarks[editingId];
      delete updatedMarks[editingId];
      setMarks(updatedMarks);
    }

    setEditingId(null);
    setSuccessMsg("Student updated successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="panel" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="page-header flex justify-between items-center" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-title">Manage Students</h1>
          <p className="page-subtitle">Add, edit, or import class roster</p>
        </div>
        <div className="flex gap-4">
           {successMsg && (
             <div className="badge badge-green flex items-center">{successMsg}</div>
           )}
           <input 
             type="file" 
             accept=".csv" 
             style={{ display: 'none' }} 
             ref={fileInputRef}
             onChange={handleFileUpload}
           />
           <button 
             className="btn btn-primary" 
             onClick={() => {
                setNewStudentData({ id: `S${students.length + 1}`, name: '', batch: '', section: '' });
                setShowAddModal(true);
             }}
           >
             + Add Student
           </button>
           <button 
             className="btn btn-secondary" 
             onClick={() => fileInputRef.current && fileInputRef.current.click()}
           >
             Import CSV
           </button>
        </div>
      </div>

      <div className="table-container mt-6">
        {students.length === 0 ? (
           <div className="empty-state">No students found. Add a student or import a CSV.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Batch</th>
                <th>Section</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  {editingId === student.id ? (
                    <>
                      <td>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={editData.id} 
                          onChange={(e) => setEditData({...editData, id: e.target.value})} 
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={editData.name} 
                          onChange={(e) => setEditData({...editData, name: e.target.value})} 
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={editData.batch} 
                          onChange={(e) => setEditData({...editData, batch: e.target.value})} 
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={editData.section} 
                          onChange={(e) => setEditData({...editData, section: e.target.value})} 
                        />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary btn-small" onClick={cancelEdit}>Cancel</button>
                            <button className="btn btn-primary btn-small" onClick={saveEdit}>Save</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{student.id}</td>
                      <td>{student.name}</td>
                      <td>{student.batch || '-'}</td>
                      <td>{student.section || '-'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary btn-small" onClick={() => startEdit(student)}>Edit</button>
                            <button className="btn btn-small" style={{ backgroundColor: 'transparent', color: 'var(--accent-danger)' }} onClick={() => handleDelete(student.id)}>Delete</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="panel" style={{ width: '400px', backgroundColor: 'var(--bg-panel)' }}>
            <h3 style={{ marginBottom: '16px' }}>Add New Student</h3>
            <div className="form-group">
              <label className="form-label">Student ID / Roll No</label>
              <input type="text" className="form-input" placeholder="e.g. S101" value={newStudentData.id} onChange={e => setNewStudentData({...newStudentData, id: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Student Name</label>
              <input type="text" className="form-input" placeholder="e.g. John Doe" value={newStudentData.name} onChange={e => setNewStudentData({...newStudentData, name: e.target.value})} />
            </div>
            <div className="form-group">
               <label className="form-label">Batch</label>
               <input type="text" className="form-input" placeholder="e.g. 2024" value={newStudentData.batch} onChange={e => setNewStudentData({...newStudentData, batch: e.target.value})} />
            </div>
            <div className="form-group">
               <label className="form-label">Section</label>
               <input type="text" className="form-input" placeholder="e.g. A" value={newStudentData.section} onChange={e => setNewStudentData({...newStudentData, section: e.target.value})} />
            </div>
            <div className="flex gap-4 mt-4" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddStudent}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageStudents;
