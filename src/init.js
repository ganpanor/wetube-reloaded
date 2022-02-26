import "dotenv/config"; // 가능한 한 제일 앞부분에
import "./db";
import "./models/Video";
import "./models/User";
import "./models/Comment";
import app from "./server";

const PORT = 4000;

const handleListening = () =>
  console.log("Server listening on port http://localhost:4000/");

app.listen(PORT, handleListening);
