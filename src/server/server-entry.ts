import { serve } from "@hono/node-server";
import app from "./server";

const server = serve({ ...app, port: 3090, hostname: "0.0.0.0" }, (info) => {
	console.log(`Server is running on ${info.address}:${info.port}`);
});

if (import.meta.hot) {
	import.meta.hot.accept(() => {
		server.close();
	});
}
