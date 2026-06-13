const axios = require("axios");
const login = async () => {
  const res = await axios.post("http://localhost:8080/api/v1/auth/login", {
    email: "instructor1@example.com",
    password: "password123"
  });
  return res.data.data.token;
};
const getCourses = async (token) => {
  const res = await axios.get("http://localhost:8080/api/v1/instructor/courses", {
    headers: { Authorization: "Bearer " + token }
  });
  console.log(JSON.stringify(res.data, null, 2));
};
login().then(getCourses).catch(console.error);
