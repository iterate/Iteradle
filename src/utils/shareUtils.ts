import type { Iterator, GuessResult } from '../types/Iterator';

export const generateShareableResult = (
  gameWon: boolean,
  guesses: string[],
  guessResults: GuessResult[],
  targetIterator: Iterator,
  startTime: number | null,
  endTime: number | null,
  hintsUsed: number
): string => {
  const tries = guesses.length;
  const gameNumber = getGameNumber();
  const duration = formatDuration(startTime, endTime);
  
  // Create the visual representation of guesses
  const visualGuesses = guessResults.map(result => 
    Object.values(result.feedback).map(feedback => getEmojiForFeedback(feedback)).join('')
  ).join('\n');

  const resultText = gameWon 
    ? `I guessed the #${gameNumber} todays #Iterate employee in ${tries} ${tries === 1 ? 'try' : 'tries'}!`
    : `I failed to guess the #${gameNumber} todays #Iterate employee`;

  const hintsUsedText = hintsUsed > 0 ? `I used ${hintsUsed} ${hintsUsed === 1 ? 'hint' : 'hints'}!` : 'Mom look no hints!';

  const shareText = `${resultText}
${visualGuesses}
Time to ${gameWon ? 'win' : 'lose'}: ${duration}
${hintsUsedText}
Play at iteradle.com :video_game:!`;

  return shareText;
};

const getGameNumber = (): number => {
  // Use the same logic as generateRandomIterator to get consistent game number
  const today = new Date().toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    const char = today.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % 1000 + 1; // Generate a number between 1-1000
};

const formatDuration = (startTime: number | null, endTime: number | null): string => {
  if (!startTime || !endTime) return '00:00.000';
  
  const durationMs = endTime - startTime;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const getEmojiForFeedback = (feedback: string): string => {
  switch (feedback) {
    case 'correct':
      return ':large_green_square:';
    case 'partial':
      return ':large_yellow_square:';
    case 'too-high':
      return ':large_orange_square:';
    case 'too-low':
      return ':large_purple_square:';
    case 'incorrect':
      return ':large_red_square:';
    default:
      return ':white_large_square:';
  }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch (fallbackErr) {
      console.error('Failed to copy to clipboard:', fallbackErr);
      return false;
    }
  }
};
