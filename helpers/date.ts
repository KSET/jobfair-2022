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
