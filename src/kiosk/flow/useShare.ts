import { useRef, useState } from 'react';
import type { Selection } from '../../lib/assets/library';
import { nativeFeedback } from '../../lib/playys/nativeFeedback';
import type { PlayyConfiguration } from '../../lib/playys/types';
import { captureShare } from '../../lib/share/capture';
import { sendShare } from '../../lib/share/send';
import type { ShareSheetsHandle } from '../components/ShareSheets';

interface Options {
  config: PlayyConfiguration;
  selection: Selection;
  /** Called when the visitor does anything, so the idle timer starts again */
  touch: () => void;
  /** Called when sharing is over (it worked or not): opens the print dialog and moves on */
  onDone: () => void;
}

/**
 * SHARE: photographs the finished pages, logs the visitor and emails the PDFs, then lets the print dialog open.
 * A failure never stops the visitor from getting their printout.
 */
export function useShare({ config, selection, touch, onDone }: Options) {
  const sheets = useRef<ShareSheetsHandle>(null);
  const [sharing, setSharing] = useState(false);

  const share = async () => {
    if (sharing) return;
    touch();
    nativeFeedback.impactMedium();
    setSharing(true);
    try {
      const nodes = sheets.current?.nodes();
      if (nodes) {
        // Log what was actually used: a pick left alone falls back to the first of its kind
        const used: PlayyConfiguration = {
          ...config,
          head: selection.head.slug,
          pose: selection.body.slug,
          background: selection.background.slug,
          symbol: selection.symbol?.slug ?? config.symbol,
        };
        await sendShare(used, await captureShare(nodes));
      }
    } catch (e) {
      console.error('Sharing failed', e);
    }
    setSharing(false);
    onDone();
  };

  return { sheets, sharing, share };
}
