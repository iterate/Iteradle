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
      <Box
        minH="100vh"
        bg="#0a0a0a"
        fontFamily='"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
        color="#ffffff"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize="18px" color="#888888" fontWeight="extrabold">
          Loading game...
        </Text>
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bg="#0a0a0a"
      fontFamily='"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
      fontSize="16px"
      color="#ffffff"
    >
      {/* Header Navigation */}
      <Box
        w="full"
        borderBottom="1px solid #333333"
        py={4}
        px={{ base: 4, md: 8 }}
      >
        <Container maxW="container.xl">
          <HStack justify="space-between" align="center">
            <Text
              fontSize={{ base: "20px", md: "24px" }}
              fontWeight="extrabold"
              color="#ffffff"
            >
              Iteradle
            </Text>
            <HStack
              spacing={{ base: 4, md: 8 }}
              fontSize={{ base: "14px", md: "16px" }}
              fontWeight="extrabold"
              color="#888888"
              display={{ base: "none", lg: "flex" }}
            >
              <a
                href="https://iterate.no/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <Text _hover={{ color: "#ffffff", cursor: "pointer" }}>
                  Om oss
                </Text>
              </a>
            </HStack>
          </HStack>
        </Container>
      </Box>

      <Container maxW="90%" py={8}>
        <VStack spacing={8}>
          <VStack spacing={6} align="center">
            {/* Pixelated Creature */}
            <Box
              w="80px"
              h="80px"
              borderRadius="50%"
              border="2px solid #333333"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb={4}
              position="relative"
              overflow="hidden"
            >
              {/* Simple pixelated creature */}
              <Box
                w="40px"
                h="40px"
                bg="#00ff88"
                borderRadius="4px"
                position="relative"
                animation="pixelBounce 2s ease-in-out infinite"
              >
                {/* Eyes */}
                <Box
                  position="absolute"
                  top="8px"
                  left="8px"
                  w="4px"
                  h="4px"
                  bg="#0a0a0a"
                  borderRadius="50%"
                />
                <Box
                  position="absolute"
                  top="8px"
                  right="8px"
                  w="4px"
                  h="4px"
                  bg="#0a0a0a"
                  borderRadius="50%"
                />
              </Box>
            </Box>

            <Text
              textAlign="center"
              fontSize={{ base: "20px", md: "24px" }}
              color="#ffffff"
              fontWeight="extrabold"
              maxW="1200px"
              lineHeight="1.4"
              px={4}
            >
              Guess the Iterate employee! Use hints wisely.
            </Text>
          </VStack>

          {/* Controls */}
          <VStack spacing={4} w="full" maxW="md" px={4}>
            <HStack spacing={4} w="full">
              <Box position="relative" w="full">
                <Input
                  placeholder="Type to search employees..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsOpen(true)}
                  onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                  isDisabled={gameState.gameWon || gameState.gameLost}
                  bg="#1a1a1a"
                  borderColor="#333333"
                  borderWidth="1px"
                  borderRadius="8px"
                  fontSize={{ base: "14px", md: "16px" }}
                  fontWeight="extrabold"
                  color="#ffffff"
                  _placeholder={{ color: "#666666" }}
                  _focus={{
                    borderColor: "#ffffff",
                    boxShadow: "0 0 0 1px #ffffff",
                  }}
                  _hover={{ borderColor: "#555555" }}
                  minW={{ base: "250px", md: "300px" }}
                  h={{ base: "44px", md: "48px" }}
                />
                {isOpen && filteredEmployees.length > 0 && (
                  <Box
                    position="absolute"
                    top="100%"
                    left={0}
                    right={0}
                    zIndex={1000}
                    bg="#1a1a1a"
                    border="1px solid #333333"
                    borderTop="none"
                    borderRadius="0 0 8px 8px"
                    maxH="200px"
                    overflowY="auto"
                    boxShadow="0 8px 32px rgba(0,0,0,0.5)"
                  >
                    {filteredEmployees.slice(0, 10).map((iterator) => (
                      <Box
                        key={iterator.name}
                        px={3}
                        py={3}
                        cursor="pointer"
                        _hover={{ bg: "#333333" }}
                        onClick={() => handleEmployeeSelect(iterator.name)}
                        fontSize="16px"
                        fontWeight="extrabold"
                        color="#ffffff"
                        fontFamily='"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
                      >
                        {iterator.name}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
              <Button
                onClick={() => {
                  handleGuess();
                  setSearchQuery("");
                }}
                bg="#ffffff"
                color="#0a0a0a"
                borderColor="transparent"
                borderWidth="1px"
                borderRadius="8px"
                fontSize={{ base: "14px", md: "16px" }}
                fontWeight="extrabold"
                h={{ base: "44px", md: "48px" }}
                px={{ base: 4, md: 6 }}
                _hover={{ bg: "#f0f0f0" }}
                _active={{ bg: "#e0e0e0" }}
                _disabled={{
                  bg: "#333333",
                  color: "#666666",
                  cursor: "not-allowed",
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
                onClick={handleHint}
                bg="transparent"
                color="#888888"
                borderColor="#333333"
                borderWidth="1px"
                borderRadius="8px"
                fontSize={{ base: "14px", md: "16px" }}
                fontWeight="extrabold"
                h={{ base: "44px", md: "48px" }}
                px={{ base: 4, md: 6 }}
                _hover={{ bg: "#1a1a1a", borderColor: "#555555" }}
                _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
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
                bg="transparent"
                color="#888888"
                borderColor="#333333"
                borderWidth="1px"
                borderRadius="8px"
                fontSize={{ base: "14px", md: "16px" }}
                fontWeight="extrabold"
                h={{ base: "44px", md: "48px" }}
                px={{ base: 4, md: 6 }}
                _hover={{ bg: "#1a1a1a", borderColor: "#555555" }}
              >
                New Game
              </Button>
            </HStack>
          </VStack>

          {currentHint && (
            <Alert
              status="info"
              borderRadius="8px"
              bg="#1a1a1a"
              border="1px solid #333333"
              color="#ffffff"
            >
              <AlertIcon color="#888888" />
              <AlertTitle
                color="#ffffff"
                fontSize="16px"
                fontWeight="extrabold"
              >
                Hint:
              </AlertTitle>
              <AlertDescription
                ml={2}
                color="#888888"
                fontSize="16px"
                fontWeight="extrabold"
              >
                {currentHint}
              </AlertDescription>
            </Alert>
          )}

          {(gameState.gameWon || gameState.gameLost) && (
            <Alert
              status={gameState.gameWon ? "success" : "error"}
              borderRadius="8px"
              bg="#1a1a1a"
              border="1px solid #333333"
              color="#ffffff"
            >
              <AlertIcon color={gameState.gameWon ? "#00ff88" : "#ff4444"} />
              <AlertTitle
                color="#ffffff"
                fontSize="18px"
                fontWeight="extrabold"
              >
                {gameState.gameWon ? "You Won!" : "Game Over!"}
              </AlertTitle>
              <AlertDescription
                ml={2}
                color="#888888"
                fontSize="16px"
                fontWeight="extrabold"
              >
                {gameState.gameWon
                  ? `Correct! The answer was ${gameState.targetIterator?.name}.`
                  : `The correct answer was ${gameState.targetIterator?.name}.`}
              </AlertDescription>
              {(gameState.gameWon || gameState.gameLost) && (
                <Button
                  onClick={handleShare}
                  bg="#ffffff"
                  color="#0a0a0a"
                  borderColor="transparent"
                  borderWidth="1px"
                  borderRadius="8px"
                  fontSize="16px"
                  fontWeight="extrabold"
                  h="40px"
                  px={4}
                  ml="auto"
                  _hover={{ bg: "#f0f0f0" }}
                  _active={{ bg: "#e0e0e0" }}
                >
                  Share Results
                </Button>
              )}
            </Alert>
          )}

          {guessResults.length > 0 && (
            <Box w="full" maxW="1200px" px={4}>
              <Heading
                size="md"
                mb={6}
                color="#ffffff"
                fontWeight="extrabold"
                fontSize={{ base: "18px", md: "20px" }}
                textAlign="center"
              >
                Your Guesses:
              </Heading>
              <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                {guessResults.map((result, index) => (
                  <Box
                    key={index}
                    p={{ base: 3, md: 6 }}
                    border="1px solid #333333"
                    borderRadius="12px"
                    bg="#1a1a1a"
                    transition="all 0.2s ease"
                    _hover={{ bg: "#222222" }}
                  >
                    <Text
                      fontWeight="extrabold"
                      mb={{ base: 3, md: 4 }}
                      color="#ffffff"
                      fontSize={{ base: "16px", md: "18px" }}
                    >
                      Guess {index + 1}: {gameState.guesses[index]}
                    </Text>
                    <Grid
                      templateColumns={{
                        base: "repeat(2, 1fr)",
                        md: "repeat(auto-fit, minmax(150px, 1fr))",
                      }}
                      gap={{ base: 3, md: 6 }}
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
                          <GridItem
                            key={key}
                            bg={
                              getFeedbackColor(value as any) === "green"
                                ? "#00ff88"
                                : getFeedbackColor(value as any) === "yellow"
                                ? "#ffaa00"
                                : getFeedbackColor(value as any) === "red"
                                ? "#ff4444"
                                : getFeedbackColor(value as any) === "orange"
                                ? "#ff8800"
                                : getFeedbackColor(value as any) === "purple"
                                ? "#aa44ff"
                                : "#333333"
                            }
                            borderRadius="8px"
                            p={{ base: 2, md: 3 }}
                          >
                            <Text
                              fontSize={{ base: "12px", md: "14px" }}
                              color="#0a0a0a"
                              mb={{ base: 1, md: 2 }}
                              fontWeight="extrabold"
                            >
                              {key
                                .replace(/([A-Z])/g, " $1")
                                .trim()
                                .toLowerCase()
                                .replace(/^./, (c) => c.toUpperCase())}
                              :
                            </Text>
                            <Text
                              fontSize={{ base: "12px", md: "14px" }}
                              color="#0a0a0a"
                              fontWeight="extrabold"
                            >
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

          <Box
            textAlign="center"
            color="#888888"
            fontSize={{ base: "14px", md: "16px" }}
            fontWeight="extrabold"
            px={4}
          >
            <Text mb={2}>
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
