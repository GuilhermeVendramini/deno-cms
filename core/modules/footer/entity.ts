const type: string = "footer";
const bundle: string = "menu_item";
const name: string = "Footer";
const fields: string[] = [
  "target",
  "weight",
];
const references: string[] = [];

/**
 * Set true if this entity can be referenced.
 */
const canBeReferenced: boolean = false;

/**
 * PathAuto pattern. Allows String values in the first entity level. 
 * Example: ':title'.
 */
const pathPattern = [
  bundle,
  type,
  ":title",
];

export default {
  type,
  bundle,
  name,
  fields,
  references,
  canBeReferenced,
  pathPattern,
};
