import { useEffect, useState } from 'react';
import { api } from './api';

interface SettingDefinition<T> {
  /** Where the kiosk reads the setting from */
  url: string;
  /** The key the server wraps the value in, e.g. `{ "settings": ... }` */
  key: string;
  /** Turns whatever the server sent (possibly nothing) into a usable value */
  clean: (raw: unknown) => T;
}

const cache = new Map<string, unknown>();

/**
 * A setting the command center controls, loaded once per page load and shared by everything that uses it.
 * Shows `fallback` (the defaults) until the server answers, and keeps it if the server cannot be reached.
 */
export function useServerSetting<T>({ url, key, clean }: SettingDefinition<T>, fallback: T): T {
  const [value, setValue] = useState<T>(() => (cache.has(url) ? (cache.get(url) as T) : fallback));

  useEffect(() => {
    if (cache.has(url)) return;
    let live = true;
    api
      .get<Record<string, unknown>>(url)
      .then((data) => {
        const cleaned = clean(data[key]);
        cache.set(url, cleaned);
        if (live) setValue(cleaned);
      })
      .catch(() => {
        // The kiosk still works without the setting: use the defaults (and ask again next time)
        if (live) setValue(clean(undefined));
      });
    return () => {
      live = false;
    };
  }, [url, key, clean]);

  return value;
}
