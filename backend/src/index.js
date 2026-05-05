import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import scanRoutes from "./routes/scan.routes.js"

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/scan", scanRoutes)
app.get("/", (req, res) => {
  res.json({ message: "Web OSINT Scanner API running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});