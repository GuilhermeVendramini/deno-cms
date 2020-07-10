import EntityRepository from "../../../repositories/mongodb/entity/EntityRepository.ts";

function replaceElements(string: string) {
  let i: any =
    "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝŔÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿŕ _".split(
      "",
    );
  let o: any =
    "AAAAAAACEEEEIIIIDNOOOOOOUUUUYRsBaaaaaaaceeeeiiiionoooooouuuuybyr--".split(
      "",
    );
  let map: any = {};
  i.forEach(function (el: any, idx: any) {
    map[el] = o[idx];
  });

  return string.replace(/[^A-Za-z0-9]/g, function (ch) {
    return map[ch] || ch;
  }).toLowerCase();
}

function generateCleanPath(fragments: any): string {
  let cleanFragments = new Array();

  fragments.forEach(function (e: string) {
    cleanFragments.push(e.replace(/[^\w\s]/gi, ""));
  });

  let path: string = cleanFragments.join("/");
  let cleanPath = replaceElements(path);
  let lastFragment: string | undefined = cleanPath.substr(
    cleanPath.lastIndexOf("/") + 1,
  );

  if (!lastFragment) {
    cleanPath = cleanPath + "title-" + Date.now();
  }

  return cleanPath;
}

async function generatePath(
  bundle: string,
  fragments: any,
  id: any = false,
  index: any = false,
) {
  let repository = new EntityRepository(bundle);
  let path: string = "/" + generateCleanPath(fragments);

  if (index) {
    path = path + "-" + index;
  }

  let result : any = await repository.findOneByFilters({ path: path });

  if (Object.keys(result).length != 0 && id != result._id.$oid) {
    path = await generatePath(bundle, fragments, id, index + 1);
    return path;
  }

  return path;
}

export default {
  async generate(bundle: string, fragments: any, id: any = false) {
    let newPath = await generatePath(bundle, fragments, id);

    return newPath;
  },
};
