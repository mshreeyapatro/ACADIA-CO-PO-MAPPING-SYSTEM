import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TestContext } from '../context/TestContext';

function AddQuestions() {
  const { testDetails, setTestDetails, questions, setQuestions } = useContext(TestContext);
  const navigate = useNavigate();

  const totalMarks = questions.reduce((acc, q) => acc + (Number(q.max) || 0), 0);

  const handleQuestionChange = (index, field, value) => {
    const newQs = [...questions];
    newQs[index] = { ...newQs[index], [field]: value };
    setQuestions(newQs);
  };

  const handleAddRow = () => {
    setQuestions([...questions, { q: questions.length + 1, max: '', co: 'CO1' }]);
    setTestDetails({ ...testDetails, numQuestions: questions.length + 1 });
  };

  const handleSave = () => {
    const isValid = questions.every(q => q.max !== '' && Number(q.max) > 0);
    if (!isValid) {
      alert("Please ensure all questions have a valid Max Marks value greater than 0.");
      return;
    }
    // Ensure max is stored as a number before navigating or saving
    const normalizedQuestions = questions.map(q => ({
      ...q,
      max: Number(q.max)
    }));
    setQuestions(normalizedQuestions);
    navigate('/student-marks');
  };

  return (
    <div className="panel" style={{ maxWidth: '900px', margin: '0 auto' }}>
       <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Add Questions</h1>
          <p className="page-subtitle">Define maximum marks and CO mapping for each question</p>
        </div>
        <div className="total-pill">
          Test Total: {totalMarks}
        </div>
      </div>

      <div className="table-container mt-6">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '20%' }}>Question No.</th>
              <th style={{ width: '40%' }}>Max Marks</th>
              <th style={{ width: '40%' }}>CO Level</th>
            </tr>
          </thead>
          <tbody>
            {questions.length === 0 ? (
               <tr>
                 <td colSpan="3" style={{ textAlign: 'center', padding: '32px' }}>
                   No questions defined. Go back and set test details or add a row.
                 </td>
               </tr>
            ) : questions.map((q, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500, paddingLeft: '24px' }}>Q{q.q}</td>
                <td>
                  <input 
                    type="number" 
                    className={`table-input ${q.max === '' || Number(q.max) <= 0 ? 'invalid' : ''}`}
                    min="1"
                    value={q.max}
                    onChange={(e) => handleQuestionChange(i, 'max', e.target.value)}
                    placeholder="Marks"
                  />
                </td>
                <td>
                  <select 
                    className="table-select"
                    value={q.co}
                    onChange={(e) => handleQuestionChange(i, 'co', e.target.value)}
                  >
                    {[1,2,3,4,5,6].map(level => (
                      <option key={level} value={`CO${level}`}>CO{level}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <button type="button" onClick={handleAddRow} className="btn btn-secondary">
          + Add Question Row
        </button>
      </div>

      <div className="actions-footer">
        <button onClick={() => navigate('/')} className="btn btn-secondary">
          Back
        </button>
        <button onClick={handleSave} className="btn btn-primary" disabled={questions.length === 0}>
          Save Questions
        </button>
      </div>
    </div>
  );
}

export default AddQuestions;
