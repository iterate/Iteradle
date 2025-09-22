# Iteradle - Guess the Iterate Employee

A Wordle-style guessing game built with React, TypeScript, and Chakra UI where players try to guess which Iterate employee they're thinking of based on various attributes.

## Features

- **Wordle-style Gameplay**: Guess the correct employee within 6 attempts
- **Rich Data**: Uses real employee data from Iterate including names, titles, departments, and more
- **Smart Feedback**: Get color-coded feedback on your guesses (correct, partial, incorrect)
- **Hint System**: Use up to 3 hints to help narrow down your guess
- **Pixel-Art Aesthetic**: Styled to match the retro gaming aesthetic shown in the reference image
- **Responsive Design**: Works on desktop and mobile devices

## How to Play

1. **Make a Guess**: Enter an employee's name or email address
2. **Get Feedback**: See which attributes match, partially match, or don't match
3. **Use Hints**: Click "Get Hint" to reveal additional information about the target employee
4. **Win or Lose**: Guess correctly within 6 attempts to win!

## Attributes

The game compares these attributes between your guess and the target:

- **Name**: Exact match required
- **Title**: Exact match required
- **Department**: Exact match required
- **Birth Year**: Exact match (green), within 5 years (yellow), or more (red)
- **Years of Education**: Exact match (green), within 2 years (yellow), or more (red)
- **Years of Work Experience**: Exact match (green), within 3 years (yellow), or more (red)
- **Access Roles**: Partial match if any roles overlap (yellow), otherwise red
- **Profile Image**: Exact match required
- **Reference Project**: Exact match required

## Technical Details

- **Framework**: React 18 with TypeScript
- **UI Library**: Chakra UI with custom pixel-art theme
- **Data**: CSV parsing with PapaParse
- **Styling**: Custom theme with Press Start 2P font for retro feel
- **Build Tool**: Vite for fast development and building

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser to the local development URL (usually http://localhost:5173)

## Project Structure

```
src/
├── components/
│   └── IteradleGame.tsx    # Main game component
├── types/
│   └── Iterator.ts         # TypeScript interfaces
├── utils/
│   ├── csvParser.ts        # CSV data loading and parsing
│   └── gameLogic.ts        # Game logic and evaluation
├── App.tsx                 # Main app with Chakra UI setup
└── main.tsx               # React entry point
```

## Data Source

The game uses employee data from `Iterators.csv` which includes:

- Personal information (name, email, phone)
- Professional details (title, department, years of experience)
- System data (access roles, profile status)
- Timestamps for various activities

## Customization

You can easily customize the game by:

- Modifying the CSV data structure in `types/Iterator.ts`
- Adjusting game rules in `utils/gameLogic.ts`
- Changing the UI theme in `App.tsx`
- Adding new attributes or feedback mechanisms

## License

This project is for internal use at Iterate.
