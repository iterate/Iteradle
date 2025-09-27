import type { Iterator, GuessResult } from '../types/Iterator';

export const generateRandomIterator = (iterators: Iterator[]): Iterator => {
  // Get current date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Create a simple hash from the date string
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    const char = today.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use modulo to get a consistent index for today
  const index = Math.abs(hash) % iterators.length;

  return iterators[index];
};

export const evaluateGuess = (guess: string, target: Iterator, allIterators: Iterator[]): GuessResult => {
  const guessedIterator = allIterators.find(iterator => 
    iterator.name.toLowerCase() === guess.toLowerCase() ||
    iterator.email.toLowerCase() === guess.toLowerCase()
  );

  if (!guessedIterator) {
    return {
      isCorrect: false,
      feedback: {
        name: 'incorrect',
        title: 'incorrect',
        gender: 'incorrect',
        birthYear: 'incorrect',
        yearsOfEducation: 'incorrect',
        experience: 'incorrect',
      }
    };
  }

  const isCorrect = guessedIterator.name === target.name;

  return {
    isCorrect,
    feedback: {
      name: guessedIterator.name === target.name ? 'correct' : 'incorrect',
      title: guessedIterator.title === target.title ? 'correct' : 'incorrect',
      gender: guessedIterator.gender === target.gender ? 'correct' : 'incorrect',
      birthYear: guessedIterator.birthYear === target.birthYear ? 'correct' : 
                 Math.abs(guessedIterator.birthYear - target.birthYear) <= 5 ? 'partial' : 
                 guessedIterator.birthYear > target.birthYear ? 'too-high' : 'too-low',
      yearsOfEducation: guessedIterator.yearsOfEducation === target.yearsOfEducation ? 'correct' : 
                       Math.abs(guessedIterator.yearsOfEducation - target.yearsOfEducation) <= 2 ? 'partial' : 
                       guessedIterator.yearsOfEducation > target.yearsOfEducation ? 'too-high' : 'too-low',
      experience: guessedIterator.experience === target.experience ? 'correct' :
                 Math.abs(guessedIterator.experience - target.experience) <= 3 ? 'partial' :
                 guessedIterator.experience > target.experience ? 'too-high' : 'too-low',
    }
  };
};

export const getHint = (target: Iterator, hintsUsed: number): string => {
  const hints = [
    `This person's title is: ${target.title}`,
    `This person is ${target.gender.toLowerCase()}`,
    `This person was born in ${target.birthYear}`,
    `This person has ${target.yearsOfEducation} years of education`,
    `This person has ${target.experience} years of work experience`,
  ];

  return hints[hintsUsed] || 'No more hints available!';
};
