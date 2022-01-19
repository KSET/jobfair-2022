export const prettyHrTime = (
  source: [ number, number ],
  opts = {
    verbose: false,
    precise: false,
  } as const,
) => {
  const minimalDesc = [ "h", "min", "s", "ms", "μs", "ns" ];
  const verboseDesc = [ "hour", "minute", "second", "millisecond", "microsecond", "nanosecond" ];
  const convert = [ 60 * 60, 60, 1, 1e6, 1e3, 1 ];

  const {
    verbose,
    precise,
  } = opts;

  if (!Array.isArray(source) || 2 !== source.length) {
    return "";
  }
  if ("number" !== typeof source[0] || "number" !== typeof source[1]) {
    return "";
  }

  // normalize source array due to changes in node v5.4+
  if (0 > source[1]) {
    const totalSeconds = source[0] + source[1] / 1e9;
    source[0] = parseInt(totalSeconds.toString());
    source[1] = parseFloat((totalSeconds % 1).toPrecision(9)) * 1e9;
  }

  let results = "";

  // foreach unit
  for (let i = 0; 6 > i; i++) {
    const spot = 3 > i ? 0 : 1; // grabbing first or second spot in source array
    let sourceAtStep = source[spot];
    if (3 !== i && 0 !== i) {
      sourceAtStep = sourceAtStep % convert[i - 1]; // trim off previous portions
    }
    if (2 === i) {
      sourceAtStep += source[1] / 1e9; // get partial seconds from other portion of the array
    }
    let valAtStep = sourceAtStep / convert[i]; // val at this unit
    if (1 <= valAtStep) {
      if (verbose) {
        valAtStep = Math.floor(valAtStep); // deal in whole units, subsequent laps will get the decimal portion
      }

      let strAtStep;
      if (!precise) {
        // don't fling too many decimals
        const decimals = 10 <= valAtStep ? 0 : 2;
        strAtStep = valAtStep.toFixed(decimals);
      } else {
        strAtStep = valAtStep.toString();
      }
      if (-1 < strAtStep.indexOf(".") && "0" === strAtStep[strAtStep.length - 1]) {
        strAtStep = strAtStep.replace(/\.?0+$/, ""); // remove trailing zeros
      }
      if (results) {
        results += " "; // append space if we have a previous value
      }
      results += strAtStep; // append the value
      // append units
      if (verbose) {
        results += ` ${ verboseDesc[i] }`;
        if ("1" !== strAtStep) {
          results += "s";
        }
      } else {
        results += ` ${ minimalDesc[i] }`;
      }
      if (!verbose) {
        break; // verbose gets as many groups as necessary, the rest get only one
      }
    }
  }

  return results;
};
