import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import GeneratePage from "./pages/GeneratePage/GeneratePage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/generate" element={<GeneratePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
