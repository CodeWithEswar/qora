var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// workers/redirect/evaluator.ts
function parseScannerContext(request) {
  const userAgent = request.headers.get("user-agent") || "";
  const acceptLanguage = request.headers.get("accept-language") || "";
  const cf = request.cf || {};
  const country = cf.country || "UNKNOWN";
  const region = cf.region || void 0;
  const timezone = cf.timezone || "UTC";
  let deviceType = "desktop";
  let osName = "Unknown";
  let browserName = "Unknown";
  const ua = userAgent.toLowerCase();
  if (/bot|crawler|spider|crawling|whatsapp|facebookexternalhit|preview/i.test(ua)) {
    deviceType = "bot";
  } else if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    deviceType = "tablet";
  } else if (/mobi|iphone|ipod|android/i.test(ua)) {
    deviceType = "mobile";
  }
  if (/iphone|ipad|ipod/i.test(ua)) {
    osName = "iOS";
  } else if (/android/i.test(ua)) {
    osName = "Android";
  } else if (/macintosh|mac os x/i.test(ua)) {
    osName = "macOS";
  } else if (/windows nt/i.test(ua)) {
    osName = "Windows";
  } else if (/linux/i.test(ua)) {
    osName = "Linux";
  }
  if (/edg\//i.test(ua)) {
    browserName = "Edge";
  } else if (/chrome|crios/i.test(ua) && !/opr|brave/i.test(ua)) {
    browserName = "Chrome";
  } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
    browserName = "Safari";
  } else if (/firefox|fxios/i.test(ua)) {
    browserName = "Firefox";
  }
  const primaryLang = acceptLanguage.split(",")[0]?.split("-")[0]?.trim().toLowerCase() || "en";
  const now = /* @__PURE__ */ new Date();
  let localHour = now.getUTCHours();
  let localMinute = now.getUTCMinutes();
  let localDay = now.getUTCDay();
  try {
    const tzString = now.toLocaleTimeString("en-US", { timeZone: timezone, hour12: false, hour: "2-digit", minute: "2-digit" });
    const [h, m] = tzString.split(":").map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      localHour = h;
      localMinute = m;
    }
  } catch {
  }
  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const currentWeekday = daysOfWeek[localDay];
  const timeString = `${String(localHour).padStart(2, "0")}:${String(localMinute).padStart(2, "0")}`;
  return {
    country,
    region,
    device: deviceType,
    os: osName,
    browser: browserName,
    language: primaryLang,
    localTime: timeString,
    weekday: currentWeekday,
    timestamp: Date.now()
  };
}
__name(parseScannerContext, "parseScannerContext");
function evaluateCondition(condition, context2) {
  let contextValue;
  switch (condition.type) {
    case "country":
      contextValue = context2.country?.toUpperCase();
      break;
    case "region":
      contextValue = context2.region?.toUpperCase();
      break;
    case "device":
      contextValue = context2.device?.toLowerCase();
      break;
    case "os":
      contextValue = context2.os?.toLowerCase();
      break;
    case "browser":
      contextValue = context2.browser?.toLowerCase();
      break;
    case "language":
      contextValue = context2.language?.toLowerCase();
      break;
    case "weekday":
      contextValue = context2.weekday?.toLowerCase();
      break;
    case "time_window":
      contextValue = context2.localTime;
      break;
    case "date_range":
      contextValue = new Date(context2.timestamp || Date.now()).toISOString().split("T")[0];
      break;
    default:
      return false;
  }
  if (!contextValue) return false;
  const targetValue = condition.value;
  switch (condition.operator) {
    case "eq":
      return String(contextValue).toLowerCase() === String(targetValue).toLowerCase();
    case "neq":
      return String(contextValue).toLowerCase() !== String(targetValue).toLowerCase();
    case "contains":
      return String(contextValue).toLowerCase().includes(String(targetValue).toLowerCase());
    case "in":
      if (Array.isArray(targetValue)) {
        return targetValue.map((v) => String(v).toLowerCase()).includes(String(contextValue).toLowerCase());
      }
      return false;
    case "nin":
      if (Array.isArray(targetValue)) {
        return !targetValue.map((v) => String(v).toLowerCase()).includes(String(contextValue).toLowerCase());
      }
      return true;
    case "between":
      if (Array.isArray(targetValue) && targetValue.length === 2) {
        return contextValue >= targetValue[0] && contextValue <= targetValue[1];
      }
      return false;
    default:
      return false;
  }
}
__name(evaluateCondition, "evaluateCondition");
function evaluateRules(rules, context2) {
  const sorted = [...rules].filter((r) => r.isActive).sort((a, b) => a.priority - b.priority);
  for (const rule of sorted) {
    if (!rule.conditions || rule.conditions.length === 0) {
      return { matchedRule: rule, destination: rule.action.destinationUrl };
    }
    const matches = rule.conditions.map((cond) => evaluateCondition(cond, context2));
    const isMatch = rule.matchType === "ANY" ? matches.some(Boolean) : matches.every(Boolean);
    if (isMatch) {
      return { matchedRule: rule, destination: rule.action.destinationUrl };
    }
  }
  return {};
}
__name(evaluateRules, "evaluateRules");

