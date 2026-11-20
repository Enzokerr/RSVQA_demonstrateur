import "./App.css";
import LandingPage from "./pages/LandingPage";
import Documentation from "./pages/Documentation";
import { BrowserRouter, Routes, Route } from "react-router";
import Demonstrateur from "./pages/Demonstrateur";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/demonstrateur" element={<Demonstrateur />} />
          <Route path="/documentation" element={<Documentation />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
