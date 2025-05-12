import { RiWifiOffFill } from "react-icons/ri";

const Offline = () => (
  <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center">
    <RiWifiOffFill size={80} color="#dc3545" className="mb-4" />
    <h1 className="display-4 fw-bold">You're Offline</h1>
    <p className="lead">Please check your internet connection and try again.</p>
  </div>
);

export default Offline;
