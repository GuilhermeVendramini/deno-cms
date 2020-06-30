export default {
  async getAssets(context: Record<string, any>) {
    const file = context.params.file;
    context.response.body = await Deno.readFile(
      `${Deno.cwd()}/core/modules/media/assets/js/${file}`,
    );
  },
  async getFile(context: Record<string, any>) {
    const type = context.params.type;
    const y = context.params.y;
    const m = context.params.m;
    const d = context.params.d;
    const hour = context.params.hour;
    const min = context.params.min;
    const sec = context.params.sec;
    const key = context.params.key;
    const file = context.params.file;
    context.response.body = await Deno.readFile(
      `${Deno.cwd()}/files/media/${type}/${y}/${m}/${d}/${hour}/${min}/${sec}/${key}/${file}`,
    );
  },
  async getTempFile(context: Record<string, any>) {
    const file = context.params.file;
    context.response.body = await Deno.readFile(
      `${Deno.cwd()}/temp_uploads/${file}`,
    );
  },
};
