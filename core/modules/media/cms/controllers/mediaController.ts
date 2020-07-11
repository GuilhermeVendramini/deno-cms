export default {
  async getAssets(context: Record<string, any>) {
    let file = context.params.file;
    context.response.headers.set("Content-Type", "application/javascript");
    context.response.body = await Deno.readFile(
      `${Deno.cwd()}/core/modules/media/assets/js/${file}`,
    );
  },
  async getFile(context: Record<string, any>) {
    let type = context.params.type;
    let y = context.params.y;
    let m = context.params.m;
    let d = context.params.d;
    let hour = context.params.hour;
    let min = context.params.min;
    let sec = context.params.sec;
    let key = context.params.key;
    let file = context.params.file;
    context.response.body = await Deno.readFile(
      `${Deno.cwd()}/files/media/${type}/${y}/${m}/${d}/${hour}/${min}/${sec}/${key}/${file}`,
    );
  },
  async getTempFile(context: Record<string, any>) {
    let file = context.params.file;
    context.response.body = await Deno.readFile(
      `${Deno.cwd()}/temp_uploads/${file}`,
    );
  },
};
