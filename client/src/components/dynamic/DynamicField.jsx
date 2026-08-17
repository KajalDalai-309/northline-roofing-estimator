import React from 'react';
import NumberField from './NumberField';
import SelectField from './SelectField';

export default function DynamicField({ question, value, onChange, error }) {
  if (!question || !question.active) return null;

  switch (question.type) {
    case 'number':
      return (
        <NumberField
          question={question}
          value={value}
          onChange={onChange}
          error={error}
        />
      );
    case 'select':
      return (
        <SelectField
          question={question}
          value={value}
          onChange={onChange}
          error={error}
        />
      );
    default:
      return (
        <div className="p-4 bg-amber-50 text-amber-800 rounded-lg text-sm">
          Unsupported question type: <code>{question.type}</code>
        </div>
      );
  }
}
