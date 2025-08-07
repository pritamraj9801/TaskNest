import React, { useEffect, useState } from "react";
import CryptoJS from "crypto-js";

export default function DashBoard() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
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
  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div id="dashboardContainer">
      <div style={{ display: "flex", justifyContent: "space-between" }}></div>
      <input
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="Enter task"
        id="taskInput"
      />
      <button onClick={addTask} id="addTaskBtn">
        Add
      </button>
      <ul id="taskList">
        {tasks.map((t) => {
          const secretKey = localStorage.getItem("SecretKey");
          const decryptedName = CryptoJS.AES.decrypt(
            t.taskName,
            secretKey
          ).toString(CryptoJS.enc.Utf8);
          const taskCreatedDate = new Date(t.createdDate);
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
            <li key={t._id} id="taskItemContainer">
              <div id="taskItemBox">
                <span>
                  <span className="taskDate">
                    {taskCreatedDate.toLocaleDateString()}{" "}
                    {taskCreatedDate.toLocaleTimeString()}
                    &nbsp;&gt;
                  </span>
                  <br/>
                  <span className={spanClass}>
                    &nbsp;<span className="greenDot"></span>&nbsp;
                    {decryptedName}</span>
                </span>
              </div>
              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={() => startTask(t._id)}
                  className="inProgressBtn actionBtn"
                >
                  In Progress
                </button>
                <button
                  onClick={() => completeTask(t._id)}
                  className="completeBtn actionBtn"
                >
                  Completed
                </button>
                <button
                  onClick={() => deleteTask(t._id)}
                  className="deleteBtn actionBtn"
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
