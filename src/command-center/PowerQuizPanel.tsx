import React, { useState, useEffect } from 'react';
import { DEFAULT_POWER_QUIZ_QUESTIONS, PowerQuizQuestion, SYMBOL_MAP } from '../lib/playys/powerQuiz';

export const PowerQuizPanel: React.FC = () => {
  const [questions, setQuestions] = useState<PowerQuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/power-quiz-questions');
      const data = await res.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        setQuestions(DEFAULT_POWER_QUIZ_QUESTIONS);
      }
    } catch (e) {
      setError((e as Error).message);
      setQuestions(DEFAULT_POWER_QUIZ_QUESTIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleSave = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsSaving(true);
    try {
      const res = await fetch('/api/cc/power-quiz-questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save questions');
      setSuccessMsg('Power Quiz Questions saved successfully!');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset quiz questions to default preset?')) return;
    setError(null);
    setSuccessMsg(null);
    setIsSaving(true);
    try {
      const res = await fetch('/api/cc/power-quiz-questions/reset', {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to reset quiz questions');
      setQuestions(DEFAULT_POWER_QUIZ_QUESTIONS);
      setSuccessMsg('Reset quiz questions to default preset!');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const updateQuestionText = (qIndex: number, text: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qIndex] = { ...next[qIndex], question: text };
      return next;
    });
  };

  const updateSubtitleText = (qIndex: number, text: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qIndex] = { ...next[qIndex], subtitle: text };
      return next;
    });
  };

  const updateOptionLabel = (qIndex: number, optIndex: number, label: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = { ...next[qIndex] };
      const opts = [...q.options];
      opts[optIndex] = { ...opts[optIndex], label };
      q.options = opts;
      next[qIndex] = q;
      return next;
    });
  };

  const updateOptionIcon = (qIndex: number, optIndex: number, icon: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = { ...next[qIndex] };
      const opts = [...q.options];
      opts[optIndex] = { ...opts[optIndex], icon };
      q.options = opts;
      next[qIndex] = q;
      return next;
    });
  };

  const updateSymbolWeight = (qIndex: number, optIndex: number, symbolSlug: string, weight: number) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = { ...next[qIndex] };
      const opts = [...q.options];
      const opt = { ...opts[optIndex] };
      const weights = { ...opt.symbolWeights };
      if (weight > 0) {
        weights[symbolSlug] = weight;
      } else {
        delete weights[symbolSlug];
      }
      opt.symbolWeights = weights;
      opts[optIndex] = opt;
      q.options = opts;
      next[qIndex] = q;
      return next;
    });
  };

  if (loading) return <div className="text-gray-500">Loading quiz questions…</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 p-4 rounded-xl">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">Power quiz</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure the 5 personality quiz questions and attribute symbol scoring rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isSaving ? 'Saving...' : 'Save Questions'}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="py-2 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold text-sm cursor-pointer disabled:opacity-50"
          >
            <span>Reset to Default</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">{error}</div>}
      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">
          {successMsg}
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => (
          <div key={q.id || qIndex} className="bg-white border border-gray-200 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                Question {qIndex + 1} of {questions.length}
              </span>
              <span className="text-xs text-gray-500 font-mono">ID: q_{qIndex + 1}</span>
            </div>

            {/* Question Text & Subtitle Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Question Title</label>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Subtitle / Instruction</label>
                <input
                  type="text"
                  value={q.subtitle || ''}
                  onChange={(e) => updateSubtitleText(qIndex, e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
                />
              </div>
            </div>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Options ({q.options.length})
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((opt, optIndex) => {
                  const letter = String.fromCharCode(65 + optIndex);
                  return (
                    <div
                      key={opt.id || optIndex}
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center justify-center">
                          {letter}
                        </span>
                        <input
                          type="text"
                          value={opt.icon || ''}
                          onChange={(e) => updateOptionIcon(qIndex, optIndex, e.target.value)}
                          placeholder="Icon"
                          className="w-12 text-center bg-gray-50 border border-gray-300 rounded px-2 py-1 text-sm text-gray-900"
                        />
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => updateOptionLabel(qIndex, optIndex, e.target.value)}
                          placeholder="Option Label"
                          className="flex-1 bg-gray-50 border border-gray-300 rounded px-3 py-1 text-sm text-gray-900"
                        />
                      </div>

                      {/* Symbol Weighting Selection */}
                      <div className="space-y-1 text-xs">
                        <div className="text-gray-500 font-semibold">Attribute / Symbol Weights:</div>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {[
                            'shining-star',
                            'puffy-cloud',
                            'fire-spark',
                            'warm-heart',
                            'thunder-zap',
                            'golden-crown',
                            'crescent-moon',
                            'puppy-paw',
                          ].map((slug) => {
                            const currentPts = opt.symbolWeights?.[slug] || 0;
                            const info = SYMBOL_MAP[slug] || { name: slug, icon: '✨' };
                            return (
                              <div
                                key={slug}
                                className="flex items-center justify-between bg-white px-2 py-1 rounded border border-gray-200"
                              >
                                <span className="text-[11px] text-gray-600 truncate">
                                  {info.icon} {info.name}
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  value={currentPts}
                                  onChange={(e) =>
                                    updateSymbolWeight(qIndex, optIndex, slug, parseInt(e.target.value, 10) || 0)
                                  }
                                  className="w-10 text-center bg-gray-50 border border-gray-300 rounded text-xs text-indigo-700 font-semibold"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
