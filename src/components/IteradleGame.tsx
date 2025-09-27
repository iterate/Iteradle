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
  Badge,
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
          setGameState((prev) => ({ ...prev, targetIterator: target }));
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

    setGameState((prev) => ({
      ...prev,
      currentGuess: "",
      guesses: newGuesses,
      gameWon,
      gameLost,
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
      });
      setGuessResults([]);
      setCurrentHint("");
      setSearchQuery("");
      setIsOpen(false);
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
      <Container maxW="container.xl" py={8}>
        <Text>Loading game...</Text>
      </Container>
    );
  }

  return (
    <Box
      minH="100vh"
      bg="#87CEEB"
      fontFamily='"Press Start 2P", monospace'
      fontSize="12px"
    >
      <Container maxW="90%" py={8}>
        <VStack spacing={8}>
          <Heading size="2xl" textAlign="center" color="blue.600">
            Iteradle
          </Heading>
          <Text textAlign="center" fontSize="lg" color="gray.600">
            Guess the Iterate employee! Use hints wisely.
          </Text>

          {/* Controls */}
          <HStack spacing={4} w="full" maxW="md">
            <Box position="relative" w="full">
              <Input
                placeholder="Type to search employees..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                isDisabled={gameState.gameWon || gameState.gameLost}
                bg="white"
                borderColor="black"
                borderWidth="3px"
                borderRadius="8px"
                fontSize="10px"
                minW="300px"
              />
              {isOpen && filteredEmployees.length > 0 && (
                <Box
                  position="absolute"
                  top="100%"
                  left={0}
                  right={0}
                  zIndex={1000}
                  bg="white"
                  border="3px solid black"
                  borderTop="none"
                  borderRadius="0 0 8px 8px"
                  maxH="200px"
                  overflowY="auto"
                  boxShadow="lg"
                >
                  {filteredEmployees.slice(0, 10).map((iterator) => (
                    <Box
                      key={iterator.name}
                      px={3}
                      py={2}
                      cursor="pointer"
                      _hover={{ bg: "gray.100" }}
                      onClick={() => handleEmployeeSelect(iterator.name)}
                      fontSize="10px"
                      fontFamily='"Press Start 2P", monospace'
                    >
                      {iterator.name}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
            <Button
              onClick={handleGuess}
              bg="blue.500"
              color="white"
              borderColor="black"
              borderWidth="3px"
              borderRadius="8px"
              fontSize="10px"
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
          <HStack spacing={4}>
            <Button
              onClick={handleHint}
              variant="outline"
              colorScheme="orange"
              borderWidth="3px"
              isDisabled={
                gameState.hintsUsed >= gameState.maxHints ||
                gameState.gameWon ||
                gameState.gameLost
              }
            >
              Get Hint ({gameState.maxHints - gameState.hintsUsed} left)
            </Button>
            <Button
              onClick={resetGame}
              variant="outline"
              colorScheme="purple"
              borderWidth="3px"
            >
              New Game
            </Button>
          </HStack>

          {currentHint && (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <AlertTitle>Hint:</AlertTitle>
              <AlertDescription ml={2}>{currentHint}</AlertDescription>
            </Alert>
          )}

          {(gameState.gameWon || gameState.gameLost) && (
            <Alert
              status={gameState.gameWon ? "success" : "error"}
              borderRadius="md"
            >
              <AlertIcon />
              <AlertTitle>
                {gameState.gameWon ? "You Won!" : "Game Over!"}
              </AlertTitle>
              <AlertDescription ml={2}>
                {gameState.gameWon
                  ? `Correct! The answer was ${gameState.targetIterator?.name}.`
                  : `The correct answer was ${gameState.targetIterator?.name}.`}
              </AlertDescription>
            </Alert>
          )}

          {guessResults.length > 0 && (
            <Box w="full">
              <Heading size="md" mb={4}>
                Your Guesses:
              </Heading>
              <VStack spacing={2} align="stretch">
                {guessResults.map((result, index) => (
                  <Box
                    key={index}
                    p={4}
                    border="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="gray.50"
                  >
                    <Text fontWeight="bold" mb={2}>
                      Guess {index + 1}: {gameState.guesses[index]}
                    </Text>
                    <Grid
                      templateColumns="repeat(auto-fit, minmax(200px, 1fr))"
                      gap={2}
                    >
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

                        return (
                          <GridItem key={key}>
                            <Text fontSize="sm" color="gray.600">
                              {key
                                .replace(/([A-Z])/g, " $1")
                                .trim()
                                .toLowerCase()
                                .replace(/^./, (c) => c.toUpperCase())}
                              :
                            </Text>
                            <Badge colorScheme={getFeedbackColor(value as any)}>
                              {displayValue} {getFeedbackDisplay(value)}
                            </Badge>
                          </GridItem>
                        );
                      })}
                    </Grid>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}

          <Box textAlign="center" color="gray.600">
            <Text>
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
