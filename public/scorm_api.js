/*
  pipwerks SCORM API Wrapper
  Supports SCORM 1.2 and SCORM 2004

  Based on the original by Philip Hutchison
  https://github.com/pipwerks/scorm-api-wrapper
*/

var pipwerks = pipwerks || {};
pipwerks.UTILS = {};
pipwerks.debug = { isActive: true };

pipwerks.SCORM = {

  version: null,
  handleCompletionOnInitialize: false,
  handleCompletionOnTerminate: false,

  // ── API locator ────────────────────────────────────────────────────────────
  API: {
    handle: null,
    isFound: false,

    find: function (win) {
      var API = null,
          attempts = 0,
          limit = 500,
          scorm = pipwerks.SCORM,
          trace = pipwerks.UTILS.trace;

      while (!win.API && !win.API_1484_11 && win.parent && win.parent !== win && attempts <= limit) {
        attempts++;
        win = win.parent;
      }

      if (scorm.version) {
        switch (scorm.version) {
          case "2004":
            if (win.API_1484_11) { API = win.API_1484_11; }
            else { trace("API.find: SCORM 2004 specified but API_1484_11 not found."); }
            break;
          case "1.2":
            if (win.API) { API = win.API; }
            else { trace("API.find: SCORM 1.2 specified but API not found."); }
            break;
        }
      } else {
        if (win.API_1484_11) {
          scorm.version = "2004";
          API = win.API_1484_11;
        } else if (win.API) {
          scorm.version = "1.2";
          API = win.API;
        }
      }

      return API;
    },

    get: function () {
      var API = null,
          win = window,
          scorm = pipwerks.SCORM,
          find = pipwerks.SCORM.API.find,
          trace = pipwerks.UTILS.trace;

      if (scorm.API.isFound) return scorm.API.handle;

      API = find(win);
      if (!API && win.parent && win.parent !== win) API = find(win.parent);
      if (!API && win.top   && win.top   !== win)  API = find(win.top);
      if (!API && win.opener)                       API = find(win.opener);

      if (API) {
        scorm.API.handle  = API;
        scorm.API.isFound = true;
      } else {
        trace("API.get: SCORM API not found.");
      }

      return API;
    }
  },

  // ── Connection ─────────────────────────────────────────────────────────────
  connection: {
    isActive: false,

    initialize: function () {
      var success = false,
          scorm   = pipwerks.SCORM,
          trace   = pipwerks.UTILS.trace,
          bool    = pipwerks.UTILS.makeBoolean,
          api, errorCode;

      if (scorm.connection.isActive) {
        trace("connection.initialize: already active.");
        return true;
      }

      api = scorm.API.get();
      if (!api) { trace("connection.initialize: API is null."); return false; }

      switch (scorm.version) {
        case "1.2":  success = bool(api.LMSInitialize("")); break;
        case "2004": success = bool(api.Initialize(""));    break;
      }

      if (success) {
        errorCode = scorm.debug.getCode();
        if (errorCode === 0) {
          scorm.connection.isActive = true;
          if (scorm.handleCompletionOnInitialize) {
            var status = scorm.status("get");
            if (status === "not attempted") scorm.status("set", "incomplete");
            scorm.data.save();
          }
        } else {
          success = false;
          trace("connection.initialize failed. Error: " + errorCode);
        }
      } else {
        trace("connection.initialize: LMSInitialize/Initialize returned false.");
      }

      return success;
    },

    terminate: function () {
      var success = false,
          scorm   = pipwerks.SCORM,
          trace   = pipwerks.UTILS.trace,
          bool    = pipwerks.UTILS.makeBoolean,
          api;

      if (!scorm.connection.isActive) {
        trace("connection.terminate: connection is not active.");
        return false;
      }

      api = scorm.API.get();
      if (!api) { trace("connection.terminate: API is null."); return false; }

      if (scorm.handleCompletionOnTerminate) {
        var status = scorm.status("get");
        if (status === "incomplete") scorm.status("set", "completed");
        scorm.data.save();
      }

      switch (scorm.version) {
        case "1.2":  success = bool(api.LMSFinish(""));   break;
        case "2004": success = bool(api.Terminate("")); break;
      }

      if (success) {
        scorm.connection.isActive = false;
      } else {
        trace("connection.terminate failed.");
      }

      return success;
    }
  },

  // ── Data ───────────────────────────────────────────────────────────────────
  data: {

    get: function (parameter) {
      var value = null,
          scorm = pipwerks.SCORM,
          trace = pipwerks.UTILS.trace,
          api;

      if (!scorm.connection.isActive) { trace("data.get: connection not active."); return null; }

      api = scorm.API.get();
      if (!api) { trace("data.get: API is null."); return null; }

      switch (scorm.version) {
        case "1.2":  value = api.LMSGetValue(parameter); break;
        case "2004": value = api.GetValue(parameter);    break;
      }

      var code = scorm.debug.getCode();
      if (code !== 0) trace("data.get('" + parameter + "') error " + code);

      return value;
    },

    set: function (parameter, value) {
      var success = false,
          scorm   = pipwerks.SCORM,
          trace   = pipwerks.UTILS.trace,
          bool    = pipwerks.UTILS.makeBoolean,
          api;

      if (!scorm.connection.isActive) { trace("data.set: connection not active."); return false; }

      api = scorm.API.get();
      if (!api) { trace("data.set: API is null."); return false; }

      switch (scorm.version) {
        case "1.2":  success = bool(api.LMSSetValue(parameter, value)); break;
        case "2004": success = bool(api.SetValue(parameter, value));    break;
      }

      if (!success) {
        var code = scorm.debug.getCode();
        trace("data.set('" + parameter + "', '" + value + "') error " + code);
      }

      return success;
    },

    save: function () {
      var success = false,
          scorm   = pipwerks.SCORM,
          trace   = pipwerks.UTILS.trace,
          bool    = pipwerks.UTILS.makeBoolean,
          api;

      if (!scorm.connection.isActive) { trace("data.save: connection not active."); return false; }

      api = scorm.API.get();
      if (!api) { trace("data.save: API is null."); return false; }

      switch (scorm.version) {
        case "1.2":  success = bool(api.LMSCommit("")); break;
        case "2004": success = bool(api.Commit(""));    break;
      }

      return success;
    }
  },

  // ── Debug ──────────────────────────────────────────────────────────────────
  debug: {

    getCode: function () {
      var scorm = pipwerks.SCORM,
          api   = scorm.API.get(),
          code  = 0;

      if (!api) return 0;

      switch (scorm.version) {
        case "1.2":  code = parseInt(api.LMSGetLastError(), 10); break;
        case "2004": code = parseInt(api.GetLastError(), 10);    break;
      }

      return code;
    },

    getInfo: function (errorCode) {
      var scorm = pipwerks.SCORM,
          api   = scorm.API.get(),
          info  = "";

      if (!api) return "";

      switch (scorm.version) {
        case "1.2":  info = api.LMSGetErrorString(String(errorCode)); break;
        case "2004": info = api.GetErrorString(String(errorCode));    break;
      }

      return info;
    }
  },

  // ── Status helpers ─────────────────────────────────────────────────────────
  //   action: "get" | "set"
  //   status: (for set) any valid lesson_status / completion_status string
  status: function (action, status) {
    var scorm = pipwerks.SCORM,
        trace = pipwerks.UTILS.trace,
        param = "";

    switch (scorm.version) {
      case "1.2":  param = "cmi.core.lesson_status"; break;
      case "2004": param = "cmi.completion_status";  break;
    }

    if (!param) { trace("status: SCORM version not set."); return false; }

    switch (action) {
      case "get": return scorm.data.get(param);
      case "set":
        if (status === undefined || status === null) { trace("status.set: status is null."); return false; }
        return scorm.data.set(param, status);
      default:
        trace("status: unknown action '" + action + "'.");
        return false;
    }
  },

  // ── Score helpers ──────────────────────────────────────────────────────────
  score: {

    get: function () {
      var scorm = pipwerks.SCORM;
      switch (scorm.version) {
        case "1.2":  return scorm.data.get("cmi.core.score.raw");
        case "2004": return scorm.data.get("cmi.score.raw");
        default: return null;
      }
    },

    set: function (score) {
      var scorm   = pipwerks.SCORM,
          success = false;

      switch (scorm.version) {
        case "1.2":
          success = scorm.data.set("cmi.core.score.raw", score);
          scorm.data.set("cmi.core.score.min", 0);
          scorm.data.set("cmi.core.score.max", 100);
          break;
        case "2004":
          success = scorm.data.set("cmi.score.raw",    score);
          scorm.data.set("cmi.score.min",    0);
          scorm.data.set("cmi.score.max",    100);
          scorm.data.set("cmi.score.scaled", parseFloat((score / 100).toFixed(4)));
          break;
      }

      return success;
    }
  },

  // ── Shorthand API (matches original pipwerks surface) ─────────────────────
  init:  function ()         { return pipwerks.SCORM.connection.initialize(); },
  get:   function (param)    { return pipwerks.SCORM.data.get(param); },
  set:   function (param, v) { return pipwerks.SCORM.data.set(param, v); },
  save:  function ()         { return pipwerks.SCORM.data.save(); },
  quit:  function ()         { return pipwerks.SCORM.connection.terminate(); }
};

// ── Utilities ────────────────────────────────────────────────────────────────
pipwerks.UTILS.trace = function (msg) {
  if (pipwerks.debug.isActive && window.console && window.console.log) {
    console.log("[SCORM] " + msg);
  }
};

pipwerks.UTILS.makeBoolean = function (value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    switch (value.toLowerCase()) {
      case "true":  case "yes": case "1": return true;
      case "false": case "no":  case "0": return false;
    }
  }
  return Boolean(value);
};
