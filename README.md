# Marks Entry System

## How to Run the Project Locally

This project uses a separated architecture with a **React/Vite Frontend** and a **FastAPI Backend**. You must run **both** of these servers at the same time in two separate terminal windows.

### 1. Start the Backend Server (FastAPI)

Open your first terminal, navigate to the `src/backend` folder, and start the python server:

```powershell
# 1. Navigate to the backend folder
cd src/backend

# 2. Start the FastAPI development server
uvicorn main:app --reload
```
*The backend API will now be running at `http://localhost:8000`*


### 2. Start the Frontend Server (Vite / React)

Open a **new, second terminal** at the root folder of your project (the `marks-entry-system` directory) and run:

```powershell
# 1. Install dependencies (You only need to do this the very first time)
npm install

# 2. Start the Vite development server
npm run dev
```
*The frontend application will be ready! Open your browser and go to `http://localhost:5173`*

---

**Troubleshooting:**
- Ensure you have `python` and `npm` installed on your machine.
- If you see an error that `fastapi` or `uvicorn` is missing, make sure to run `pip install fastapi uvicorn numpy` inside the `src/backend` folder.
