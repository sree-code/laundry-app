import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Login.css";

const LoginRegister = () => {
  const [selection, setSelection] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      if (loginMethod === "password") {
        if (email === "siva@gmail.com" && password === "siva123") {
          navigate("/home");
        } else {
          setError("Invalid credentials");
        }
      } else {
        // Add OTP login logic here
        if (otp === "1234") {
          navigate("/home");
        } else {
          setError("Invalid credentials");
        }
      }
    } else {
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }
      console.log("Registering with", {
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
      });
      // Add registration logic here
      history.push("/login");
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  const handleSelection = (type) => {
    setSelection(type);
    setIsLogin(type !== "register");
  };

  const handleLoginMethodChange = (method) => {
    setLoginMethod(method);
  };

  return (
    <div className="container">
      <div className="login-page">
        <h1 className="app-title">Go Laundry</h1>
        {!selection ? (
          <div className="selection-card">
            <button
              onClick={() => handleSelection("user")}
              className="selection-button"
            >
              Login as User
            </button>
            <button
              onClick={() => handleSelection("vendor")}
              className="selection-button"
            >
              Login as Vendor
            </button>
            <button
              onClick={() => handleSelection("register")}
              className="selection-button"
            >
              Register as New User
            </button>
          </div>
        ) : (
          <section className="login-card">
            <p className="authenticate-text">
              {isLogin ? `Login as ${selection}` : "Register a new account"}
            </p>
            {isLogin && selection === "user" && (
              <div className="login-method">
                <button
                  onClick={() => handleLoginMethodChange("password")}
                  className={`selection-button ${
                    loginMethod === "password" ? "active" : ""
                  }`}
                >
                  Login with Password
                </button>
                <button
                  onClick={() => handleLoginMethodChange("otp")}
                  className={`selection-button ${
                    loginMethod === "otp" ? "active" : ""
                  }`}
                >
                  Login with OTP
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {isLogin && loginMethod === "password" && (
                <div className="form-group">
                  <label htmlFor="password">Password:</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              )}
              {isLogin && loginMethod === "otp" && (
                <div className="form-group">
                  <label htmlFor="otp">OTP:</label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
              )}
              {!isLogin && (
                <>
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="firstName">First Name:</label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name:</label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phoneNumber">Phone Number:</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
              {error && <p className="error-message">{error}</p>}
              <button type="submit" className="submit-button">
                {isLogin ? "Login" : "Register"}
              </button>
            </form>
            <button
              onClick={() => setSelection(null)}
              className="toggle-button"
            >
              Back to Selection
            </button>
          </section>
        )}
      </div>
    </div>
  );
};

export default LoginRegister;
