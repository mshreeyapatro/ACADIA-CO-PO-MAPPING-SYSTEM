import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TestContext } from '../context/TestContext';

function StudentMarks() {
  const { students, questions, marks, setMarks, testDetails } = useContext(TestContext);
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState("");

  const filteredStudents = students.filter(student => {
     const matchBatch = !testDetails.batch || student.batch === testDetails.batch;
     const matchSection = !testDetails.section || student.section === testDetails.section;
     return matchBatch && matchSection;
  });

  const totalPossible = questions.reduce((acc, q) => acc + (Number(q.max) || 0), 0);

  const handleMarkChange = (studentId, questionId, value) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [questionId]: value
      }
    }));
  };

  const getStudentTotal = (studentId) => {
    const studentMarks = marks[studentId] || {};
    return Object.values(studentMarks).reduce((acc, val) => {
       const num = Number(val);
       return acc + (isNaN(num) || val === '' ? 0 : num);
    }, 0);
  };

  const handleKeyDown = (e, sIndex, qIndex) => {
    let nextS = sIndex;
    let nextQ = qIndex;
    
    if (e.key === 'ArrowUp') {
       nextS = sIndex - 1;
       e.preventDefault();
    } else if (e.key === 'ArrowDown' || (e.key === 'Enter' && !e.shiftKey)) {
       nextS = sIndex + 1;
       e.preventDefault();
    } else if (e.key === 'Enter' && e.shiftKey) {
       nextS = sIndex - 1;
       e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
       nextQ = qIndex - 1;
    } else if (e.key === 'ArrowRight') {
       nextQ = qIndex + 1;
    } else {
       return;
    }

    const nextInput = document.getElementById(`input-${nextS}-${nextQ}`);
    if (nextInput) {
       nextInput.focus();
       nextInput.select();
    }
  };

  const isMarkInvalid = (val, max) => {
    if (val === undefined || val === '') return false;
    const num = Number(val);
    return isNaN(num) || num < 0 || num > Number(max);
  };

  const handleSubmit = async () => {
     let allValid = true;
     
     filteredStudents.forEach(s => {
        questions.forEach(q => {
           const val = (marks[s.id] || {})[q.q];
           if (isMarkInvalid(val, q.max)) {
              allValid = false;
           }
        });
     });

     if (!allValid) {
        alert("Some marks are invalid (either negative or exceeding max marks). Please fix the highlighted fields before submitting.");
        return;
     }

     if (window.confirm("Are you sure you want to finalize and submit marks?")) {
        // Format questions and marks for payload
        const formattedQuestions = questions.map(q => ({
          id: q.id ?? q.q,         // Use q.id if present, else q.q
          co: q.co,
          maxMarks: Number(q.max)  // Ensure this is a number
        }));

        const formattedMarks = {};
        for (const [studentId, answers] of Object.entries(marks)) {
          formattedMarks[studentId] = {};
          for (const [questionId, value] of Object.entries(answers)) {
            formattedMarks[studentId][questionId] = Number(value); // Ensure number
          }
        }

        // Defensive: Ensure CO_PO_MATRIX exists
        const matrix = typeof CO_PO_MATRIX !== "undefined" ? CO_PO_MATRIX : {};

        // Build payload
        const payload = {
          questions: formattedQuestions,
          marks: formattedMarks,
          students,
          matrix
        };

        // Send payload to /api/calculate
        await fetch('/api/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        setSuccessMsg("Marks submitted successfully! Data saved.");
        setTimeout(() => setSuccessMsg(""), 3000);
     }
  };

  const handleSaveDraft = () => {
     setSuccessMsg("Draft saved locally under 'mems_marks'.");
     setTimeout(() => setSuccessMsg(""), 3000);
  };

  if (!testDetails.testName || questions.length === 0) {
      return (
        <div className="panel" style={{ textAlign: 'center', padding: '60px' }}>
            <h2 style={{ marginBottom: '16px' }}>No Test Defined</h2>
            <p className="text-secondary" style={{ marginBottom: '24px' }}>Please create a test and add questions first.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Go to Create Test</button>
        </div>
      );
  }

  return (
    <div className="panel" style={{ width: '100%' }}>
      <div className="page-header flex justify-between items-center" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-title">Student Marks Entry</h1>
          <p className="page-subtitle">
            {testDetails.testName} - {testDetails.subject} 
            {(testDetails.batch || testDetails.section) ? ` | Target: Batch ${testDetails.batch || 'Any'}, Section ${testDetails.section || 'Any'}` : ''}
          </p>
        </div>
        <div className="flex gap-4">
           {successMsg && (
             <div className="badge badge-green flex items-center">{successMsg}</div>
           )}
           <button 
             className="btn btn-secondary" 
             onClick={() => navigate('/manage-students')}
           >
             Manage Students
           </button>
        </div>
      </div>

      <div className="table-container mt-6" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {filteredStudents.length === 0 ? (
           <div className="empty-state">No relevant students found for this Batch/Section. Head to 'Manage Students' to enroll them.</div>
        ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ minWidth: '150px', position: 'sticky', left: 0, zIndex: 6 }}>Student Name</th>
              {questions.map((q, i) => (
                <th key={i} style={{ textAlign: 'center', minWidth: '80px' }}>
                  Q{q.q} <br/>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'normal', opacity: 0.8 }}>(Max: {q.max})</span>
                </th>
              ))}
              <th style={{ textAlign: 'center', minWidth: '100px' }}>
                Total <br/>
                <span style={{ fontSize: '0.75rem', fontWeight: 'normal', opacity: 0.8 }}>(/{totalPossible})</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, sIndex) => {
              const studentTotal = getStudentTotal(student.id);
              return (
                <tr key={student.id}>
                  <td style={{ position: 'sticky', left: 0, background: 'var(--bg-panel)', zIndex: 4, fontWeight: 500, borderRight: '1px solid var(--border-color)' }}>
                    {student.name}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.id}</div>
                  </td>
                  {questions.map((q, qIndex) => {
                    const markValue = (marks[student.id] || {})[q.q] ?? '';
                    const invalid = isMarkInvalid(markValue, q.max);
                    
                    return (
                      <td key={qIndex} style={{ padding: '8px' }}>
                        <input
                          id={`input-${sIndex}-${qIndex}`}
                          type="number"
                          className={`table-input ${invalid ? 'invalid' : ''}`}
                          value={markValue}
                          onChange={(e) => handleMarkChange(student.id, q.q, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, sIndex, qIndex)}
                          placeholder="-"
                          min="0"
                          max={q.max}
                          step="0.5"
                        />
                      </td>
                    );
                  })}
                  <td style={{ textAlign: 'center', fontWeight: 'bold', color: studentTotal > 0 ? 'var(--accent-success)' : 'inherit' }}>
                    {studentTotal}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        )}
      </div>

      <div className="actions-footer">
        <button className="btn btn-secondary" onClick={handleSaveDraft}>
          Save as Draft
        </button>
        <button className="btn btn-primary" onClick={handleSubmit}>
          Submit Marks
        </button>
      </div>
      
      <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>
         💡 Tip: Use arrow keys or Enter to navigate the grid quickly.
      </div>
    </div>
  );
}

export default StudentMarks;
