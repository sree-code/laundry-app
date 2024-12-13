import React, { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Home from "./pages/Home";
import Navbar from "./pages/Navbar";
import Footer from "./pages/Footer";
import Login from "./pages/LoginRegister.jsx";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Cart from "./pages/Cart.jsx";
import Layout from "./Layout.jsx";
import Ironing from "./pages/Ironing.jsx";
import SchedulePickup from "./pages/SchedulePickup";
import Submit from "./pages/Submit";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Layout>
      <Routes>
        <Route path="/" exact element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/ironing" element={<Ironing />} />
        <Route path="/schedule-pickup/:vendorId" element={<SchedulePickup />} />
        <Route path="/submit" element={<Submit />} />
      </Routes>
    </Layout>
  );
}

export default App;
