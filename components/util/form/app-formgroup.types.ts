import type {
 ClassList, MaybeRef,
} from "~/helpers/type";

type InputBase = {
  placeholder?: string,
  loading?: boolean,
  required?: boolean,
  disabled?: boolean,
  attrs?: Record<string, unknown>,
  classes?: ClassList,
};

type InputText = InputBase &
  (
    | {
        value: string,
        type:
          | "text"
          | "datetime-local"
          | "email"
          | "month"
          | "password"
          | "search"
          | "tel"
          | "time"
          | "url"
          | "week",
      }
    | {
        type: "number",
        value: number,
      }
    | {
        type: "date",
        value: string | Date,
      }
    | {
        type: "checkbox",
        value: boolean,
      }
  );

type InputDropdown = InputBase & {
  value: string | string[],
  type: "dropdown",
  options: MaybeRef<
    {
      label: string,
      value: string,
    }[]
  >,
};

type InputTextarea = InputBase & {
  value: string,
  type: "textarea",
};

type InputEditor = InputBase & {
  value: string,
  type: "editor",
};

type InputFile = InputBase & {
  value: string,
  type: "file",
  accept?: MaybeRef<string | string[]>,
  fileName?: MaybeRef<string>,
  fileType?: MaybeRef<string>,
  multiple?: MaybeRef<boolean>,
};

type InputSlider = InputBase & {
  value: number | null,
  type: "slider",
  step?: MaybeRef<number>,
  min?: MaybeRef<number>,
  max?: MaybeRef<number>,
};

type InputNumberRange = InputBase & {
  value: number | null,
  type: "number-range",
  min: MaybeRef<number>,
  max: MaybeRef<number>,
};

type InputMultiPick = InputBase & {
  value: string[],
  type: "multi-pick",
  options: MaybeRef<
    {
      label: string,
      value: string,
    }[]
  >,
};

type InputSinglePick = InputBase & {
  value: string,
  type: "single-pick",
  options: MaybeRef<
    {
      label: string,
      value: string,
    }[]
  >,
};

export type InputEntry =
  | InputText
  | InputDropdown
  | InputTextarea
  | InputFile
  | InputSlider
  | InputNumberRange
  | InputMultiPick
  | InputSinglePick
  | InputEditor;
