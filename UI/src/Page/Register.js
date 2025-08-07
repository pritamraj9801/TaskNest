import React, { useState } from "react";
import CryptoJS from "crypto-js";

export default function Register({ onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const storeMasterSecretKeyToServer = async (encryptedSecretKey) => {
    const response = await fetch("http://localhost:3001/api/MasterSecretKey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, encryptedSecretKey }),
    });
    const data = await response.json();
  };
  const handleRegister = async () => {
    const response = await fetch("http://localhost:3001/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await response.json();

    if (response.ok) {
      // if the registeration is completed, we will create the secret key for that particular user
      const secretKey = CryptoJS.lib.WordArray.random(32).toString(); // secret key for that particular user
      // encrypting the secretKey with the password of the user
      const encryptedSecretKey = CryptoJS.AES.encrypt(
        secretKey,
        password
      ).toString();

      // Now we have secret key and encrypted secret key,
      // we will have to store the encrypted secret key at the server
      storeMasterSecretKeyToServer(encryptedSecretKey);

      onRegister(); // Notify parent component
    } else {
      alert(data.message);
    }
  };

  return (
    <div>
      <div>
        <label>Name</label>
        <br />
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        ></input>
      </div>
      <div>
        <label>Email</label>
        <br />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label>Password</label>
        <br />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button onClick={handleRegister}>Register</button>
      <button>Back to SignIn</button>
    </div>
  );
}
