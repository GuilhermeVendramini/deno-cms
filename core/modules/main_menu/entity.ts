const type: string = "main_menu";
const bundle: string = "menu_item";
const name: string = "Main menu";
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
