import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { getAdminLoginStatus } from "./utils/localStorageUtils";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import ItemMaster from "./pages/Masters/ItemMaster";
import CustomerMaster from "./pages/Masters/CustomerMaster";
import StockMaster from "./pages/Masters/StockMaster";
import UserMaster from "./pages/Masters/UserMaster";
import Inward from "./pages/Transactions/Inward";
import OnRentReturn from "./pages/Transactions/OnRentReturn";
import Payment from "./pages/Transactions/Payment";
import OnRent from "./pages/Transactions/OnRent";
import CustomerReports from "./pages/Reports/CustomerReports";

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = getAdminLoginStatus();
  return isLoggedIn ? children : <Navigate to="/" replace />;
};

const App = () => {
  const [isLoggedIn] = useState(getAdminLoginStatus());

  return (
    <>
      <Router>
        <Routes>
          {/* Root route always goes to login */}
          <Route path="/" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Default route to item-master */}
            <Route
              index
              element={<Navigate to="masters/item-master" replace />}
            />

            {/* Masters routes */}
            <Route path="masters/item-master" element={<ItemMaster />} />
            <Route
              path="masters/customer-master"
              element={<CustomerMaster />}
            />
            <Route path="masters/usermaster" element={<UserMaster />} />
            <Route path="masters/stockmaster" element={<StockMaster />} />

            {/* Transactions routes */}
            <Route path="transactions/inward" element={<Inward />} />
            <Route path="transactions/onrent" element={<OnRent />} />
            <Route
              path="transactions/onrentreturn"
              element={<OnRentReturn />}
            />
            <Route path="transactions/payment" element={<Payment />} />
            <Route
              path="reports/customerreports"
              element={<CustomerReports />}
            />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <ToastContainer
        style={{ width: "400px" }}
        position="top-right"
        autoClose={1000000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default App;
