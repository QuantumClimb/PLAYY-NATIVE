import { useRef, useState } from 'react';
import type { GeneratedCard } from '../../lib/playys/cardTypes';
import type { Selection } from '../../lib/assets/library';
import { nativeFeedback } from '../../lib/playys/nativeFeedback';
import type { PlayyConfiguration } from '../../lib/playys/types';
import { printSilently } from '../../lib/print/silentPrint';
import { captureShare } from '../../lib/share/capture';
import { sendShare } from '../../lib/share/send';
import type { ShareSheetsHandle } from '../components/ShareSheets';

interface Options {
  config: PlayyConfiguration;
  selection: Selection;
  card: GeneratedCard | null;
  /** Called when the visitor does anything, so the idle timer starts again */
  touch: () => void;
  /** Called when sharing is over (it worked or not). `printed` is true when the helper already printed the pages. */
  onDone: (printed: boolean) => void;
}

/**
 * SHARE: photographs the finished pages, logs the visitor and emails the PDFs, then lets the print dialog open.
 * A failure never stops the visitor from getting their printout.
 */
export function useShare({ config, selection, card, touch, onDone }: Options) {
  const sheets = useRef<ShareSheetsHandle>(null);
  const [sharing, setSharing] = useState(false);

  const share = async () => {
    if (sharing) return;
    touch();
    nativeFeedback.impactMedium();
    setSharing(true);
    let printing: Promise<boolean> = Promise.resolve(false);
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
        const capture = await captureShare(nodes);
        // Printing through the helper starts at once; the email and log carry on beside it
        printing = printSilently(capture.images);
        await sendShare(used, capture, card);
      }
    } catch (e) {
      console.error('Sharing failed', e);
    }
    const printed = await printing;
    setSharing(false);
    onDone(printed);
  };

  return { sheets, sharing, share };
}
