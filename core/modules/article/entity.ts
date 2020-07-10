const type: string = "article";
const bundle: string = "content";
const name: string = "Article";
const fields: string[] = [
  "body",
];
const references: string[] = [
  "tags",
  "images",
];
const canBeReferenced: boolean = true;

export default {
  type,
  bundle,
  name,
  fields,
  references,
  canBeReferenced,
};
