import { renderFileToString } from "dejs";
import EntityRepository from "../../../../repositories/mongodb/entity/EntityRepository.ts";

const repository = new EntityRepository('content');

export default {
  async content(context: Record<string, any>) {
    let content: any[] = [];
    let pageNumber: number = 0;
    let skip = 0;
    let limit = 10;
    let title: string | undefined;
    let type: string | undefined;
    let published: any | undefined;

    if (context.request.url.searchParams.has("pageNumber")) {
      pageNumber = context.request.url.searchParams.get("pageNumber");
    }

    if (context.request.url.searchParams.has("title")) {
      title = context.request.url.searchParams.get("title");
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
    content = await repository.search(
      title,
      type,
      published,
      skip,
      limit,
    );

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
          title: title ? title : "",
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
