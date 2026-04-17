import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TestContext } from '../context/TestContext';
import { fetchAttainmentData } from '../utils/calculations';
import { downloadPDF } from '../utils/export';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

function DetailedReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pastReports, CO_PO_MATRIX } = useContext(TestContext);

  const report = pastReports.find(r => r.id === id);

  const [data, setData] = useState({
    coAttainment: {},
    poAttainment: {},
    confidenceData: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!report) return;
      setLoading(true);
      const { questions, marks, students, testDetails } = report;

      const formattedQuestions = questions.map(q => ({
        id: q.id ?? q.q,
        co: q.co,
        maxMarks: Number(q.max)
      }));

      const formattedMarks = {};
      for (const [studentId, answers] of Object.entries(marks || {})) {
        formattedMarks[studentId] = {};
        for (const [questionId, value] of Object.entries(answers || {})) {
          formattedMarks[studentId][questionId] = Number(value);
        }
      }

      const filteredStudents = (students || []).filter(student => {
        const matchBatch = !testDetails?.batch || student.batch === testDetails.batch;
        const matchSection = !testDetails?.section || student.section === testDetails.section;
        return matchBatch && matchSection;
      });

      const result = await fetchAttainmentData(formattedQuestions, formattedMarks, filteredStudents, CO_PO_MATRIX);
      if (isMounted && result) {
        setData(result);
      }
      if (isMounted) setLoading(false);
    }
    loadData();
    return () => { isMounted = false; };
  }, [report, CO_PO_MATRIX]);

  if (!report) {
    return (
      <div className="card">
        <h2>Report Not Found</h2>
        <button className="btn" onClick={() => navigate('/reports')}>Back to Reports</button>
      </div>
    );
  }

  const { testDetails, date } = report;
  const { coAttainment, poAttainment, confidenceData } = data;

  if (loading) {
    return (
      <div className="detailed-report-page">
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/reports')}>&larr; Back</button>
        </div>
        <div className="analysis-card print-card"><div className="empty-state">Loading calculations from Python Backend... 🚀</div></div>
      </div>
    );
  }

  // Transform data for charts
  const coChartData = Object.keys(coAttainment || {}).map(co => ({
    name: co,
    Attainment: Number(coAttainment[co]?.attainmentPercentage || 0),
    Target: coAttainment[co]?.target || 60
  }));

  const poChartData = Object.keys(poAttainment || {}).map(po => {
    const conf = Number(confidenceData?.[po]?.confidence || 0);
    const att = Number(poAttainment[po]?.attainmentPercentage || 0);
    return {
      subject: po,
      RawAttainment: att,
      FinalScore: att * conf,
      fullMark: 100
    };
  });

  const handleDownloadPDF = () => {
    downloadPDF('printable-report', `Report_${testDetails.subject}_${testDetails.testName}`);
  };

  return (
    <div className="detailed-report-page">
      <div className="header-actions no-print">
        <button className="btn btn-secondary" onClick={() => navigate('/reports')}>&larr; Back</button>
        <button className="btn btn-primary" onClick={handleDownloadPDF}>Download as PDF</button>
      </div>

      <div id="printable-report" className="printable-container" style={{ padding: '20px', background: '#149cc5ff', color: '#333' }}>
        <div className="report-header">
          <h1>Course Attainment Report</h1>
          <div className="meta-info">
            <p><strong>Subject:</strong> {testDetails.subject}</p>
            <p><strong>Test Name:</strong> {testDetails.testName}</p>
            <p><strong>Date:</strong> {new Date(date).toLocaleString()}</p>
          </div>
        </div>

        <div className="analysis-card print-card">
          <h3>1. Course Outcomes (CO) Attainment</h3>
          <div className="flex-row">
            <div className="table-container flex-half">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>CO ID</th>
                    <th>Level (0-3)</th>
                    <th>Attainment %</th>
                    <th>Target %</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(coAttainment || {}).map(co => (
                    <tr key={co}>
                      <td>{co}</td>
                      <td><span className="badge badge-neutral">{coAttainment[co]?.coLevel || 0}</span></td>
                      <td>{coAttainment[co]?.attainmentPercentage || 0}%</td>
                      <td>{coAttainment[co]?.target || 60}%</td>
                      <td>
                        <strong>{coAttainment[co]?.isAchieved ? 'Achieved' : 'Not Achieved'}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="chart-container flex-half">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={coChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="Attainment" fill="#4F46E5" />
                  <Bar dataKey="Target" fill="#9CA3AF" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="analysis-card print-card">
          <h3>2. Program Outcomes (PO) & Confidence</h3>
          <div className="flex-row">
            <div className="table-container flex-half">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>PO ID</th>
                    <th>Level (0-3)</th>
                    <th>Att (%)</th>
                    <th>Conf</th>
                    <th>Eval Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(poAttainment || {}).map(po => {
                    const conf = confidenceData?.[po];
                    const att = poAttainment[po]?.attainmentPercentage || 0;
                    const poLvl = poAttainment[po]?.poLevel || 0;
                    return (
                      <tr key={po}>
                        <td>{po}</td>
                        <td><span className="badge badge-neutral">{poLvl}</span></td>
                        <td>{att}%</td>
                        <td>{conf?.confidence || '0'}</td>
                        <td>{conf?.count || '0'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="chart-container flex-half">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={poChartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Raw Attainment" dataKey="RawAttainment" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.6} />
                  <Radar name="Final Score (Att * Conf)" dataKey="FinalScore" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  <Legend />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="analysis-card print-card">
          <h3>3. Summary Overview</h3>
          <div className="summary-boxes flex-row" style={{ gap: '20px' }}>
            <div className="summary-box" style={{ padding: '15px', background: '#f3f4f6', borderRadius: '8px', flex: 1 }}>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>Average CO Attainment</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{report.summary?.avgCO || 0}%</p>
            </div>
            <div className="summary-box" style={{ padding: '15px', background: '#f3f4f6', borderRadius: '8px', flex: 1 }}>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>Average PO Attainment</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{report.summary?.avgPO || 0}%</p>
            </div>
            <div className="summary-box" style={{ padding: '15px', background: '#f3f4f6', borderRadius: '8px', flex: 1 }}>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>Overall Confidence</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{report.summary?.avgConf || 1}</p>
            </div>
          </div>
          {report.summary?.avgConf < 0.5 && (
            <div style={{ marginTop: '15px', padding: '10px', background: '#180404ff', color: '#b91c1c', borderLeft: '4px solid #b91c1c' }}>
              <strong>Warning:</strong> low confidence in these results due to small sample sizes or high variance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetailedReport;
