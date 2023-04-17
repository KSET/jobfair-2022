import * as fs from "node:fs";

const log =
  fs
    .readFileSync("./lint.log", "utf8")
    .split("\n")
    .map((x: string) => {
      const [ time, type, ...rest ] = x.split(" ");

      return [ time, type, rest.join(" ") ] as const;
    }) as [ string, string, string ][]
;

const isFileStart =
  ([ _time, type, status ]: [ string, string, string ], skipIgnored = true) =>
    "eslint:file-enumerator" === type
    && status.startsWith("Yield: ")
    && (skipIgnored ? !status.endsWith("but ignored") : true)
;

const isIgnorePattern =
  ([ _time, type, _status ]: [ string, string, string ]) =>
    "eslintrc:ignore-pattern" === type
;

const getFileName =
  (startIndex: number) => {
    while ("eslint:cli-engine" !== log[startIndex][1]) {
      startIndex += 1;
    }

    return log[startIndex][2].replace("Lint ", "");
  }
;

const fileSegments = [];

let index = 0;
while (index < log.length) {
  const [ time, type, status ] = log[index++];

  const fileStart = isFileStart([ time, type, status ]);

  if (!fileStart) {
    continue;
  }

  const startIndex = index - 1;
  while (!isIgnorePattern(log[index++]) && index < log.length) {
    // do nothing
  }
  index -= 1;

  const startTime = new Date(log[startIndex][0]);
  const endTime = new Date(log[index][0]);
  const durationMs = endTime.getTime() - startTime.getTime();

  const data = {
    filePath: getFileName(startIndex),
    startIndex,
    endIndex: index,
    durationMs,
    // content: log.slice(startIndex, index),
  };

  fileSegments.push(data);

  // console.log(`File ${ status.replace("Yield: ", "") } starts at line ${ startIndex + 1 } and ends at line ${ index + 1 }`);
}

console.log(fileSegments.sort((lt, gt) => gt.durationMs - lt.durationMs));
