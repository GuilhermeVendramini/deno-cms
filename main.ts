import { PORT, HOST, app } from "./bootstrap.ts";
import homeRouter from "./core/modules/home/routes/homeRoute.ts";
import loginRouter from "./core/modules/auth/login/cms/routes/loginRoute.ts";
import loginAPIRouter from "./core/modules/auth/login/api/routes/loginRoute.ts";
import registerRouter from "./core/modules/auth/register/cms/routes/registerRoute.ts";
import registerAPIRouter from "./core/modules/auth/register/api/routes/registerRoute.ts";
import recoveryPasswordRouter from "./core/modules/auth/recovery_password/cms/routes/recoveryPasswordRoute.ts";
import contentRouter from "./core/modules/admin/content/routes/contentRoute.ts";
import usersRouter from "./core/modules/admin/users/cms/routes/usersRoute.ts";
import usersAPIRouter from "./core/modules/admin/users/api/routes/usersRoute.ts";
import themeBoostrapRouter from "./core/themes/bootstrap/routes/boostrapRoute.ts";
import { Session } from "session";
import unknownPages from "./core/modules/unknownPages/routes/unknownPagesRoute.ts";
import basicPageRouter from "./core/modules/admin/basic_page/cms/routes/basicPageRoute.ts";
import librariesRoute from "./libraries/librariesRoute.ts";

const session = new Session({ framework: "oak" });
await session.init();

/**
 * Public CMS routes
 */

app.use(session.use()(session));
app.use(homeRouter.routes());
app.use(loginRouter.routes());
app.use(registerRouter.routes());
app.use(recoveryPasswordRouter.routes());

/**
 * API routes
 */

app.use(registerAPIRouter.routes());
app.use(usersAPIRouter.routes());
app.use(loginAPIRouter.routes());

/**
 * Themes routes
 */

app.use(themeBoostrapRouter.routes());

/**
 * Admin routes
 */

app.use(contentRouter.routes());
app.use(usersRouter.routes());

/**
 * Content types
 */

app.use(basicPageRouter.routes());

/**
 * Libraries
 */

app.use(librariesRoute.routes());

/**
 * Unknown routes
 */

app.use(unknownPages);

console.log(`Listening on port ${HOST}:${PORT}`);

await app.listen({ hostname: HOST, port: PORT });
