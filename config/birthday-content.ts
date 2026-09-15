export const birthdayContent = {
  recipient: 'Vetha',
  intro: 'A little something for you...',
  openLabel: 'Open',
  letterLines: [
    'Vetha...',
    'Indha message-a just type panni wish pannirukalam...',
    'Aana unakku edhachum different-ah pannalam nu thonuchu.',
    'Adhan idha create panniruken.',
  ],
  birthday: 'Happy Birthday',
  finalWish: 'Eppovume happy-ah iru.',
} as const

export type BirthdayContent = typeof birthdayContent

export const letterTiming = {
  lineDelay: 1700,
  birthdayDelay: 1500,
  finaleDelay: 7200,
} as const

export const fireworksPalette = ['#f8e5b8', '#f3bb72', '#fff8dc', '#d99a56', '#f6cf8b']

export default birthdayContent
