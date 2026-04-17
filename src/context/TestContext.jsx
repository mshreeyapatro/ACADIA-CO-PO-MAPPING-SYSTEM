/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';

export const TestContext = createContext();

export const CO_PO_MATRIX = {
  CO1: { PO1: 3, PO2: 2, PO3: 1, PO4: 0, PO5: 0, PO6: 0, PO7: 0, PO8: 0, PO9: 0, PO10: 0, PO11: 0, PO12: 1 },
  CO2: { PO1: 2, PO2: 3, PO3: 2, PO4: 1, PO5: 0, PO6: 0, PO7: 0, PO8: 0, PO9: 0, PO10: 0, PO11: 0, PO12: 1 },
  CO3: { PO1: 1, PO2: 2, PO3: 3, PO4: 2, PO5: 1, PO6: 0, PO7: 0, PO8: 0, PO9: 0, PO10: 0, PO11: 0, PO12: 1 },
  CO4: { PO1: 1, PO2: 1, PO3: 2, PO4: 3, PO5: 2, PO6: 1, PO7: 0, PO8: 0, PO9: 0, PO10: 0, PO11: 0, PO12: 1 },
  CO5: { PO1: 0, PO2: 1, PO3: 1, PO4: 2, PO5: 3, PO6: 2, PO7: 1, PO8: 1, PO9: 1, PO10: 1, PO11: 1, PO12: 2 },
  CO6: { PO1: 1, PO2: 2, PO3: 1, PO4: 1, PO5: 2, PO6: 2, PO7: 1, PO8: 0, PO9: 1, PO10: 1, PO11: 1, PO12: 2 }
};

export const TestProvider = ({ children }) => {
  const [testDetails, setTestDetails] = useState({ testName: '', subject: '', numQuestions: 0, batch: '', section: '' });
  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [pastReports, setPastReports] = useState([]);
  const [dbLoaded, setDbLoaded] = useState(false);

  useEffect(() => {
    async function loadBackendData() {
       try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
          const stuRes = await fetch(`${API_URL}/api/students`);
          if(stuRes.ok) {
              const studentsData = await stuRes.json();
              setStudents(studentsData);
          }
          const repRes = await fetch(`${API_URL}/api/reports`);
          if(repRes.ok) {
              const reportsData = await repRes.json();
              setPastReports(reportsData);
          }
       } catch (e) {
          console.error("Backend DB not reachable.", e);
       } finally {
          setDbLoaded(true);
       }
    }
    loadBackendData();
  }, []);

  const syncStudentsToDb = async (newStudents) => {
      try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
          await fetch(`${API_URL}/api/students/sync`, {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify(newStudents)
          });
      } catch (e) {
          console.error("Failed to sync students to backend DB", e);
      }
  };

  const handleSetStudents = (newStudentsOrCallback) => {
      setStudents(prev => {
          const val = typeof newStudentsOrCallback === 'function' ? newStudentsOrCallback(prev) : newStudentsOrCallback;
          syncStudentsToDb(val);
          return val;
      });
  };

  const saveCurrentTest = async (summaryResults) => {
    const newReport = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      testDetails,
      questions,
      students,
      marks,
      summary: summaryResults
    };
    
    // Save to Python DB
    try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        await fetch(`${API_URL}/api/reports`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newReport)
        });
    } catch (e) {
        console.error("Failed to persist report to DB", e);
    }

    setPastReports(prev => [newReport, ...prev]);
  };

  return (
    <TestContext.Provider value={{
      testDetails, setTestDetails,
      questions, setQuestions,
      students, setStudents: handleSetStudents,
      marks, setMarks,
      pastReports,
      saveCurrentTest,
      CO_PO_MATRIX,
      dbLoaded
    }}>
      {children}
    </TestContext.Provider>
  );
};
