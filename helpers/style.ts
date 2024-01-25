import {
  type ClassDefinition,
  type ClassList,
} from "~/helpers/type";

export const toClass =
  (classList: ClassList): ClassDefinition[] => {
    if (!classList) {
      return [];
    }

    if (Array.isArray(classList)) {
      return classList;
    }

    return [ classList ];
  }
;
