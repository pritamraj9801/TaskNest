import React, { useState } from "react";
import CryptoJS from "crypto-js";

export default function Login({ onLogin, onShowRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const getMasterSecretKeyFromServer = async () => {
    const response = await fetch(
      `http://localhost:3001/api/MasterSecretKey?email=${email}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    const data = await response.json();
    const secretKeyWithoutDecr = data.encryptedSecretKey;
    const descSecretKey = CryptoJS.AES.decrypt(
      secretKeyWithoutDecr,
      password
    ).toString(CryptoJS.enc.Utf8);
    // we will store this in local storage
    localStorage.setItem("SecretKey", descSecretKey);
  };

  const handleLogin = async () => {
    const response = await fetch("http://localhost:3001/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      // when login completed we will have to get the encrypted clientsecret from the server
      getMasterSecretKeyFromServer();
      localStorage.setItem("token", data.token);
      onLogin();
    } else {
      alert(data.message);
    }
  };
  return (
    <div id="loginContainer">
      <div id="loginBox"  className="p-1">
        <h2 className="textCenter">Login</h2>
        <div className="mtb-1">
          <label>Email</label>
          <br />
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mtb-1">
          <label>Password</label>
          <br />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <button onClick={handleLogin}>Sign In</button>
          <br />
          <button onClick={onShowRegister}>
            Don't have an account? Register
          </button>
        </div>
      </div>
    </div>
  );
}
