import React, { useState } from 'react';
import { Check, Delete, X } from 'lucide-react';

type KeyboardLayout = 'name' | 'email' | 'phone';

interface DetailsKeyboardProps {
  layout: KeyboardLayout;
  /** A single character, ' ' for space, 'BACKSPACE', or 'DONE' */
  onKey: (key: string) => void;
}

const LETTER_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
// Second layer (the "123" key): numbers and the symbols names and emails need
const SYMBOL_ROWS: Record<'name' | 'email', string[]> = {
  name: ['1234567890', "'-"],
  email: ['1234567890', '+#&!?/'],
};

/** Keys cycle through the keyboard's candy colors. */
const tone = (i: number) => `dk-c${i % 5}`;

const Key: React.FC<{
  k: string;
  i: number;
  label?: React.ReactNode;
  wide?: number;
  sfx?: string;
  onKey: (k: string) => void;
  className?: string;
}> = ({ k, i, label, wide = 1, sfx = 'key', onKey, className = '' }) => (
  <button
    type="button"
    data-sfx={sfx}
    aria-label={typeof label === 'string' || label === undefined ? undefined : k.toLowerCase()}
    className={`dk-key ${className || tone(i)}`}
    style={{ flexGrow: wide }}
    onClick={() => onKey(k)}
  >
    {label ?? k}
  </button>
);

/** The touch keyboard: QWERTY with a 123 layer for names and emails, a big keypad for phone numbers. */
export const DetailsKeyboard: React.FC<DetailsKeyboardProps> = ({ layout, onKey }) => {
  const [symbols, setSymbols] = useState(false);

  if (layout === 'phone') {
    const rows = ['123', '456', '789'];
    return (
      <div className="details-keyboard is-phone">
        {rows.map((r) => (
          <div className="dk-row" key={r}>
            {[...r].map((c, i) => (
              <Key key={c} k={c} i={i} onKey={onKey} />
            ))}
          </div>
        ))}
        <div className="dk-row">
          <Key k="+" i={0} onKey={onKey} />
          <Key k="0" i={1} onKey={onKey} />
          <Key k="BACKSPACE" i={0} sfx="backspace" label={<Delete />} className="dk-back" onKey={onKey} />
        </div>
        <div className="dk-row">
          <Key
            k="DONE"
            i={0}
            sfx="next"
            label={
              <>
                DONE <Check strokeWidth={4} />
              </>
            }
            className="dk-done"
            onKey={onKey}
          />
        </div>
      </div>
    );
  }

  const rows = symbols ? SYMBOL_ROWS[layout] : LETTER_ROWS;
  const lower = layout === 'email' && !symbols; // emails are lowercase; the keys still read as capitals
  void lower;
  let n = 0;
  return (
    <div className="details-keyboard">
      {rows.map((r, ri) => (
        <div className="dk-row" key={r} data-row={ri}>
          {[...r].map((c) => (
            <Key key={c} k={c} i={n++} onKey={onKey} />
          ))}
          {ri === rows.length - 1 && (
            <Key k="BACKSPACE" i={0} sfx="backspace" label={<Delete />} wide={1.6} className="dk-back" onKey={onKey} />
          )}
        </div>
      ))}
      <div className="dk-row">
        <button
          type="button"
          data-sfx="key"
          className="dk-key dk-toggle"
          style={{ flexGrow: 1.6 }}
          onClick={() => setSymbols((s) => !s)}
        >
          {symbols ? 'ABC' : '123'}
        </button>
        {layout === 'email' && ['@', '.', '_', '-'].map((c, i) => <Key key={c} k={c} i={i + 1} onKey={onKey} />)}
        {layout === 'email' ? (
          <Key k=".com" i={0} label=".COM" wide={2.6} className="dk-space" onKey={onKey} />
        ) : (
          <Key k=" " i={0} label="SPACE" wide={5} className="dk-space" onKey={onKey} />
        )}
        <Key
          k="DONE"
          i={0}
          sfx="next"
          label={
            <>
              DONE <Check strokeWidth={4} />
            </>
          }
          wide={2.2}
          className="dk-done"
          onKey={onKey}
        />
      </div>
    </div>
  );
};

interface DetailFieldProps {
  value: string;
  placeholder: string;
  onClear: () => void;
  inputMode?: 'text' | 'tel' | 'email';
}

/** The big cream box that shows what has been typed, with a clear button. */
export const DetailField: React.FC<DetailFieldProps> = ({ value, placeholder, onClear }) => (
  <div className="detail-field">
    <div
      className={`detail-field-text ${value ? '' : 'is-empty'} ${value.includes('@') ? 'is-email' : ''}`}
      style={{ fontSize: `min(4vw, 7vh, ${(46 / Math.max(value.length, 8) / 0.62).toFixed(2)}vw)` }}
    >
      {value || placeholder}
      <span className="detail-caret" aria-hidden="true" />
    </div>
    {value && (
      <button type="button" data-sfx="backspace" className="detail-clear" aria-label="Clear" onClick={onClear}>
        <X strokeWidth={4} />
      </button>
    )}
  </div>
);
