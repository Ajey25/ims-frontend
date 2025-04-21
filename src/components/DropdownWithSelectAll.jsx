// import React, { useState, useEffect } from "react";
// import Select from "react-select";
// // import axios from "axios";

// const MultiSelectDropInput = ({
//   label = "Select Items",
//   value = [],
//   onMultiSelect,
//   noDataMessage = "No data available",
//   maxMenuHeight = 200,
//   isClearable = false,
//   placeholder = "Select",
//   customError,
// }) => {
//   const [isFocused, setIsFocused] = useState(false);
//   const [selectedOptions, setSelectedOptions] = useState(value);
//   const [options, setOptions] = useState([]); // API data
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch options from API
//   useEffect(() => {
//     const fetchOptions = async () => {
//       try {
//         setLoading(true);
//         const response = await get("https://dummyjson.com/products"); // Replace with actual API
//         const fetchedOptions = response.data.map((item) => ({
//           label: item.name,
//           value: item.id,
//         }));
//         setOptions(fetchedOptions);
//       } catch (err) {
//         setError("Failed to fetch options");
//         console.error("Error fetching options:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOptions();
//   }, []);

//   const isAllSelected =
//     selectedOptions.length === options.length && options.length > 0;

//   // Show "Select All" only if there are other options available
//   const customOptions =
//     options.length > 0
//       ? [{ label: "Select All", value: "select_all" }, ...options]
//       : [];

//   const handleChange = (selected) => {
//     if (!selected || selected.length === 0) {
//       setSelectedOptions([]);
//       onMultiSelect([]);
//       return;
//     }

//     if (selected.some((opt) => opt.value === "select_all")) {
//       if (!isAllSelected) {
//         setSelectedOptions(options);
//         onMultiSelect(options);
//       } else {
//         setSelectedOptions([]);
//         onMultiSelect([]);
//       }
//     } else {
//       setSelectedOptions(selected);
//       onMultiSelect(selected);
//     }
//   };

//   return (
//     <div style={{ position: "relative", width: "100%" }}>
//       <div
//         style={{
//           position: "relative",
//           border: "1px solid #ccc",
//           borderRadius: "5px",
//           padding: "10px",
//           transition: "all 0.3s ease",
//           backgroundColor: "#fff",
//         }}
//       >
//         <Select
//           value={
//             selectedOptions.length === 0
//               ? null
//               : isAllSelected
//               ? [{ label: "Select All", value: "select_all" }]
//               : selectedOptions
//           }
//           onChange={handleChange}
//           options={customOptions}
//           onFocus={() => setIsFocused(true)}
//           onBlur={() => setIsFocused(false)}
//           placeholder={loading ? "Loading..." : placeholder}
//           isLoading={loading}
//           styles={{
//             control: (provided) => ({
//               ...provided,
//               border: "none",
//               boxShadow: "none",
//               minHeight: "40px",
//               fontSize: "14px",
//               cursor: "pointer",
//             }),
//             valueContainer: (provided) => ({
//               ...provided,
//               padding: "0 10px",
//               display: "flex",
//               flexWrap: "wrap",
//               alignItems: "center",
//               maxHeight: "60px",
//               overflowY: "auto",
//             }),
//             placeholder: (provided) => ({
//               ...provided,
//               fontSize: "14px",
//               color: "#999",
//             }),
//             dropdownIndicator: (provided) => ({
//               ...provided,
//               padding: "0 5px",
//             }),
//             menu: (provided) => ({
//               ...provided,
//               zIndex: 9999,
//             }),
//           }}
//           menuPortalTarget={document.body}
//           noOptionsMessage={() => (error ? error : noDataMessage)}
//           maxMenuHeight={maxMenuHeight}
//           isClearable={isClearable}
//           isMulti
//           closeMenuOnSelect={false}
//         />
//         <label
//           style={{
//             position: "absolute",
//             top: isFocused || selectedOptions.length > 0 ? "5px" : "50%",
//             left: "15px",
//             fontSize: isFocused || selectedOptions.length > 0 ? "12px" : "14px",
//             color: "#666",
//             transform:
//               isFocused || selectedOptions.length > 0
//                 ? "translateY(-50%)"
//                 : "translateY(0)",
//             transition: "all 0.3s ease",
//             backgroundColor: "#fff",
//             padding: "0 5px",
//           }}
//         >
//           {label}
//         </label>
//       </div>
//       {customError && (
//         <div style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
//           {customError}
//         </div>
//       )}
//     </div>
//   );
// };

// export default MultiSelectDropInput;
