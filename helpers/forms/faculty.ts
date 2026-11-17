import {
  type InputEntry,
} from "~/components/util/form/app-formgroup.types";
import {
  FACULTY_OPTIONS,
  isFaculty,
} from "~/backend/app/shared/faculties";

type InputDropdown = Extract<InputEntry, { type: "dropdown", }>;

export const facultyDropdownInput =
  (value: string, extra: Partial<Omit<InputDropdown, "type" | "value" | "options">> = {}): InputDropdown => {
    const options =
      value && !isFaculty(value)
        ? [ { label: value, value, search: value }, ...FACULTY_OPTIONS ]
        : FACULTY_OPTIONS
    ;

    return {
      value,
      type: "dropdown",
      options,
      placeholder: "Odaberi fakultet",
      ...extra,
      attrs: {
        filterFields: [ "search" ],
        clearable: true,
        wrap: true,
        ...extra.attrs,
      },
    };
  }
;
