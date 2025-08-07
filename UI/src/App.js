import  { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

// requiring Components
import Login from "./Page/Login";
import Register from "./Page/Register";
import DashBoard from "./DashBoard";
import Header from "./Component/Header";
import Footer from "./Component/Footer";

// Separate LoginWrapper to use navigate inside
function LoginWrapper({ onLogin, onShowRegister }) {
  const navigate = useNavigate();
  const handleLogin = () => {
    console.log("login successfully");
    onLogin();
    navigate("/DashBoard"); // redirect on successful login
  };
  return <Login onLogin={handleLogin} onShowRegister={onShowRegister} />;
}

function App() {
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = () => {
    // Can do extra things here if needed
  };

  const handleRegister = () => {
    setShowRegister(false); // Go back to login after registration
  };

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            showRegister ? (
              <Register onRegister={handleRegister} />
            ) : (
              <LoginWrapper
                onLogin={handleLogin}
                onShowRegister={() => setShowRegister(true)}
              />
            )
          }
        />
        <Route path="/DashBoard" element={<DashBoard />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
export default App;
