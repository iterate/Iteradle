import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Heading,
  Grid,
  GridItem,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
} from "@chakra-ui/react";
import type { Iterator, GameState, GuessResult } from "../types/Iterator";
import { loadCSVData } from "../utils/csvParser";
import {
  evaluateGuess,
  generateRandomIterator,
  getHint,
} from "../utils/gameLogic";
import { generateShareableResult, copyToClipboard } from "../utils/shareUtils";
import "./IteradleGame.css";

const IteradleGame: React.FC = () => {
  const [iterators, setIterators] = useState<Iterator[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    targetIterator: null,
    currentGuess: "",
    guesses: [],
    maxGuesses: 6,
    gameWon: false,
    gameLost: false,
    hintsUsed: 0,
    maxHints: 3,
    startTime: null,
    endTime: null,
  });
  const [guessResults, setGuessResults] = useState<GuessResult[]>([]);
  const [currentHint, setCurrentHint] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const initializeGame = async () => {
      try {
        const data = await loadCSVData();
        setIterators(data);
        if (data.length > 0) {
          const target = generateRandomIterator(data);
          setGameState((prev) => ({
            ...prev,
            targetIterator: target,
            startTime: Date.now(),
          }));
        }
      } catch (error) {
        console.error("Error initializing game:", error);
        toast({
          title: "Error loading data",
          description: "Failed to load iterator data. Please refresh the page.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    initializeGame();
  }, [toast]);

  // Filter employees based on search query
  const filteredEmployees = iterators.filter((iterator) =>
    iterator.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGuess = () => {
    if (!gameState.currentGuess.trim() || !gameState.targetIterator) return;

    const result = evaluateGuess(
      gameState.currentGuess,
      gameState.targetIterator,
      iterators
    );
    const newGuessResults = [...guessResults, result];
    setGuessResults(newGuessResults);

    const newGuesses = [...gameState.guesses, gameState.currentGuess];
    const isCorrect = result.isCorrect;
    const gameWon = isCorrect;
    const gameLost = !isCorrect && newGuesses.length >= gameState.maxGuesses;
    const endTime = gameWon || gameLost ? Date.now() : null;

    setGameState((prev) => ({
      ...prev,
      currentGuess: "",
      guesses: newGuesses,
      gameWon,
      gameLost,
      endTime,
    }));

    if (isCorrect) {
      toast({
        title: "Congratulations!",
        description: `You guessed correctly! The answer was ${gameState.targetIterator.name}.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } else if (gameLost) {
      toast({
        title: "Game Over!",
        description: `The correct answer was ${gameState.targetIterator.name}.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleHint = () => {
    if (gameState.hintsUsed >= gameState.maxHints || !gameState.targetIterator)
      return;

    const hint = getHint(gameState.targetIterator, gameState.hintsUsed);
    setCurrentHint(hint);
    setGameState((prev) => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));

    toast({
      title: "Hint Used",
      description: hint,
      status: "info",
      duration: 4000,
      isClosable: true,
    });
  };

  const handleEmployeeSelect = (employeeName: string) => {
    setGameState((prev) => ({ ...prev, currentGuess: employeeName }));
    setSearchQuery(employeeName);
    setIsOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setGameState((prev) => ({ ...prev, currentGuess: value }));
    setIsOpen(value.length > 0);
  };

  const resetGame = () => {
    if (iterators.length > 0) {
      const target = generateRandomIterator(iterators);
      setGameState({
        targetIterator: target,
        currentGuess: "",
        guesses: [],
        maxGuesses: 6,
        gameWon: false,
        gameLost: false,
        hintsUsed: 0,
        maxHints: 3,
        startTime: Date.now(),
        endTime: null,
      });
      setGuessResults([]);
      setCurrentHint("");
      setSearchQuery("");
      setIsOpen(false);
    }
  };

  const handleShare = async () => {
    if (!gameState.targetIterator) return;

    const shareText = generateShareableResult(
      gameState.gameWon,
      gameState.guesses,
      guessResults,
      gameState.targetIterator,
      gameState.startTime,
      gameState.endTime,
      gameState.hintsUsed
    );

    const success = await copyToClipboard(shareText);

    if (success) {
      toast({
        title: "Results copied!",
        description: "Your game results have been copied to clipboard.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Copy failed",
        description: "Failed to copy results to clipboard.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getFeedbackColor = (
    feedback: "correct" | "incorrect" | "partial" | "too-high" | "too-low"
  ) => {
    switch (feedback) {
      case "correct":
        return "green";
      case "partial":
        return "yellow";
      case "incorrect":
        return "red";
      case "too-high":
        return "orange";
      case "too-low":
        return "purple";
      default:
        return "gray";
    }
  };

  const getFeedbackDisplay = (value: string) => {
    switch (value) {
      case "correct":
        return "✓";
      case "partial":
        return "~";
      case "too-high":
        return "↑";
      case "too-low":
        return "↓";
      case "incorrect":
        return "✗";
      default:
        return value;
    }

    return value;
  };

  if (loading) {
    return (
      <Box className="loading-container">
        <Text className="loading-text">Loading game...</Text>
      </Box>
    );
  }

  return (
    <Box className="main-container" w="100%">
      {/* Header Navigation */}
      <Box className="header">
        <Container maxW="100%">
          <HStack justify="space-between" align="center">
            <Text className="header-title">Iteradle</Text>
            <HStack className="header-links" spacing={{ base: 4, md: 8 }}>
              <a
                href="https://iterate.no/"
                target="_blank"
                rel="noopener noreferrer"
                className="header-link"
              >
                <Text>Om oss</Text>
              </a>
            </HStack>
          </HStack>
        </Container>
      </Box>

      <Container className="content-container">
        <VStack spacing={8}>
          <VStack spacing={6} align="center">
            {/* Pixelated Creature */}
            <Box className="creature-container">
              {/* Simple pixelated creature */}
              <Box className="creature">
                {/* Eyes */}
                <Box className="creature-eye left" />
                <Box className="creature-eye right" />
              </Box>
            </Box>

            <Text className="main-title">
              Guess the Iterate employee! Use hints wisely.
            </Text>
          </VStack>

          {/* Controls */}
          <VStack className="controls-container" spacing={4}>
            <HStack spacing={4} w="full">
              <Box position="relative" w="full">
                <Input
                  className="search-input"
                  placeholder="Type to search employees..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsOpen(true)}
                  onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                  isDisabled={gameState.gameWon || gameState.gameLost}
                />
                {isOpen && filteredEmployees.length > 0 && (
                  <Box className="employee-dropdown">
                    {filteredEmployees.slice(0, 10).map((iterator) => (
                      <Box
                        key={iterator.name}
                        className="employee-item"
                        onClick={() => handleEmployeeSelect(iterator.name)}
                      >
                        {iterator.name}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
              <Button
                className="guess-button"
                onClick={() => {
                  handleGuess();
                  setSearchQuery("");
                }}
                isDisabled={
                  !gameState.currentGuess.trim() ||
                  gameState.gameWon ||
                  gameState.gameLost
                }
              >
                Guess
              </Button>
            </HStack>

            {/* Hints */}
            <HStack spacing={4} w="full" justify="center" flexWrap="wrap">
              <Button
                className="hint-button"
                onClick={handleHint}
                isDisabled={
                  gameState.hintsUsed >= gameState.maxHints ||
                  gameState.gameWon ||
                  gameState.gameLost
                }
              >
                Get Hint ({gameState.maxHints - gameState.hintsUsed} left)
              </Button>
              <Button className="new-game-button" onClick={resetGame}>
                New Game
              </Button>
            </HStack>
          </VStack>

          {currentHint && (
            <Alert className="alert" status="info">
              <AlertIcon className="alert-icon info" />
              <AlertTitle className="alert-title">Hint:</AlertTitle>
              <AlertDescription className="alert-description">
                {currentHint}
              </AlertDescription>
            </Alert>
          )}

          {(gameState.gameWon || gameState.gameLost) && (
            <Alert
              className="alert"
              status={gameState.gameWon ? "success" : "error"}
            >
              <AlertIcon
                className={`alert-icon ${
                  gameState.gameWon ? "success" : "error"
                }`}
              />
              <AlertTitle className="alert-title large">
                {gameState.gameWon ? "You Won!" : "Game Over!"}
              </AlertTitle>
              <AlertDescription className="alert-description">
                {gameState.gameWon
                  ? `Correct! The answer was ${gameState.targetIterator?.name}.`
                  : `The correct answer was ${gameState.targetIterator?.name}.`}
              </AlertDescription>
              {(gameState.gameWon || gameState.gameLost) && (
                <Button className="share-button" onClick={handleShare}>
                  Share Results
                </Button>
              )}
            </Alert>
          )}

          {guessResults.length > 0 && (
            <Box className="guesses-container">
              <Heading className="guesses-title">Your Guesses:</Heading>
              <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                {guessResults.map((result, index) => (
                  <Box key={index} className="guess-card">
                    <Text className="guess-title">
                      Guess {index + 1}: {gameState.guesses[index]}
                    </Text>
                    <Grid className="guess-grid">
                      {Object.entries(result.feedback).map(([key, value]) => {
                        // Find the guessed iterator to get the actual values
                        const guessedIterator = iterators.find(
                          (iterator) =>
                            iterator.name.toLowerCase() ===
                              gameState.guesses[index].toLowerCase() ||
                            iterator.email.toLowerCase() ===
                              gameState.guesses[index].toLowerCase()
                        );

                        let displayValue = "";
                        if (guessedIterator) {
                          switch (key) {
                            case "name":
                              displayValue = guessedIterator.name;
                              break;
                            case "title":
                              displayValue = guessedIterator.title;
                              break;
                            case "gender":
                              displayValue = guessedIterator.gender;
                              break;
                            case "birthYear":
                              displayValue =
                                guessedIterator.birthYear.toString();
                              break;
                            case "yearsOfEducation":
                              displayValue =
                                guessedIterator.yearsOfEducation.toString();
                              break;
                            case "experience":
                              displayValue =
                                guessedIterator.experience === null
                                  ? "N/A"
                                  : guessedIterator.experience.toString();
                              break;
                            default:
                              displayValue = getFeedbackDisplay(value);
                          }
                        } else {
                          displayValue = getFeedbackDisplay(value);
                        }

                        const feedbackColorClass = `feedback-${getFeedbackColor(
                          value as any
                        )}`;

                        return (
                          <GridItem
                            key={key}
                            className={`guess-item ${feedbackColorClass}`}
                          >
                            <Text className="guess-item-label">
                              {key
                                .replace(/([A-Z])/g, " $1")
                                .trim()
                                .toLowerCase()
                                .replace(/^./, (c) => c.toUpperCase())}
                              :
                            </Text>
                            <Text className="guess-item-value">
                              {displayValue} {getFeedbackDisplay(value)}
                            </Text>
                          </GridItem>
                        );
                      })}
                    </Grid>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}

          <Box className="stats-container">
            <Text className="stats-text">
              Guesses: {gameState.guesses.length}/{gameState.maxGuesses}
            </Text>
            <Text>
              Hints used: {gameState.hintsUsed}/{gameState.maxHints}
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default IteradleGame;
