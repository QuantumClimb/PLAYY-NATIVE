import React from 'react';

interface ArchedHeadingProps {
  /** The heading text. The page styles curve and colour it; each letter is its own span for that. */
  text: string;
  /** The longest heading is scaled to fit, so the page styles need to know how many letters there are */
  className?: string;
}

/** A big gold heading, one span per letter (spaces become gaps). */
export const ArchedHeading: React.FC<ArchedHeadingProps> = ({ text, className = '' }) => (
  <h1
    className={`head-arched-heading ${className}`}
    style={{ ['--title-chars' as string]: text.length } as React.CSSProperties}
    aria-label={text}
  >
    {text
      .split('')
      .map((letter, index) =>
        letter === ' ' ? (
          <span className="head-heading-space" key={`space-${index}`} aria-hidden="true" />
        ) : (
          <span key={`${letter}-${index}`}>{letter}</span>
        ),
      )}
  </h1>
);
