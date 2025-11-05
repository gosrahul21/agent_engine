import * as express from "express";
import * as dotenv from "dotenv";
import * as cors from "cors";
import { connectDB } from "./modals/connection";
import { chatRouter } from "./router/chatRouter";
import { sanitize, validationErrorHandler } from "./validators/middleware";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(sanitize());

connectDB();

// Routes
app.use("/api/chatbots", chatRouter);

app.get("/", (req: express.Request, res: express.Response) => {
  res.send("Hello World");
});

// Error handling
app.use(validationErrorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});