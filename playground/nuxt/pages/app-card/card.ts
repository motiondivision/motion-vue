export const CARDS = [
  {
    id: 1,
    title: 'Vikings',
    subtitle: 'Clash of the Norse Warriors',
    description: 'A game about vikings',
    longDescription:
      'A game about vikings, where you can play as a viking and fight other vikings. You can also build your own viking village and explore the world.',
    image:
      'https://animations-on-the-web-git-how-i-use-3066e1-emilkowalski-s-team.vercel.app/how-i-use-framer-motion/app-store-like-cards/game.webp',
    logo: 'https://animations-on-the-web-git-how-i-use-3066e1-emilkowalski-s-team.vercel.app/how-i-use-framer-motion/app-store-like-cards/game-logo.webp',
  },
]

export type Card = (typeof CARDS)[number]
