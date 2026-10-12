import { useCallback, useEffect, useState } from 'react';
import { api } from '../data/api';

interface CmsSettingOptions<T, R> {
  /** Reads the current value (and anything else the server sends with it) */
  url: string;
  /** Saves the value; the response goes through `read` again */
  saveUrl: string;
  /** Puts the value back to the original; leave out when there is nothing to reset */
  resetUrl?: string;
  /** Turns a server response into the value to edit (and the extras, if any) */
  read: (data: R) => T;
  /** Turns the edited value into the body to save. Defaults to sending the value as it is */
  write?: (value: T) => unknown;
  /** The value shown until the server answers, and after a reset */
  defaults: T;
  savedNote: string;
  resetNote?: string;
  resetQuestion?: string;
}

/**
 * The load, edit, save and reset cycle every command center panel shares.
 * `run` wraps any extra action (an upload, say) so it gets the same busy, error and note handling.
 */
export function useCmsSetting<T, R = unknown>(options: CmsSettingOptions<T, R>) {
  const { url, saveUrl, resetUrl, read, write, defaults, savedNote, resetNote, resetQuestion } = options;
  const [value, setValue] = useState<T>(defaults);
  const [response, setResponse] = useState<R | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<R>(url)
      .then((data) => {
        setResponse(data);
        setValue(read(data));
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
    // `read` is a plain function of the response; the panel is loaded once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const run = useCallback(async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);

  const save = () =>
    run(async () => {
      const data = await api.put<R>(saveUrl, write ? write(value) : value);
      setResponse(data);
      setValue(read(data));
      setNote(savedNote);
    });

  const reset = () =>
    run(async () => {
      if (!resetUrl) return;
      if (resetQuestion && !window.confirm(resetQuestion)) return;
      await api.post(resetUrl);
      setValue(defaults);
      setNote(resetNote ?? 'Reset to the original.');
    });

  return { value, setValue, response, loading, busy, error, note, setNote, run, save, reset };
}
