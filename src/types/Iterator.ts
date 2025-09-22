export interface Iterator {
  name: string;
  nameMultilang: string;
  title: string;
  email: string;
  upn: string;
  externalUserId: string;
  cvPartnerUserId: string;
  cvPartnerCvId: string;
  phoneNumber: string;
  landline: string;
  birthYear: number;
  department: string;
  country: string;
  userCreatedAt: string;
  cvLastUpdatedByOwner: string;
  cvLastUpdated: string;
  yearsOfEducation: number;
  yearsSinceFirstWorkExperience: number;
  accessRoles: string[];
  hasProfileImage: boolean;
  ownsReferenceProject: boolean;
  readAndUnderstoodPrivacyNotice: boolean;
}

export interface GameState {
  targetIterator: Iterator | null;
  currentGuess: string;
  guesses: string[];
  maxGuesses: number;
  gameWon: boolean;
  gameLost: boolean;
  hintsUsed: number;
  maxHints: number;
}

export interface GuessResult {
  isCorrect: boolean;
  feedback: {
    name: 'correct' | 'incorrect' | 'partial';
    title: 'correct' | 'incorrect' | 'partial';
    department: 'correct' | 'incorrect' | 'partial';
    birthYear: 'correct' | 'incorrect' | 'partial' | 'too-high' | 'too-low';
    yearsOfEducation: 'correct' | 'incorrect' | 'partial';
    yearsSinceFirstWorkExperience: 'correct' | 'incorrect' | 'partial';
    accessRoles: 'correct' | 'incorrect' | 'partial';
    hasProfileImage: 'correct' | 'incorrect' | 'partial';
    ownsReferenceProject: 'correct' | 'incorrect' | 'partial';
  };
}
