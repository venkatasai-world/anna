import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";


import Navbar from "./components/Navabar.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import Chat from "./components/Chat.jsx";
import { getToken } from "./components/auth.js";

export default function App() {
  const [token, setToken] = useState(getToken());

  return (
    <BrowserRouter>
      <Navbar token={token} setToken={setToken} />
         <ToastContainer />
      <Routes>
        {!token && <Route path="/login" element={<Login setToken={setToken} />} />}
        {!token && <Route path="/register" element={<Register />} />}
        <Route path="/chat" element={<Chat token={token} />} />
        <Route path="*" element={<Navigate to="/chat" />} />
      </Routes>
    </BrowserRouter>
  );
}
