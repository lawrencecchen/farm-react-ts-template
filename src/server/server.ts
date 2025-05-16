import { Hono } from "hono";

const app = new Hono();

app.get("/api/hello", (c) => c.text("Hello Vite!"));

export default app;
