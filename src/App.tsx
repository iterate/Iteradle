import { ChakraProvider } from "@chakra-ui/react";
import IteradleGame from "./components/IteradleGame";

function App() {
  return (
    <ChakraProvider>
      <IteradleGame />
    </ChakraProvider>
  );
}

export default App;
