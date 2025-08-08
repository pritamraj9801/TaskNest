import React, { useEffect, useState } from "react";
import CryptoJS from "crypto-js";

export default function DashBoard() {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [isReOccurring, setIsReOccurring] = useState(false);
  const [newTask, setNewTask] = useState("");
  // the secret key is static, for all user but we will have to create it user specific...
  // But how 🤔

  const fetchTasks = async () => {
    fetchOverdueTasks();
    fetchPendingTasks();
    fetchCompletedTasks();
  };
  // getting all overdue tasks
  const fetchOverdueTasks = async () => {
    const res = await fetch("http://localhost:3001/api/overdueTasks", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    setOverdueTasks(data);
  };
  // getting all pending tasks
  const fetchPendingTasks = async () => {
    const res = await fetch("http://localhost:3001/api/pendingTasks", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    setPendingTasks(data);
  };
  // getting all completed tasks
  const fetchCompletedTasks = async () => {
    const res = await fetch("http://localhost:3001/api/completedTasks", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    setCompletedTasks(data);
  };

  const addTask = async () => {
    if (!newTask.trim()) return;

    // we will have to encrypt the newtask here at the client side before sending it to the server

    const encryptedTask = CryptoJS.AES.encrypt(
      newTask,
      localStorage.getItem("SecretKey")
    ).toString();

    let fromDate = document.getElementById("fromDateInput").value;
    let toDate = document.getElementById("toDateInput").value;
    await fetch("http://localhost:3001/api/addTask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ taskName: encryptedTask, fromDate, toDate, isReOccurring }),
    });
    setNewTask("");
    setIsReOccurring(false);
    fetchTasks();
        document.getElementById("fromDateInput").value = "";
    document.getElementById("toDateInput").value = "";
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
  // mark reoccuring task
  const MarkReOccuringTask = async () => {
    let elem = document.querySelector("#reoccuringBtn i");
    elem.classList.toggle("fa-repeat-active");
    if(isReOccurring){
      setIsReOccurring(false);
    }else{
      setIsReOccurring(true);
    }
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

  // display toggle functions
  const ShowPendingTasks = async () => {
    document
      .getElementById("pendingTasksList")
      .classList.remove("display-none");
    document.getElementById("completedTasksList").classList.add("display-none");
    document.getElementById("overdueTasksList").classList.add("display-none");
    document
      .getElementById("showPendingBtn")
      .classList.add("btnCategoryActive");
    document
      .getElementById("showCompletedBtn")
      .classList.remove("btnCategoryActive");
    document
      .getElementById("showOverDueBtn")
      .classList.remove("btnCategoryActive");
  };
  const ShowCompletedTasks = async () => {
    document
      .getElementById("completedTasksList")
      .classList.remove("display-none");
    document.getElementById("pendingTasksList").classList.add("display-none");
    document.getElementById("overdueTasksList").classList.add("display-none");
    document
      .getElementById("showCompletedBtn")
      .classList.add("btnCategoryActive");
    document
      .getElementById("showPendingBtn")
      .classList.remove("btnCategoryActive");
    document
      .getElementById("showOverDueBtn")
      .classList.remove("btnCategoryActive");
  };
  const ShowOverdueTasks = async () => {
    document
      .getElementById("overdueTasksList")
      .classList.remove("display-none");
    document.getElementById("pendingTasksList").classList.add("display-none");
    document.getElementById("completedTasksList").classList.add("display-none");
    document
      .getElementById("showOverDueBtn")
      .classList.add("btnCategoryActive");
    document
      .getElementById("showPendingBtn")
      .classList.remove("btnCategoryActive");
    document
      .getElementById("showCompletedBtn")
      .classList.remove("btnCategoryActive");
  };
  return (
    <div id="dashboardContainer">
      <div style={{ display: "flex", justifyContent: "space-between" }}></div>
      <input
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="Enter task"
        id="taskInput"
      />
      <div id="taskDetailBox">
        <div id="reOccuringDiv">
          <input id="fromDateInput" type="datetime-local" className="datetime-primary" />
          <input id="toDateInput" type="datetime-local"  className="datetime-primary" />
           <span id="reoccuringBtn" onClick={MarkReOccuringTask}>
            <i class="fa-solid fa-repeat"></i>
          </span>
        </div>
      </div>
      <button onClick={addTask} id="addTaskBtn">
        Add
      </button>
      <div id="tasksCategory">
        <button
          id="showPendingBtn"
          onClick={ShowPendingTasks}
          className="btnCategoryPrimary btnCategoryActive"
        >
          Pending
        </button>
        <button
          id="showCompletedBtn"
          onClick={ShowCompletedTasks}
          className="btnCategoryPrimary"
        >
          Completed
        </button>
        <button
          id="showOverDueBtn"
          onClick={ShowOverdueTasks}
          className="btnCategoryPrimary"
        >
          Overdue
        </button>
      </div>
      <ul id="completedTasksList" className="display-none taskList">
        {completedTasks.map((t) => {
          const secretKey = localStorage.getItem("SecretKey");
          const decryptedName = CryptoJS.AES.decrypt(
            t.taskName,
            secretKey
          ).toString(CryptoJS.enc.Utf8);
          const taskCreatedDate = new Date(t.createdDate);
          // Set class based on taskStatus
          let squareMark = "completed";

          return (
            <li key={t._id} id="taskItemContainer">
              <div id="taskItemBox">
                <span>
                  <span className="taskDate">
                    {taskCreatedDate.toLocaleDateString()}{" "}
                    {taskCreatedDate.toLocaleTimeString()}
                    &nbsp;&gt;
                  </span>
                  <br />
                  <span>
                    &nbsp;<span className={squareMark}></span>&nbsp;
                    {decryptedName}
                  </span>
                </span>
              </div>
              <div style={{ marginTop: "10px" }}>
                {/* <button
                  onClick={() => startTask(t._id)}
                  className="inProgressBtn actionBtn"
                >
                  In Progress
                </button> */}
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
      <ul id="overdueTasksList" className="display-none taskList">
        {overdueTasks.map((t) => {
          const secretKey = localStorage.getItem("SecretKey");
          const decryptedName = CryptoJS.AES.decrypt(
            t.taskName,
            secretKey
          ).toString(CryptoJS.enc.Utf8);
          const taskCreatedDate = new Date(t.createdDate);
          // Set class based on taskStatus
          let squareMark = "overdue";

          return (
            <li key={t._id} id="taskItemContainer">
              <div id="taskItemBox">
                <span>
                  <span className="taskDate">
                    {taskCreatedDate.toLocaleDateString()}{" "}
                    {taskCreatedDate.toLocaleTimeString()}
                    &nbsp;&gt;
                  </span>
                  <br />
                  <span>
                    &nbsp;<span className={squareMark}></span>&nbsp;
                    {decryptedName}
                  </span>
                </span>
              </div>
              <div style={{ marginTop: "10px" }}>
                {/* <button
                  onClick={() => startTask(t._id)}
                  className="inProgressBtn actionBtn"
                >
                  In Progress
                </button> */}
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
      <ul id="pendingTasksList" className="taskList">
        {pendingTasks.map((t) => {
          const secretKey = localStorage.getItem("SecretKey");
          const decryptedName = CryptoJS.AES.decrypt(
            t.taskName,
            secretKey
          ).toString(CryptoJS.enc.Utf8);
          const taskCreatedDate = new Date(t.createdDate);
          // Set class based on taskStatus
          let squareMark = "pending";

          return (
            <li key={t._id} id="taskItemContainer">
              <div id="taskItemBox">
                <span>
                  <span className="taskDate">
                    {taskCreatedDate.toLocaleDateString()}{" "}
                    {taskCreatedDate.toLocaleTimeString()}
                    &nbsp;&gt;
                  </span>
                  <br />
                  <span>
                    &nbsp;<span className={squareMark}></span>&nbsp;
                    {decryptedName}
                  </span>
                </span>
              </div>
              <div style={{ marginTop: "10px" }}>
                {/* <button
                  onClick={() => startTask(t._id)}
                  className="inProgressBtn actionBtn"
                >
                  In Progress
                </button> */}
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
