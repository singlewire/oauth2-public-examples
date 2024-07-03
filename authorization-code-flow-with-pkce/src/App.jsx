import React, { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import OAuthRedirect from "./components/OAuthRedirect";
import Home from "./components/Home";

function App() {
  const [token, setToken] = useState("");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home token={token} />} />
        <Route path="/oauth" element={<OAuthRedirect setToken={setToken} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
