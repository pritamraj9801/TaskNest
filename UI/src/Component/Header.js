import { useNavigate } from "react-router-dom";
export default function Header() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/"); // Navigate back to login
  };
  return (
    <header id="header">
      <div>
        <span id="siteName">TaskNest</span>
      </div>
      <div>{isLoggedIn && <button onClick={handleLogout} id="logoutBtn">Logout</button>}</div>
    </header>
  );
}
