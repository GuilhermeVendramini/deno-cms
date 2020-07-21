import MenuItemEntityRepository from "../../../../repositories/mongodb/entity/MenuItemEntityRepository.ts";

let repository = new MenuItemEntityRepository();

export default {
  async getMenuTree(type: string): Promise<any[]> {
    let items: any[] | undefined;
    items = await repository.find(type);

    if (!items || items.length < 0) return [];

    items.sort((i1: any, i2: any) => {
      return i1.data.weight > i2.data.weight ? 1 : -1;
    });

    const buildTree: any = (
      list: any[],
      id: string = "",
    ) =>
      list
        .filter((item) => item.parent === id)
        .map((item) => ({ ...item, children: buildTree(list, item._id.$oid) }));

    items = buildTree(items);

    return items as any[];
  },
};
