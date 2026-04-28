import React from 'react';
import { useParams } from 'react-router-dom';
import Quiz100 from './Quiz100';
import quizData from '../data/quizData';

const QUIZ_TITLES = {
  'reproductive-system':  'מערכת המין',
  'infectious-diseases':  'מחלות מדבקות וספירוצרקה לופי',
  'fitness':              'כושר גופני',
  'poisoning':            'הרעלות',
  'gdv':                  'היפוך קיבה',
  'physical-exam':        'בדיקה פיסיקלית ועזרה ראשונה',
  'heat-load':            'עומס חום',
};

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

  const quizTitle = QUIZ_TITLES[quizId] ?? 'בוחן הכשרה';

  return <Quiz100 questions={questions} quizTitle={quizTitle} />;
}
