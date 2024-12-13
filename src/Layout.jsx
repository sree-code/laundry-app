import React from "react";
import Navbar from "./pages/Navbar";
import Footer from "./pages/Footer";
import "./pages/css/Layout.css";

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

export default Layout;
