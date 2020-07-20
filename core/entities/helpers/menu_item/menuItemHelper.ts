export default {
  async getMenuTree(repository: any, type: string): Promise<any[]> {
    let items: any[] | undefined;
    items = await repository.find(type);

    if (!items || items.length < 0) return [];

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
