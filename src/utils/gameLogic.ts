import type { Iterator, GuessResult } from '../types/Iterator';

export const generateRandomIterator = (iterators: Iterator[]): Iterator => {
  const randomIndex = Math.floor(Math.random() * iterators.length);
  return iterators[randomIndex];
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
        department: 'incorrect',
        birthYear: 'incorrect',
        yearsOfEducation: 'incorrect',
        yearsSinceFirstWorkExperience: 'incorrect',
        accessRoles: 'incorrect',
        hasProfileImage: 'incorrect',
        ownsReferenceProject: 'incorrect',
      }
    };
  }

  const isCorrect = guessedIterator.name === target.name;

  return {
    isCorrect,
    feedback: {
      name: guessedIterator.name === target.name ? 'correct' : 'incorrect',
      title: guessedIterator.title === target.title ? 'correct' : 'incorrect',
      department: guessedIterator.department === target.department ? 'correct' : 'incorrect',
      birthYear: guessedIterator.birthYear === target.birthYear ? 'correct' : 
                 Math.abs(guessedIterator.birthYear - target.birthYear) <= 5 ? 'partial' : 
                 guessedIterator.birthYear > target.birthYear ? 'too-high' : 'too-low',
      yearsOfEducation: guessedIterator.yearsOfEducation === target.yearsOfEducation ? 'correct' :
                       Math.abs(guessedIterator.yearsOfEducation - target.yearsOfEducation) <= 2 ? 'partial' : 'incorrect',
      yearsSinceFirstWorkExperience: guessedIterator.yearsSinceFirstWorkExperience === target.yearsSinceFirstWorkExperience ? 'correct' :
                                    Math.abs(guessedIterator.yearsSinceFirstWorkExperience - target.yearsSinceFirstWorkExperience) <= 3 ? 'partial' : 'incorrect',
      accessRoles: guessedIterator.accessRoles.some(role => target.accessRoles.includes(role)) ? 'partial' : 'incorrect',
      hasProfileImage: guessedIterator.hasProfileImage === target.hasProfileImage ? 'correct' : 'incorrect',
      ownsReferenceProject: guessedIterator.ownsReferenceProject === target.ownsReferenceProject ? 'correct' : 'incorrect',
    }
  };
};

export const getHint = (target: Iterator, hintsUsed: number): string => {
  const hints = [
    `This person's title is: ${target.title}`,
    `This person works in the ${target.department} department`,
    `This person was born in ${target.birthYear}`,
    `This person has ${target.yearsOfEducation} years of education`,
    `This person has ${target.yearsSinceFirstWorkExperience} years of work experience`,
    `This person's access roles include: ${target.accessRoles.join(', ')}`,
    `This person ${target.hasProfileImage ? 'has' : 'does not have'} a profile image`,
    `This person ${target.ownsReferenceProject ? 'owns' : 'does not own'} a reference project`,
  ];

  return hints[hintsUsed] || 'No more hints available!';
};
