import { renderFileToString } from "dejs";
import contentRepository from "../../../../repositories/mongodb/content/contentRepository.ts";

export default {
  async content(context: Record<string, any>) {
    let content: any[] = [];
    let pageNumber: number = 0;
    let skip = 0;
    let limit = 4;
    let type: string | undefined;
    let published: any | undefined;

    if (context.request.url.searchParams.has("pageNumber")) {
      pageNumber = context.request.url.searchParams.get("pageNumber");
    }

    if (context.request.url.searchParams.has("type")) {
      type = context.request.url.searchParams.get("type");
    }

    if (context.request.url.searchParams.has("published")) {
      published = context.request.url.searchParams.get("published");
    }

    if (published === "true" || published === "false") {
      published = (published === "true");
    } else {
      published = undefined;
    }

    if (type == "any") type = undefined;
    if (!Number(pageNumber)) pageNumber = 0;

    skip = pageNumber * limit;
    content = await contentRepository.search(type, published, skip, limit);

    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/admin/views/contentView.ejs`,
      {
        currentUser: context.getCurrentUser,
        content: content,
        pager: {
          next: content.length >= limit ? Number(pageNumber) + 1 : false,
          previous: pageNumber == 0 ? false : Number(pageNumber) - 1,
        },
        filters: {
          type: type ? type : "",
          published: published,
        },
      },
    );
  },

  async taxonomy(context: Record<string, any>) {
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/admin/views/taxonomyView.ejs`,
      {
        currentUser: context.getCurrentUser,
      },
    );
  },

  async media(context: Record<string, any>) {
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/admin/views/mediaView.ejs`,
      {
        currentUser: context.getCurrentUser,
      },
    );
  },

  async block(context: Record<string, any>) {
    context.response.body = await renderFileToString(
      `${Deno.cwd()}/core/modules/admin/views/blockView.ejs`,
      {
        currentUser: context.getCurrentUser,
      },
    );
  },
};
