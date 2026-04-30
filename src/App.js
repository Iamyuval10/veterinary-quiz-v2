import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import QuizPage from './components/QuizPage';
import DemoQuizPage from './components/DemoQuizPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/quiz/demo-quiz" element={<DemoQuizPage />} />
        <Route path="/quiz/:quizId" element={<QuizPage />} />
        <Route
          path="*"
          element={
            <div style={{ textAlign: 'center', padding: '4rem 2rem', fontFamily: 'sans-serif', direction: 'rtl' }}>
              <h2>דף לא נמצא</h2>
              <p>נא לנווט לכתובת בוחן תקינה, לדוגמה: <code>/quiz/heat-load</code></p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