// workers/redirect/index.ts
var index_default = {
  async fetch(request, env2, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    if (pathname === "/health" || pathname === "/_health") {
      return new Response(JSON.stringify({ status: "ok", edge: "active", time: Date.now() }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    }
    const parts = pathname.split("/").filter(Boolean);
    const slug = parts[0] === "s" ? parts[1] : parts[0];
    if (!slug) {
      return new Response("NXTQR Edge Gateway \u2014 Ready", { status: 200 });
    }
    try {
      const kvKey = `slug:${slug.toLowerCase()}`;
      let snapshot = null;
      if (env2.REDIRECT_KV) {
        const cached = await env2.REDIRECT_KV.get(kvKey, "json");
        if (cached) {
          snapshot = cached;
        }
      }
      if (!snapshot && env2.DB) {
        snapshot = await fetchSnapshotFromD1(env2.DB, slug);
        if (snapshot && env2.REDIRECT_KV) {
          ctx.waitUntil(env2.REDIRECT_KV.put(kvKey, JSON.stringify(snapshot), { expirationTtl: 3600 }));
        }
      }
      if (!snapshot) {
        return renderStatusPage(404, "QR Code Not Found", "This QR code does not exist or has been removed.", "#FA520F");
      }
      const now = Date.now();
      if (snapshot.status === "DRAFT") {
        return renderStatusPage(403, "QR Code in Draft", "This QR code is currently in draft mode and has not been published yet.", "#FFA110");
      }
      if (snapshot.status === "PAUSED") {
        return renderStatusPage(503, "QR Code Paused", "This QR code has been temporarily paused by its owner.", "#6A6A6A");
      }
      if (snapshot.startsAt && now < snapshot.startsAt) {
        return renderStatusPage(403, "QR Campaign Scheduled", "This QR campaign is scheduled to start soon. Please check back later.", "#FFA110");
      }
      if (snapshot.expiresAt && now > snapshot.expiresAt) {
        return renderStatusPage(410, "QR Code Expired", "This campaign or offer has ended.", "#6A6A6A");
      }
      const scannerContext = parseScannerContext(request);
      let targetDestination = snapshot.defaultDestination;
      let matchedRuleId;
      let experimentVariantId;
      let isFallback = false;
      if (snapshot.guardianHealthy === false && snapshot.fallbackDestination) {
        targetDestination = snapshot.fallbackDestination;
        isFallback = true;
      } else if (snapshot.rules && snapshot.rules.length > 0) {
        const match = evaluateRules(snapshot.rules, scannerContext);
        if (match.destination) {
          targetDestination = match.destination;
          matchedRuleId = match.matchedRule?.id;
        }
      }
      if (!isFallback && !matchedRuleId && snapshot.experiment && snapshot.experiment.status === "ACTIVE" && snapshot.experiment.variants.length > 0) {
        const rand = Math.random() * 100;
        let cumulative = 0;
        for (const variant of snapshot.experiment.variants) {
          cumulative += variant.trafficWeight;
          if (rand <= cumulative) {
            targetDestination = variant.destinationUrl;
            experimentVariantId = variant.id;
            break;
          }
        }
      }
      if (env2.SCAN_QUEUE) {
        const ipSalt = env2.IP_SALT || "nxtqr_salt_2026";
        const clientIp = request.headers.get("cf-connecting-ip") || "0.0.0.0";
        ctx.waitUntil((async () => {
          try {
            const ipHash = await hashString(`${clientIp}-${ipSalt}-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}`);
            const telemetry = {
              eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
              qrId: snapshot.qrId,
              organizationId: snapshot.organizationId,
              timestamp: now,
              ipHash,
              countryCode: scannerContext.country,
              region: scannerContext.region,
              deviceType: scannerContext.device,
              osName: scannerContext.os,
              browserName: scannerContext.browser,
              referrer: request.headers.get("referer") || void 0,
              resolvedDestination: targetDestination,
              matchedRuleId,
              experimentVariantId,
              isFallback
            };
            await env2.SCAN_QUEUE.send(telemetry);
          } catch (err) {
            console.error("Failed to enqueue scan telemetry:", err);
          }
        })());
      }
      return new Response(null, {
        status: 302,
        headers: {
          Location: targetDestination,
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-NXTQR-Resolved": "1"
        }
      });
    } catch (err) {
      console.error("Redirect error:", err);
      return renderStatusPage(500, "Service Unavailable", "A temporary issue occurred while resolving this destination.", "#FA520F");
    }
  },
  /**
   * Cloudflare Queue Consumer: Batch processes scan telemetry events into D1 analytics tables.
   */
  async queue(batch, env2) {
    if (!env2.DB || batch.messages.length === 0) return;
    for (const msg of batch.messages) {
      const event = msg.body;
      const hourBucket = Math.floor(event.timestamp / 36e5) * 36e5;
      const upsertSql = `
        INSERT INTO scan_events_hourly (
          id, qr_id, organization_id, hour_bucket, total_scans, estimated_unique_scans,
          country_code, device_type, os_name, browser_name
        ) VALUES (
          ?, ?, ?, ?, 1, 1, ?, ?, ?, ?
        )
        ON CONFLICT(qr_id, hour_bucket, country_code, device_type, os_name) DO UPDATE SET
          total_scans = total_scans + 1
      `;
      const id = `scan_${event.qrId}_${hourBucket}_${event.countryCode || "XX"}_${event.deviceType || "oth"}`;
      try {
        await env2.DB.prepare(upsertSql).bind(
          id,
          event.qrId,
          event.organizationId,
          hourBucket,
          event.countryCode || "XX",
          event.deviceType || "desktop",
          event.osName || "Unknown",
          event.browserName || "Unknown"
        ).run();
      } catch (err) {
        console.error("Queue batch insert error:", err);
      }
    }
  }
};
async function fetchSnapshotFromD1(db, slug) {
  const query = `
    SELECT 
      q.id as qrId,
      q.organization_id as orgId,
      q.status as status,
      d.default_url as defaultDestination,
      d.fallback_url as fallbackDestination,
      d.password_hash as passwordHash,
      d.starts_at as startsAt,
      d.expires_at as expiresAt,
      q.updated_at as updatedAt
    FROM qr_codes q
    LEFT JOIN qr_destinations d ON d.qr_id = q.id
    WHERE q.slug = ? AND q.status != 'ARCHIVED'
    LIMIT 1
  `;
  const row = await db.prepare(query).bind(slug).first();
  if (!row) return null;
  return {
    qrId: row.qrId,
    organizationId: row.orgId,
    status: row.status,
    defaultDestination: row.defaultDestination,
    fallbackDestination: row.fallbackDestination || void 0,
    passwordHash: row.passwordHash || void 0,
    startsAt: row.startsAt || void 0,
    expiresAt: row.expiresAt || void 0,
    rulesVersion: 1,
    rules: [],
    guardianHealthy: true,
    updatedAt: row.updatedAt
  };
}
__name(fetchSnapshotFromD1, "fetchSnapshotFromD1");
async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").substring(0, 16);
}
__name(hashString, "hashString");
function renderStatusPage(status, title2, message, accentColor) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title2} \u2014 NXTQR</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #111111;
      color: #F7F4EC;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      background: #191919;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 40px;
      max-width: 440px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .badge {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: ${accentColor};
      margin-bottom: 20px;
      box-shadow: 0 0 12px ${accentColor};
    }
    h1 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }
    p {
      color: #B8B5AD;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 28px;
    }
    .footer {
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 16px;
      font-size: 12px;
      color: #85827B;
      letter-spacing: 0.04em;
    }
    .brand {
      color: #FA520F;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"></div>
    <h1>${title2}</h1>
    <p>${message}</p>
    <div class="footer">
      Powered by <span class="brand">NXTQR</span> Intelligence
    </div>
  </div>
</body>
</html>`;
  return new Response(html, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
__name(renderStatusPage, "renderStatusPage");
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
