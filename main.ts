import { PORT, HOST, app } from "./bootstrap.ts";
import homeRouter from "./core/modules/home/routes/homeRoute.ts";
import loginRouter from "./core/modules/auth/login/cms/routes/loginRoute.ts";
import registerRouter from "./core/modules/auth/register/cms/routes/registerRoute.ts";
import recoveryPasswordRouter from "./core/modules/auth/recovery_password/cms/routes/recoveryPasswordRoute.ts";
import contentRouter from "./core/modules/admin/content/routes/contentRoute.ts";
import themeBoostrapRouter from "./core/themes/bootstrap/routes/boostrapRoute.ts";
import { Session } from "session";
import unknownPages from "./core/modules/unknownPages/routes/unknownPagesRoute.ts";

const session = new Session({ framework: "oak" });
await session.init();

/**
 * Public routes
 */

app.use(session.use()(session));
app.use(homeRouter.routes());
app.use(loginRouter.routes());
app.use(registerRouter.routes());
app.use(recoveryPasswordRouter.routes());

/**
 * Themes routes
 */

app.use(themeBoostrapRouter.routes());

/**
 * Admin routes
 */
app.use(contentRouter.routes());

/**
 * Unknown routes
 */

app.use(await unknownPages);

console.log(`Listening on port ${HOST}:${PORT}`);

await app.listen({ hostname: HOST, port: PORT });
