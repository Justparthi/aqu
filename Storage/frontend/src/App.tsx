import LandingPage from "./modules/landing";
import HomePage from "./modules/home";

import React, { useState, useEffect } from "react";
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";

import {auth, provider} from "./modules/firebase.config";
import { onAuthStateChanged, User } from "firebase/auth";

import "./App.css";
import StaticPages from "./modules/static-pages";
import FilesSection from "./modules/FilesSection";
import Compute from "./modules/compute";

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [isCurrencyModified, setIsCurrencyModified] = useState<boolean>(false);

  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>("");
  const [currency, setCurrency] = useState<string>("inr");

  useEffect(() => {
    if(isCurrencyModified) {
      alert("Currency chosen to be displayed in billing: " + currency);
      localStorage.setItem("currency", currency);
      setIsCurrencyModified(false);
    }
  }, [isCurrencyModified]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      try {
        // Simply set the user and mark as verified
        if (user) {
          setUser(user);
          sessionStorage.setItem("isVerifiedAuth", "true");
        } else {
          sessionStorage.removeItem("isVerifiedAuth");
        }
      } catch(err) {
        setIsError(true);
        setError(String(err));
        sessionStorage.removeItem("isVerifiedAuth");
      } finally {
        setIsLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  if(!isLoading) {
    return (
      <Router>
        <Routes>
          <Route path="/" element = {
            isError
              ? <Navigate to="/error" />
              : user
                ? <Navigate to="/dashboard" />
                : <LandingPage auth={auth}
                    provider={provider} setCurrency={setCurrency} setIsCurrencyModified={setIsCurrencyModified} />
          } />
          
          <Route path="/dashboard" element = {
            isError
              ? <Navigate to="/error" />
              : !user
                ? <Navigate to="/" />
                : <HomePage user={user} />
          } />

          <Route path="/file" element = {
            <FilesSection />
          } />
          <Route path="/compute" element = {
            <Compute />
          } />

          <Route path="/docs" element = {
            <StaticPages page="developer-guide.md" />
          } />

          <Route path="/pricing-policies" element = {
            <StaticPages page="pricing.md" />
          } />

          <Route path="/about-us" element = {
            <StaticPages page="about.md" />
          } />

          <Route path="/contact-us" element = {
            <StaticPages page="contact.md" />
          } />

          <Route path="/terms-and-conditions" element = {
            <StaticPages page="terms.md" />
          } />

          <Route path="/privacy-policy" element = {
            <StaticPages page="privacy.md" />
          } />

          <Route path="/error" element = {
            <>
              <p style={{color: "red", fontSize: "21px", fontWeight: "bold"}}>{error}</p>
            </>
          } />
        </Routes>
      </Router>
    );
  }
  
  return <div>Loading...</div>;
}

export default App;