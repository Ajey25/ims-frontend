import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginImg from "../assets/login.jpg";
import { toast } from "react-toastify";
import Rocket from "../assets/rocket.gif";
import Lottie from "lottie-react";
import LoginAnimation from "../assets/loginani.json";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/userMaster/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please try again.");
      }

      // Store token in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      // Redirect to Item Master page
      console.log("Logged in successfully");
      navigate("/app/masters/item-master");
      toast.success(
        <div className="d-flex align-items-center" style={{ width: "300px" }}>
          <span>Welcome</span>
          <strong className="text-dark mx-2">{`${data.user.firstName} ${data.user.lastName}`}</strong>
          <img
            style={{ height: "30px", width: "30px", objectFit: "contain" }}
            src={Rocket}
            alt="rocket"
          />
        </div>
      );
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light px-4">
      <div
        className="row w-100 shadow-lg rounded-5 shadow-info overflow-hidden"
        style={{ maxWidth: "900px" }}
      >
        {/* Left Side - Image (hidden on small screens) */}
        <div className="col-12 col-md-6 p-0">
          <Lottie
            animationData={LoginAnimation}
            loop={true}
            style={{ width: "100%", height: "auto" }}
          />
        </div>

        {/* Right Side - Login Form */}
        <div className="col-md-6 bg-white p-4 d-flex flex-column justify-content-center">
          <h4 className="text-center mb-4 fw-bold">Admin Login</h4>

          {error && (
            <div className="alert alert-danger text-center" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
