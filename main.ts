import { PORT, HOST, app } from "./bootstrap.ts";
import homeRouter from "./core/modules/home/routes/homeRoute.ts";
import loginRouter from "./core/modules/auth/login/cms/routes/loginRoute.ts";
import loginAPIRouter from "./core/modules/auth/login/api/routes/loginRoute.ts";
import registerRouter from "./core/modules/auth/register/cms/routes/registerRoute.ts";
import registerAPIRouter from "./core/modules/auth/register/api/routes/registerRoute.ts";
import recoveryPasswordRouter from "./core/modules/auth/recovery_password/cms/routes/recoveryPasswordRoute.ts";
import adminRouter from "./core/modules/admin/routes/adminRoute.ts";
import usersRouter from "./core/modules/users/cms/routes/usersRoute.ts";
import usersAPIRouter from "./core/modules/users/api/routes/usersRoute.ts";
import themeBoostrapRouter from "./core/themes/bootstrap/routes/boostrapRoute.ts";
import { Session } from "session";
import unknownPages from "./core/modules/unknownPages/routes/unknownPagesRoute.ts";
import basicPageRouter from "./core/modules/basic_page/cms/routes/entityRoute.ts";
import basicPageAPIRouter from "./core/modules/basic_page/api/routes/entityRoute.ts";
import articleRouter from "./core/modules/article/cms/routes/entityRoute.ts";
import articleAPIRouter from "./core/modules/article/api/routes/entityRoute.ts";
import tagsRouter from "./core/modules/tags/cms/routes/entityRoute.ts";
import tagsAPIRouter from "./core/modules/tags/api/routes/entityRoute.ts";
import categoriesRouter from "./core/modules/categories/cms/routes/entityRoute.ts";
import categoriesAPIRouter from "./core/modules/categories/api/routes/entityRoute.ts";
import librariesRoute from "./libraries/librariesRoute.ts";
import entityReferenceRouter from "./core/modules/entity_reference/routes/entityReferenceRoute.ts";
import mediaRouter from "./core/modules/media/cms/routes/mediaRoute.ts";
import mediaAPIRouter from "./core/modules/media/api/routes/mediaRoute.ts";
import imageAPIRouter from "./core/modules/image/api/routes/entityRoute.ts";
import imageRouter from "./core/modules/image/cms/routes/entityRoute.ts";
import videoAPIRouter from "./core/modules/video/api/routes/entityRoute.ts";
import videoRouter from "./core/modules/video/cms/routes/entityRoute.ts";
import basicBlockAPIRouter from "./core/modules/basic_block/api/routes/entityRoute.ts";
import basicBlockRouter from "./core/modules/basic_block/cms/routes/entityRoute.ts";
import landingPageAPIRouter from "./core/modules/landing_page/api/routes/entityRoute.ts";
import landingPageRouter from "./core/modules/landing_page/cms/routes/entityRoute.ts";
import mainMenuAPIRouter from "./core/modules/main_menu/api/routes/entityRoute.ts";
import mainMenuRouter from "./core/modules/main_menu/cms/routes/entityRoute.ts";
import footerAPIRouter from "./core/modules/footer/api/routes/entityRoute.ts";
import footerRouter from "./core/modules/footer/cms/routes/entityRoute.ts";


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
app.use(basicPageAPIRouter.routes());
app.use(articleAPIRouter.routes());
app.use(tagsAPIRouter.routes());
app.use(categoriesAPIRouter.routes());
app.use(imageAPIRouter.routes());
app.use(videoAPIRouter.routes());
app.use(mediaAPIRouter.routes());
app.use(basicBlockAPIRouter.routes());
app.use(landingPageAPIRouter.routes());
app.use(mainMenuAPIRouter.routes());
app.use(footerAPIRouter.routes());

/**
 * Themes routes
 */

app.use(themeBoostrapRouter.routes());

/**
 * Admin routes
 */

app.use(adminRouter.routes());
app.use(usersRouter.routes());
app.use(mediaRouter.routes());

/**
 * Content types
 */

app.use(basicPageRouter.routes());
app.use(articleRouter.routes());
app.use(landingPageRouter.routes());

/**
 * Taxonomy types
 */

app.use(tagsRouter.routes());
app.use(categoriesRouter.routes());

/**
 * Menu Types
 */

app.use(mainMenuRouter.routes());
app.use(footerRouter.routes());

/**
 * Libraries
 */

app.use(librariesRoute.routes());

/**
 * Entity Reference
 */

app.use(entityReferenceRouter.routes());

/**
 * Media types
 */

app.use(imageRouter.routes());
app.use(videoRouter.routes());

/**
 * Block Types
 */

app.use(basicBlockRouter.routes());

/**
 * Unknown routes
 */

app.use(unknownPages);

console.log(`Listening on port ${HOST}:${PORT}`);

await app.listen({ hostname: HOST, port: PORT });
