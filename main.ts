import { PORT, HOST, app } from "./bootstrap.ts";
import homeRouter from "./core/modules/home/routes/homeRoute.ts";
import loginRouter from "./core/modules/auth/login/cms/routes/loginRoute.ts";
import registerRouter from "./core/modules/auth/register/cms/routes/registerRoute.ts";
import recoveryPasswordRouter from "./core/modules/auth/recovery_password/cms/routes/recoveryPasswordRoute.ts";

app.use(homeRouter.routes());
app.use(loginRouter.routes());
app.use(registerRouter.routes());
app.use(recoveryPasswordRouter.routes());

console.log(`Listening on port ${HOST}:${PORT}`);

await app.listen({ hostname: HOST, port: PORT });
