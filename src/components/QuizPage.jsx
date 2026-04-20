import React from 'react';
import { useParams } from 'react-router-dom';
import Quiz100 from './Quiz100';
import quizData from '../data/quizData';

export default function QuizPage() {
  const { quizId } = useParams();
  const questions = quizData[quizId];

  if (!questions) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', fontFamily: 'sans-serif', direction: 'rtl' }}>
        <h2>הבוחן לא נמצא</h2>
        <p>המזהה "{quizId}" אינו קיים במערכת.</p>
      </div>
    );
  }

  return <Quiz100 questions={questions} />;
}
