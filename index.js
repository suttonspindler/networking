import app from "./app.js";

//localhost on windows
const HOSTNAME = "0.0.0.0";
const PORT = 3000;

app.listen(PORT, HOSTNAME, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});
