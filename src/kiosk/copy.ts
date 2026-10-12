// Every sentence a visitor reads on the kiosk pages, in one place. The brand is written as in the sentences here.

export const copy = {
  head: { title: 'CHOOSE YOUR HEAD', subtitle: 'Pick a face for your Playy!' },
  pose: { title: 'CHOOSE YOUR POSE', subtitle: 'Pick a pose for your Playy!' },
  colors: {
    title: 'CHOOSE YOUR COLOURS!',
    simple: 'Pick a main colour and a secondary colour for your Playy!',
    advanced: 'Pick a colour for each part of your Playy!',
    main: 'Main colour',
    secondary: 'Secondary colour',
    head: 'Head',
  },
  quiz: { fallbackTitle: 'DISCOVER YOUR POWER', fallbackSubtitle: 'Choose the answer that feels most like you!' },
  world: { title: 'CHOOSE YOUR BACKGROUND', subtitle: 'Pick a world for your Playy!' },
  details: {
    titles: ["WHAT'S YOUR NAME?", "WHAT'S YOUR PHONE NUMBER?", "WHAT'S YOUR EMAIL?"],
    subtitles: [
      'Type your name so we can add it to your Playy!',
      'Ask a grown-up for their phone number so we can send your Playy!',
      'Ask a grown-up for their email so we can send your Playy!',
    ],
    placeholders: ['Type your name', 'Type a phone number', 'Type an email address'],
  },
  preview: {
    title: 'YOUR COLORING PAGE!',
    subtitle: 'Here is how your Playy looks. Ready to print?',
    coloring: '✏️ YOUR COLORING PAGE',
    colour: '🎨 FULL COLOUR PREVIEW',
  },
  card: {
    title: 'YOUR TRUMP CARD!',
    subtitle: 'A collectible card made just for you!',
    seeStats: 'Tap the card to see its stats!',
    seePicture: 'Tap the card to see your picture!',
    flipToStats: 'Flip the card to see the stats',
    flipToPicture: 'Flip the card to see the picture',
  },
  share: {
    title: 'ALL DONE!',
    subtitle: 'Tap SHARE to print it and send it to us!',
    coloring: '✏️ COLORING PAGE',
    colour: '🎨 FULL COLOUR',
    card: '🃏 TRUMP CARD',
    busy: 'Getting your Playy ready…',
  },
  power: {
    ribbon: 'POWER AWARDED!',
    label: 'YOUR POWER',
    description: 'Your Playy now carries this power symbol on all your creations!',
    strip: 'Your Playy carries this special power wherever your imagination takes you!',
  },
  success: {
    title: 'YOUR PLAYY IS READY!',
    thanks: (name?: string) => `Thank you for playing${name ? `, ${name}` : ''}!`,
    collect: { title: 'Collect your pages', text: 'Your coloring pages and trump card are printing now.' },
    sent: {
      title: 'Sent to our team',
      text: 'Your Playy and trump card are on their way to the Playy Kingdom team.',
    },
    printAgain: 'PRINT AGAIN',
    finish: 'FINISH',
    countdown: (seconds: number) => `Back to the start in ${seconds}s`,
  },
  nav: {
    back: 'BACK',
    next: 'NEXT',
    continue: 'CONTINUE',
    share: 'SHARE',
    sharing: 'SHARING…',
    pickForMe: 'Pick for Me!',
  },
  questionCounter: (n: number, total: number) => `QUESTION ${n} OF ${total}`,
} as const;
