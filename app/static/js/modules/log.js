// log.js

let enableLogs = true;

export function setLogging(enabled) {
  enableLogs = enabled;
}

export function log(...args) {
  if (enableLogs) console.log(...args);
}