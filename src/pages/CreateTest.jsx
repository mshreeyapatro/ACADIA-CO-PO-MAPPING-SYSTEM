import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TestContext } from '../context/TestContext';

function CreateTest() {
  const { testDetails, setTestDetails, questions, setQuestions } = useContext(TestContext);
  const navigate = useNavigate();

  const totalMarks = questions.reduce((acc, q) => acc + (Number(q.max) || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!testDetails.testName || !testDetails.subject || !testDetails.numQuestions || testDetails.numQuestions <= 0) {
      alert("Please fill all fields with valid data.");
      return;
    }

    let newQuestions = [...questions];
    if (newQuestions.length !== testDetails.numQuestions) {
      newQuestions = Array.from({ length: testDetails.numQuestions }, (_, i) => {
        const existing = questions[i];
        return existing || { q: i + 1, max: '', co: 'CO1' };
      });
      setQuestions(newQuestions);

      // Optionally we should clear marks that might be for out-of-bounds questions
      // but for simplicity we keep them or let the AddQuestions handle it.
    }

    navigate('/add-questions');
  };

  return (
    <div className="panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Create Test</h1>
        <p className="page-subtitle">Initialize a new evaluation test</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col mt-6">
        <div className="form-group">
          <label className="form-label">Test Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Midterm Examination"
            value={testDetails.testName}
            onChange={(e) => setTestDetails({ ...testDetails, testName: e.target.value })}
          />
        </div>

        <div className="flex gap-4">
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Subject</label>
            <select
              className="form-select"
              value={testDetails.subject}
              onChange={(e) => setTestDetails({ ...testDetails, subject: e.target.value })}
            >
              <option value="">Select a subject...</option>
              <option value="AIML">AIML</option>
              <option value="Computer Networks">Computer Networks</option>
              <option value="Data Structures">Data Structures</option>
              <option value="Operating Systems">Operating Systems</option>
              <option value="Database Systems">Database Systems</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Batch</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 2024"
              value={testDetails.batch || ''}
              onChange={(e) => setTestDetails({ ...testDetails, batch: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Section</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. A"
              value={testDetails.section || ''}
              onChange={(e) => setTestDetails({ ...testDetails, section: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Number of Questions</label>
            <input
              type="number"
              className="form-input"
              min="1"
              value={testDetails.numQuestions || ''}
              onChange={(e) => setTestDetails({ ...testDetails, numQuestions: parseInt(e.target.value, 10) })}
            />
          </div>
        </div>

        <div className="form-group mt-4">
          <label className="form-label">Total Marks (Auto-calculated from questions)</label>
          <div>
            <span className="total-pill">{totalMarks} Marks</span>
          </div>
        </div>

        <div className="actions-footer">
          <button type="submit" className="btn btn-primary">
            Continue to Questions
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTest;
