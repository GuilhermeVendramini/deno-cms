export default {
  async deleteFile(url: string) {
    let path: any = url.replace(/\/$/, "").split("/");
    let currentPath: string;

    for (let i: number = path.length; i > 3; i--) {
      path.splice(i, 1);
      currentPath = path.join("/");

      try {
        await Deno.remove(`${Deno.cwd()}/${currentPath}`);
      } catch (_) {
        break;
      }
    }
    return true;
  },
};
