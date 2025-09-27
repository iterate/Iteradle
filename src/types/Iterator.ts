export interface Iterator {
  name: string;
  title: string;
  email: string;
  phoneNumber: string;
  birthYear: number;
  gender: string;
  yearsOfEducation: number;
  experience: number | null;
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
    gender: 'correct' | 'incorrect' | 'partial';
    birthYear: 'correct' | 'incorrect' | 'partial' | 'too-high' | 'too-low';
    yearsOfEducation: 'correct' | 'incorrect' | 'partial' | 'too-high' | 'too-low';
    experience: 'correct' | 'incorrect' | 'partial' | 'too-high' | 'too-low';
  };
}
