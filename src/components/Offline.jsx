import { MdSignalWifiOff } from "react-icons/md";
import { motion } from "framer-motion";

const Offline = () => {
  return (
    <div className="offline-wrapper">
      {/* Wi-Fi Icon with soft bounce */}
      <motion.div
        className="offline-icon"
        animate={{
          y: [0, -10, 0],
          opacity: [0.9, 1, 0.9],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <MdSignalWifiOff size={80} />
      </motion.div>

      {/* Heading */}
      <motion.h1
        className="offline-title"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        You're Offline
      </motion.h1>

      {/* Message */}
      <motion.p
        className="offline-message"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        {" "}
        Check your internet connection and try again!
        <button
          className="btn btn-outline-success text-sucess mt-3"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </motion.p>
    </div>
  );
};

export default Offline;
