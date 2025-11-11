import * as express from "express";
import * as dotenv from "dotenv";
import * as cors from "cors";
import { connectDB } from "./modals/connection";
import { chatRouter } from "./router/chatRouter";
import { authRouter } from "./router/authRouter";
import { publicRouter } from "./router/publicRouter";
import { sanitize, validationErrorHandler } from "./validators/middleware";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(sanitize());

connectDB();

// Routes
app.use("/api/chatbots", chatRouter);
app.use("/auth", authRouter); // Proxy auth requests to auth service
app.use("/api/public", publicRouter); // Public endpoints for embedded chatbots

app.get("/", (req: express.Request, res: express.Response) => {
  res.send("Hello World - Chat Agent with Auth Proxy");
});

// Error handling
app.use(validationErrorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});