import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";

export default function DashBoard() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const navigate = useNavigate();
  // the secret key is static, for all user but we will have to create it user specific...
  // But how 🤔

  const fetchTasks = async () => {
    const res = await fetch("http://localhost:3001/api/tasks", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    setTasks(data);
  };

  const addTask = async () => {
    if (!newTask.trim()) return;

    // we will have to encrypt the newtask here at the client side before sending it to the server

    const encryptedTask = CryptoJS.AES.encrypt(
      newTask,
      localStorage.getItem("SecretKey")
    ).toString();

    await fetch("http://localhost:3001/api/addTask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ text: encryptedTask }),
    });
    setNewTask("");
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await fetch(`http://localhost:3001/api/tasks/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    fetchTasks();
  };
const startTask = async (id) => {
  await fetch(`http://localhost:3001/api/tasks/${id}/start`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  fetchTasks();
};

const completeTask = async (id) => {
  await fetch(`http://localhost:3001/api/tasks/${id}/complete`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  fetchTasks();
};


  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/"); // Navigate back to login
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Task Manager</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <input
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="Enter task"
      />
      <button onClick={addTask}>Add</button>
      <ul>
        {tasks.map((t) => {
          const secretKey = localStorage.getItem("SecretKey");
          const decryptedName = CryptoJS.AES.decrypt(
            t.taskName,
            secretKey
          ).toString(CryptoJS.enc.Utf8);

          // Set class based on taskStatus
          let spanClass = "";
          if (t.taskStatus.name === "Completed") {
            spanClass = "completed";
          } else if (t.taskStatus.name === "In Progress") {
            spanClass = "in-progress";
          } else {
            spanClass = "pending";
          }

          return (
            <li key={t._id}>
              <span className={spanClass}>{decryptedName}</span>
              <button onClick={() => startTask(t._id)}>In Progress</button>
              <button onClick={() => completeTask(t._id)}>Completed</button>
              <button onClick={() => deleteTask(t._id)}>Delete</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
