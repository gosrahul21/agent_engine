"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var dotenv = require("dotenv");
var cors = require("cors");
var connection_1 = require("./modals/connection");
var chatRouter_1 = require("./router/chatRouter");
var middleware_1 = require("./validators/middleware");
dotenv.config();
var app = express();
app.use(cors());
app.use(express.json());
app.use((0, middleware_1.sanitize)());
(0, connection_1.connectDB)();
// Routes
app.use("/api/chatbots", chatRouter_1.chatRouter);
app.get("/", function (req, res) {
    res.send("Hello World");
});
// Error handling
app.use(middleware_1.validationErrorHandler);
var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log("Server is running on port ".concat(PORT));
});
//# sourceMappingURL=index.js.map