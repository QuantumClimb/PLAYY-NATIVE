import React from 'react';
import { DetailField, DetailsKeyboard } from '../components/DetailsKeyboard';
import { copy } from '../copy';
import type { StepProps } from './types';

/** Name, phone number or email: a big box showing what was typed, a message if it is not good enough, and the keyboard. */
export const DetailsStep: React.FC<StepProps> = ({ flow }) => {
  const { details } = flow;
  const press = (key: string) => {
    flow.touch();
    if (key === 'DONE') return flow.next();
    details.onKey(key);
  };
  return (
    <div className="details-panel">
      <DetailField
        value={details.value}
        placeholder={copy.details.placeholders[details.step]}
        onClear={() => {
          flow.touch();
          details.clear();
        }}
      />
      <div className="details-error" role="alert">
        {details.error}
      </div>
      <DetailsKeyboard key={details.field} layout={details.field} onKey={press} />
    </div>
  );
};
