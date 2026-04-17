import React, { useContext, useEffect, useState } from 'react';
import { TestContext } from '../context/TestContext';
import { fetchAttainmentData } from '../utils/calculations';

function CoMapping() {
  const { questions, students, marks, testDetails, CO_PO_MATRIX } = useContext(TestContext);
  
  const [data, setData] = useState({ coAttainment: {}, poAttainment: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchMatrixData() {
      const filteredStudents = students.filter(student => {
         const matchBatch = !testDetails.batch || student.batch === testDetails.batch;
         const matchSection = !testDetails.section || student.section === testDetails.section;
         return matchBatch && matchSection;
      });

      if (questions.length === 0) {
         if (isMounted) setLoading(false);
         return;
      }

      setLoading(true);
      
      const formattedQuestions = questions.map(q => ({
        id: q.id ?? q.q,
        co: q.co,
        maxMarks: Number(q.max)
      }));

      const formattedMarks = {};
      for (const [studentId, answers] of Object.entries(marks)) {
        formattedMarks[studentId] = {};
        for (const [questionId, value] of Object.entries(answers)) {
          formattedMarks[studentId][questionId] = Number(value);
        }
      }

      const result = await fetchAttainmentData(formattedQuestions, formattedMarks, filteredStudents, CO_PO_MATRIX);
      if (isMounted && result) {
         setData(result);
      }
      if (isMounted) setLoading(false);
    }
    
    fetchMatrixData();
    return () => { isMounted = false; };
  }, [questions, students, marks, CO_PO_MATRIX, testDetails]);

  if (questions.length === 0) {
      return (
        <div className="panel" style={{ textAlign: 'center', padding: '60px' }}>
            <h2 style={{ marginBottom: '16px' }}>No CO Mappings Available</h2>
            <p className="text-secondary" style={{ marginBottom: '24px' }}>Please configure test questions and mappings first.</p>
        </div>
      );
  }

  return (
    <div className="panel" style={{ width: '100%' }}>
      <div className="page-header">
        <h1 className="page-title">Course Mapping & Matrix Matrix</h1>
        <p className="page-subtitle">Mapping references bridging assignments to respective Course Outcomes</p>
      </div>

      <div className="flex-row mt-6">
        <div className="table-container flex-half" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          <h3 style={{ marginBottom: '12px' }}>Question-wise Assignment</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '33%', position: 'sticky', top: 0, zIndex: 1 }}>Question Number</th>
                <th style={{ width: '33%', position: 'sticky', top: 0, zIndex: 1 }}>CO Level</th>
                <th style={{ width: '34%', position: 'sticky', top: 0, zIndex: 1 }}>Max Marks</th>
              </tr>
            </thead>
            <tbody>
               {questions.map((q, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500, paddingLeft: '24px' }}>Q{q.q}</td>
                    <td>
                      <span className="badge badge-blue" style={{ fontSize: '0.85rem' }}>{q.co}</span>
                    </td>
                    <td>{q.max} marks</td>
                  </tr>
               ))}
            </tbody>
          </table>
        </div>

        <div className="flex-half">
          <h3 style={{ marginBottom: '12px' }}>Attainment Execution Board</h3>
          <div className="table-container" style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
             {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Calculating via Integration Engine... 🚀</div>
             ) : (
                <table className="data-table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th style={{ position: 'sticky', left: 0, background: 'var(--bg-panel)', zIndex: 2 }}>CO</th>
                      {Array.from({length: 12}).map((_, i) => <th key={i} style={{ textAlign: 'center' }}>PO{i+1}</th>)}
                      <th style={{ backgroundColor: 'var(--bg-card)', whiteSpace: 'nowrap' }}>CO Attain</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(CO_PO_MATRIX).map(co => (
                      <tr key={co}>
                        <td style={{ fontWeight: 500, position: 'sticky', left: 0, background: 'var(--bg-panel)', zIndex: 1, borderRight: '1px solid var(--border-color)' }}>{co}</td>
                        {Array.from({length: 12}).map((_, i) => {
                           const weight = CO_PO_MATRIX[co][`PO${i+1}`] || 0;
                           return (
                              <td key={i} style={{ textAlign: 'center', opacity: weight === 0 ? 0.3 : 1 }}>
                                {weight > 0 ? weight : '-'}
                              </td>
                           );
                        })}
                        <td style={{ fontWeight: 'bold', color: 'var(--accent-primary)', textAlign: 'center', backgroundColor: 'rgba(79, 70, 229, 0.05)' }}>
                           {data?.coAttainment?.[co]?.attainmentPercentage || '0'}%
                        </td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: '2px solid var(--border-color)' }}>
                      <td style={{ fontWeight: 'bold', textAlign: 'right', position: 'sticky', left: 0, background: 'var(--bg-panel)', zIndex: 1, borderRight: '1px solid var(--border-color)', fontSize: '0.75rem' }}>PO Attain %</td>
                      {Array.from({length: 12}).map((_, i) => {
                         const rawAttainment = data?.poAttainment?.[`PO${i+1}`]?.attainmentPercentage || '0';
                         return (
                           <td key={i} style={{ fontWeight: 'bold', color: 'var(--accent-success)', textAlign: 'center', backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
                              {rawAttainment}%
                           </td>
                         )
                      })}
                      <td style={{ backgroundColor: 'var(--bg-card)' }}></td>
                    </tr>
                  </tbody>
                </table>
             )}
          </div>
          
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', borderLeft: '4px solid var(--accent-primary)' }}>
             <h4 style={{ marginBottom: '8px', color: 'var(--accent-primary)' }}>Matrix Integration</h4>
             <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
               This unified table crosses the static PO mappings dynamically with the current batch's performance data. Check out your <strong>PO Attain %</strong> bottom row for real-time aggregation!
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoMapping;
