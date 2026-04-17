import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TestContext } from '../context/TestContext';
import { downloadCSV } from '../utils/export';

function ReportsDashboard() {
  const { pastReports } = useContext(TestContext);
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredReports = pastReports.filter(r => 
    r.testDetails.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.testDetails.testName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadCSV = () => {
    if (filteredReports.length === 0) return;
    const flatData = filteredReports.map(r => ({
      TestName: r.testDetails.testName,
      Subject: r.testDetails.subject,
      Date: new Date(r.date).toLocaleDateString(),
      AvgCO: r.summary?.avgCO || 0,
      AvgPO: r.summary?.avgPO || 0,
      AvgConfidence: r.summary?.avgConf || 0
    }));
    downloadCSV(flatData, 'Past_Reports_Summary');
  };

  return (
    <div className="reports-dashboard">
      <div className="header-actions">
        <h2>Past Test Reports</h2>
        <button className="btn btn-secondary" onClick={handleDownloadCSV}>Export to CSV</button>
      </div>

      <div className="card">
        <div className="filters">
          <input 
            type="text" 
            placeholder="Search by subject or test name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
          />
        </div>

        {filteredReports.length === 0 ? (
          <div className="empty-state">No reports found. Save a test to see it here.</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Test Name</th>
                  <th>Subject</th>
                  <th>Avg CO Attainment</th>
                  <th>Avg PO Attainment</th>
                  <th>Confidence Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map(report => (
                  <tr key={report.id}>
                    <td>{new Date(report.date).toLocaleDateString()}</td>
                    <td>{report.testDetails.testName}</td>
                    <td>{report.testDetails.subject}</td>
                    <td>{report.summary?.avgCO || '0'}%</td>
                    <td>{report.summary?.avgPO || '0'}%</td>
                    <td>
                      <span className={`badge ${(report.summary?.avgConf || 0) < 0.5 ? 'badge-danger' : 'badge-success'}`}>
                        {report.summary?.avgConf || '0'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-small" onClick={() => navigate(`/reports/${report.id}`)}>
                        View Detailed
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportsDashboard;
