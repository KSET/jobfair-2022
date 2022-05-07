const zeroPad = (n: number): string => String(n).padStart(2, "0");

export const formatDate = (dateStr: string | Date): string => {
  const date = new Date(dateStr);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${ day }. ${ month }. ${ year }.`;
};

export const parseDate = (formattedDate: string): Date => {
  const [
    day,
    month,
    year,
  ] = formattedDate.split(".").map(Number).map(zeroPad);

  return new Date(`${ year }-${ month }-${ day }`);
};

export const withoutTime =
  (date: ConstructorParameters<typeof Date>[0]) => {
    const d = new Date(date);
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
  }
;

export const today =
  () =>
    withoutTime(new Date())
;

export const fromToday =
  (days: number) => {
    const now = today();
    now.setDate(new Date().getDate() + days);
    return now;
  }
;

export const yesterday =
  () =>
    fromToday(-1)
;

export const tomorrow =
  () =>
    fromToday(1)
;

export const asDate =
  (
    value: unknown,
    fallback = () => new Date(),
  ) => {
    const date =
      (
        value instanceof Date
        || "string" === typeof value
      )
        ? new Date(value)
        : fallback()
    ;

    return date.toISOString().split("T")[0];
  }
;

export const asOptionalDate =
  <T, F>(
    value: T,
    fallback = (): F => "" as unknown as F,
  ) => {
    const date =
      (
        value instanceof Date
        || "string" === typeof value
      )
        ? new Date(value)
        : null
    ;

    return date ? date.toISOString().split("T")[0] : fallback();
  }
;
