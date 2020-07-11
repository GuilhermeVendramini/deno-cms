let type: string = "article";
let bundle: string = "content";
let name: string = "Article";
let fields: string[] = [
  "body",
];
let references: string[] = [
  "tags",
  "images",
];
let canBeReferenced: boolean = true;

export default {
  type,
  bundle,
  name,
  fields,
  references,
  canBeReferenced,
};
