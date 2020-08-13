import { assertEquals } from "testing";
import { PORT, HOST, app } from "../../../../../bootstrap.ts";
import { Session } from "session";
import loginRouter from "../cms/routes/loginRoute.ts";
import { renderFileToString } from "dejs";

async function createMockSession() {
  const session: Session = new Session({ framework: "oak" });
  await session.init();
  app.use(session.use()(session));
}

async function createMockLoginResponse(): Promise<string> {
  return await renderFileToString(
    `${Deno.cwd()}${Deno.env.get("THEME")}templates/auth/loginView.ejs`,
    {
      message: "",
    }
  );
}

Deno.test({
  name: "login(context: Record<string, any>)",
  async fn() {
    await createMockSession();
    const mockResponse = await createMockLoginResponse();
    const controller = new AbortController();

    app.use(loginRouter.routes());

    const p = app.listen({
      hostname: HOST,
      port: PORT,
      signal: controller.signal,
    });

    const response = await fetch(`http://${HOST}:${PORT}/login`);
    const responseText = await response?.text();

    assertEquals(responseText, mockResponse);

    controller.abort();
    await p;
  },
});
