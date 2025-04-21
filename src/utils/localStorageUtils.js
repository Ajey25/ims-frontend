// utils/localStorageUtils.js
export const setAdminLoginStatus = (status) => {
  localStorage.setItem("adminLoggedIn", status ? "true" : "false");
};

export const getAdminLoginStatus = () => {
  return localStorage.getItem("token") === null ? false : true;
};

export const clearAdminLoginStatus = () => {
  localStorage.setItem("adminLoggedIn", "false");
};
