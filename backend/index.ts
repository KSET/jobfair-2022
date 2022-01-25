/* eslint-disable no-console */
import "dotenv/config";
import {
  start,
} from "./app";

void start().then(({ host, port, message }) => {
  console.log(`Server started on http://${ host }:${ port }`);
  if (message) {
    console.log(message);
  }
});
