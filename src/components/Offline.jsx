const Offline = () => (
  <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center">
    <img
      src="/offline.png"
      alt="Offline"
      className="img-fluid mb-4"
      style={{ maxWidth: "300px" }}
    />

    <h1 className="display-4">🔌 You're Offline</h1>
    <p className="lead">Please check your internet connection and try again.</p>
  </div>
);

export default Offline;
