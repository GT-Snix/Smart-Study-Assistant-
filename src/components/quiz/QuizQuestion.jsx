import React from 'react';
import { motion } from 'framer-motion';

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

const QuizQuestion = ({ question, onAnswer, answered, mode }) => {
  const selected = answered?.selected;
  const correct = answered?.correct;
  const correctKey = question?.answer;

  return (
    <div className="space-y-5">
      <p className="text-lg font-medium text-white leading-relaxed">{question?.q}</p>
      <div className="grid gap-3">
        {question?.options?.map((opt, i) => {
          const key = OPTION_KEYS[i];
          const isSelected = selected === key;
          const isCorrect = key === correctKey;

          let style = 'bg-surface2 border-border text-gray-300 hover:border-accent/50 hover:text-white';
          if (answered) {
            if (isCorrect) style = 'bg-success/10 border-success text-success';
            else if (isSelected && !correct) style = 'bg-danger/10 border-danger text-danger';
            else style = 'bg-surface2 border-border text-gray-500 opacity-50';
          }

          return (
            <motion.button
              key={key}
              disabled={!!answered}
              onClick={() => !answered && onAnswer(key)}
              whileHover={!answered ? { scale: 1.01 } : {}}
              whileTap={!answered ? { scale: 0.99 } : {}}
              animate={isSelected && !correct && answered ? { x: [-4, 4, -4, 4, 0] } : {}}
              transition={{ duration: 0.3 }}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-xl border text-left text-sm font-medium transition-all ${style}`}
            >
              <span className="w-7 h-7 rounded-lg border border-current flex items-center justify-center text-xs font-bold shrink-0">
                {key}
              </span>
              {opt}
            </motion.button>
          );
        })}
      </div>
      {answered && question?.explanation && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue/5 border border-blue/20 rounded-xl text-sm text-gray-300"
        >
          <span className="text-blue font-semibold">Explanation: </span>{question.explanation}
        </motion.div>
      )}
    </div>
  );
};

export default QuizQuestion;
