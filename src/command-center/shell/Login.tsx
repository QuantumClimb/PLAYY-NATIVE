import React, { useState } from 'react';
import { ccApi } from '../api';

interface LoginProps {
  /** False when the server has no command center password set */
  enabled: boolean;
  onDone: () => void;
}

export const Login: React.FC<LoginProps> = ({ enabled, onDone }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ccApi.login(password);
      onDone();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form onSubmit={submit} className="cc-card cc-card-pad w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-xl">Command Center</h1>
          <p className="text-sm cc-muted">Sign in to manage the kiosk content.</p>
        </div>
        {!enabled && (
          <div className="cc-alert cc-alert-warn">
            Disabled. Set COMMAND_CENTER_PASSWORD in .env and restart the server.
          </div>
        )}
        <label className="block text-sm font-medium text-gray-700">
          Password
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="cc-input w-full mt-1"
          />
        </label>
        {error && <div className="cc-alert cc-alert-error">{error}</div>}
        <button type="submit" className="cc-btn cc-btn-primary w-full">
          Sign in
        </button>
      </form>
    </div>
  );
};
