import React from 'react';

interface CmsPanelProps {
  title: string;
  description?: string;
  error: string | null;
  note: string | null;
  children: React.ReactNode;
}

/** The frame every command center panel shares: heading, intro text and the error and success messages. */
export const CmsPanel: React.FC<CmsPanelProps> = ({ title, description, error, note, children }) => (
  <div className="space-y-5 max-w-4xl">
    <div>
      <h2 className="text-lg">{title}</h2>
      {description && <p className="text-sm cc-muted">{description}</p>}
    </div>
    {error && <div className="cc-alert cc-alert-error">{error}</div>}
    {note && <div className="cc-alert cc-alert-ok">{note}</div>}
    {children}
  </div>
);

interface SaveBarProps {
  busy: boolean;
  onSave: () => void;
  onReset?: () => void;
  saveLabel?: string;
  /** Disables Save, for example while the form has something invalid in it */
  saveDisabled?: boolean;
}

/** Reset on the left, Save on the right. */
export const SaveBar: React.FC<SaveBarProps> = ({ busy, onSave, onReset, saveLabel = 'Save', saveDisabled }) => (
  <div className="flex flex-wrap gap-3">
    {onReset && (
      <button type="button" onClick={onReset} disabled={busy} className="cc-btn">
        Reset to original
      </button>
    )}
    <button type="button" onClick={onSave} disabled={busy || saveDisabled} className="cc-btn cc-btn-primary ml-auto">
      {saveLabel}
    </button>
  </div>
);
