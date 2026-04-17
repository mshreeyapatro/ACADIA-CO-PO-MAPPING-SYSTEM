export const TARGET_PERCENTAGE = 60;
export const ATTAINMENT_THRESHOLD = 60;

export async function fetchAttainmentData(questions, marks, students, matrix) {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const response = await fetch(`${API_URL}/api/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ questions, marks, students, matrix })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch calculation data from backend:", error);
    return null;
  }
}
