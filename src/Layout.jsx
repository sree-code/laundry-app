import React from "react";
import Navbar from "./pages/Navbar";
import Footer from "./pages/Footer";


function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default Layout;
