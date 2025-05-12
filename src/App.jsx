import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import { SessionProvider } from "./components/SessionProvider";
import ItemMaster from "./pages/Masters/ItemMaster";
import CustomerMaster from "./pages/Masters/CustomerMaster";
import StockMaster from "./pages/Masters/StockMaster";
import UserMaster from "./pages/Masters/UserMaster";
import Inward from "./pages/Transactions/Inward";
import OnRentReturn from "./pages/Transactions/OnRentReturn";
import Payment from "./pages/Transactions/Payment";
import OnRent from "./pages/Transactions/OnRent";
import CustomerReports from "./pages/Reports/CustomerReports";
import CustomerCredits from "./pages/Masters/CustomerCredits";

// ProtectedRoute component that checks if user is authenticated
const ProtectedRoute = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          {/* Login route */}
          <Route path="/" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Default route inside /app */}
            <Route
              index
              element={<Navigate to="masters/item-master" replace />}
            />
            {/* Masters routes */}
            <Route path="masters/item-master" element={<ItemMaster />} />
            <Route
              path="masters/customer-master"
              element={<CustomerMaster />}
            />{" "}
            <Route
              path="masters/customercredits"
              element={<CustomerCredits />}
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
            {/* Reports route */}
            <Route
              path="reports/customerreports"
              element={<CustomerReports />}
            />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      <ToastContainer
        position="top-right"
        autoClose={4000}
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
