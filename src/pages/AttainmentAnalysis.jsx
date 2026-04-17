import React, { useContext, useEffect, useState } from 'react';
import { TestContext } from '../context/TestContext';
import { fetchAttainmentData } from '../utils/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

function AttainmentAnalysis() {
  const { questions, marks, students, CO_PO_MATRIX, saveCurrentTest, testDetails } = useContext(TestContext);

  const [data, setData] = useState({
    coAttainment: {},
    poAttainment: {},
    confidenceData: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);

      // Fix payload mismatch: Format questions into expected backend model structure
      const formattedQuestions = questions.map(q => ({
        id: q.id ?? q.q,
        co: q.co,
        maxMarks: Number(q.max)
      }));

      // Ensure marks are passed strictly as numbers per backend typing
      const formattedMarks = {};
      for (const [studentId, answers] of Object.entries(marks)) {
        formattedMarks[studentId] = {};
        for (const [questionId, value] of Object.entries(answers)) {
          formattedMarks[studentId][questionId] = Number(value);
        }
      }

      const filteredStudents = students.filter(student => {
        const matchBatch = !testDetails?.batch || student.batch === testDetails.batch;
        const matchSection = !testDetails?.section || student.section === testDetails.section;
        return matchBatch && matchSection;
      });

      const result = await fetchAttainmentData(formattedQuestions, formattedMarks, filteredStudents, CO_PO_MATRIX);
      if (isMounted && result) {
        setData(prev => ({ ...prev, ...result }));
      }
      if (isMounted) setLoading(false);
    }
    loadData();
    return () => { isMounted = false; };
  }, [questions, marks, students, CO_PO_MATRIX]);

  const { coAttainment, poAttainment, confidenceData } = data;

  if (loading) {
    return (
      <div className="analysis-page">
        <div className="header-actions"><h2>Attainment Analysis</h2></div>
        <div className="analysis-card"><div className="empty-state">Communicating with Backend... 🚀</div></div>
      </div>
    );
  }

  // Transform data for charts
  const coChartData = Object.keys(coAttainment).map(co => ({
    name: co,
    Attainment: Number(coAttainment[co].attainmentPercentage),
    Target: coAttainment[co].target
  }));

  const poChartData = Object.keys(poAttainment || {}).map(po => {
    const safeConfData = confidenceData || {};
    const conf = Number(safeConfData[po]?.confidence || 0);
    const att = Number(poAttainment[po]?.attainmentPercentage || 0);
    return {
      subject: po,
      RawAttainment: att,
      FinalScore: att * conf,
      fullMark: 100
    };
  });

  const handleSaveReport = () => {
    const safeConfData = confidenceData || {};
    const summary = {
      avgCO: coChartData.length > 0 ? (coChartData.reduce((a, b) => a + b.Attainment, 0) / coChartData.length).toFixed(2) : 0,
      avgPO: poChartData.length > 0 ? (poChartData.reduce((a, b) => a + b.RawAttainment, 0) / poChartData.length).toFixed(2) : 0,
      avgConf: Math.round((Object.values(safeConfData).reduce((a, b) => a + Number(b.confidence || 0), 0) / 12) * 100) / 100
    };
    saveCurrentTest(summary);
    alert('Report Saved to History successfully!');
  };

  return (
    <div className="analysis-page">
      <div className="header-actions">
        <h2>Attainment Analysis</h2>
        <button className="btn btn-primary" onClick={handleSaveReport}>Save Test as Report</button>
      </div>

      <div className="analysis-card">
        <h3>1. CO Attainment Section</h3>
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
                {Object.keys(coAttainment).map(co => (
                  <tr key={co}>
                    <td>{co}</td>
                    <td><span className="badge badge-neutral">{coAttainment[co].coLevel}</span></td>
                    <td>{coAttainment[co].attainmentPercentage}%</td>
                    <td>{coAttainment[co].target}%</td>
                    <td>
                      <span className={`badge ${coAttainment[co].isAchieved ? 'badge-success' : 'badge-danger'}`}>
                        {coAttainment[co].isAchieved ? 'Achieved' : 'Not Achieved'}
                      </span>
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

      <div className="analysis-card">
        <h3>2. PO Attainment & Confidence Selection</h3>
        <div className="flex-row">
          <div className="table-container flex-half">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PO ID</th>
                  <th>Level (0-3)</th>
                  <th>Attainment (%)</th>
                  <th>Confidence</th>
                  <th>Eval. Count</th>
                  <th>Indicator</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(poAttainment || {}).map(po => {
                  const safeConfData = confidenceData || {};
                  const conf = safeConfData[po];
                  const att = poAttainment[po]?.attainmentPercentage || '0';
                  const poLvl = poAttainment[po]?.poLevel || '0';
                  const isLowConf = conf && Number(conf.confidence) < 0.5;
                  return (
                    <tr key={po} className={isLowConf ? 'bg-warning-light' : ''}>
                      <td>{po}</td>
                      <td><span className="badge badge-neutral">{poLvl}</span></td>
                      <td>{att}%</td>
                      <td>{conf?.confidence || '0'}</td>
                      <td>{conf?.count || '0'}</td>
                      <td>
                        <span className={`badge ${isLowConf ? 'badge-warning' : 'badge-neutral'}`}>
                          {conf?.indicator || 'N/A'}
                        </span>
                      </td>
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

    </div>
  );
}

export default AttainmentAnalysis;
