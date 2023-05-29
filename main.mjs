import { promises as fs } from "fs";
import { argv } from "node:process";

const EVENT_START = "BEGIN:VEVENT";
const EVENT_END = "END:VEVENT";
const START_DATE = "DTSTART";
const END_DATE = "DTEND";

const NEW_LINE = /\r\n|\n|\r/;

function icsToJson(icsData) {
  const array = [];
  const lines = icsData.split(NEW_LINE);
  let obj = {};

  for (const line of lines) {
    if (line === EVENT_START) {
      continue;
    }

    if (line === EVENT_END) {
      array.push(obj);
      obj = {};
      continue;
    }

    let [key, value] = line.split(":");
    key = key.replace(";VALUE=DATE", "");
    obj[key] = value;
  }

  return array;
}

function getSameDay(events) {
  const sameDayEvents = [];
  for (const event of events) {
    const start = event[START_DATE].split("T")[0];
    const end = event[END_DATE].split("T")[0];

    if (start === end) {
      sameDayEvents.push(event);
    }
  }

  return sameDayEvents;
}

async function convert(path) {
  try {
    const data = await fs.readFile(path, "utf8");
    return icsToJson(data);
  } catch (e) {
    console.log("error converting: ", e);
  }
}

async function main() {
  const path = argv[2];
  const converted = await convert(path);
  const sameDayEvents = getSameDay(converted);
  console.log("sameDayEvents", sameDayEvents);
}

main();
