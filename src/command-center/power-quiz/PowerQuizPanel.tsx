import React from 'react';
import { DEFAULT_POWER_QUIZ_QUESTIONS, PowerQuizQuestion, cleanQuizQuestions } from '../../lib/playys/powerQuiz';
import { CmsPanel, SaveBar } from '../CmsPanel';
import { useCmsSetting } from '../useCmsSetting';
import { QuestionCard } from './QuestionCard';
import { setSymbolWeight, updateOption, updateQuestion } from './quizEdit';

/** Command center: the personality quiz questions, their answers and how each answer scores the powers. */
export const PowerQuizPanel: React.FC = () => {
  const cms = useCmsSetting<PowerQuizQuestion[], { questions: unknown }>({
    url: '/api/power-quiz-questions',
    saveUrl: '/api/cc/power-quiz-questions',
    resetUrl: '/api/cc/power-quiz-questions/reset',
    read: (data) => cleanQuizQuestions(data.questions),
    write: (questions) => ({ questions }),
    defaults: DEFAULT_POWER_QUIZ_QUESTIONS,
    savedNote: 'Power quiz questions saved.',
    resetNote: 'Reset the quiz questions to the default preset.',
    resetQuestion: 'Reset quiz questions to default preset?',
  });
  const questions = cms.value;
  const edit = (change: (current: PowerQuizQuestion[]) => PowerQuizQuestion[]) => cms.setValue(change);

  if (cms.loading) return <div className="text-gray-500">Loading quiz questions…</div>;

  return (
    <CmsPanel
      title="Power quiz"
      description="Configure the personality quiz questions and how each answer scores the powers."
      error={cms.error}
      note={cms.note}
    >
      <SaveBar busy={cms.busy} onSave={cms.save} onReset={cms.reset} saveLabel="Save questions" />
      <div className="space-y-6">
        {questions.map((question, index) => (
          <QuestionCard
            key={question.id || index}
            question={question}
            index={index}
            total={questions.length}
            onText={(patch) => edit((qs) => updateQuestion(qs, index, patch))}
            onLabel={(option, label) => edit((qs) => updateOption(qs, index, option, { label }))}
            onIcon={(option, icon) => edit((qs) => updateOption(qs, index, option, { icon }))}
            onWeight={(option, slug, weight) => edit((qs) => setSymbolWeight(qs, index, option, slug, weight))}
          />
        ))}
      </div>
    </CmsPanel>
  );
};
