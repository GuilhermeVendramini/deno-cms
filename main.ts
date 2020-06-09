import { PORT, HOST, app } from "./bootstrap.ts";
import homeRouter from "./core/modules/home/routes/homeRoute.ts";
import loginRouter from "./core/modules/auth/login/cms/routes/loginRoute.ts";

app.use();
app.use(homeRouter.routes());
app.use(loginRouter.routes());

console.log(`Listening on port ${HOST}:${PORT}`);

await app.listen({ hostname: HOST, port: PORT });
