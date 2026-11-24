// Where the Learn view keeps a visitor's progress.
//
// Progress always lives in IndexedDB, in one record whose key is an anonymous
// UUID made in this browser. Nothing leaves the browser until the visitor
// signs in with Google. From then on the record is also kept in Supabase, in
// the table "learn_progress", under the same UUID, and is merged with the
// records of the other browsers the same account signed in on.
//
// The Supabase client is loaded only when it is needed: when a session is
// stored, when the visitor comes back from Google, or when they press the
// sign-in button. A visitor who never signs in never downloads it.
//
// site/learn.js is the only user of window.LearnStore.

(function () {
  var DB_NAME = "dictionary-of-ai-coding";
  var DB_VERSION = 1;
  var PROGRESS = "progress"; // one record per anonymous id, keyed by "id"
  var META = "meta"; // { key, value } rows: the active id, the session
  var ACTIVE = "active";
  var AUTH_PREFIX = "auth:";
  var SESSION_KEY = "session";
  var TABLE = "learn_progress";
  // Where progress was kept before IndexedDB. Read once, then removed.
  var OLD_DONE = "learn:done";
  var OLD_LAST = "learn:last";
  // How long to wait after a change before sending it.
  var PUSH_SOON = 2500;
  var PUSH_LATER = 20000;
  // Do not read the account's rows again more often than this.
  var PULL_EVERY = 60000;

  var db = null; // null when IndexedDB cannot be used
  var memory = { progress: {}, meta: {} }; // stands in for it then
  var record = null; // the active record
  var changeListeners = [];
  var authListeners = [];

  var config = null; // { url, key, lib }
  var client = null;
  var clientPromise = null;
  var user = null;
  var auth = { available: false, status: "out", email: "", sync: "idle" };
  var pushTimer = 0;
  var pushDue = 0;
  var notice = ""; // "failed" when coming back from a refused sign-in
  var syncing = null;
  var syncAgain = false;
  var lastPull = 0;

  // ------------------------------------------------------------ IndexedDB

  function openDb() {
    return new Promise(function (resolve) {
      var request;
      try {
        request = window.indexedDB.open(DB_NAME, DB_VERSION);
      } catch (e) {
        resolve(null);
        return;
      }
      request.onupgradeneeded = function () {
        var d = request.result;
        if (!d.objectStoreNames.contains(PROGRESS)) {
          d.createObjectStore(PROGRESS, { keyPath: "id" });
        }
        if (!d.objectStoreNames.contains(META)) {
          d.createObjectStore(META, { keyPath: "key" });
        }
      };
      request.onsuccess = function () {
        var d = request.result;
        // Let a newer version of the site upgrade the database.
        d.onversionchange = function () {
          d.close();
        };
        resolve(d);
      };
      request.onerror = function () {
        resolve(null);
      };
      request.onblocked = function () {
        resolve(null);
      };
    });
  }

  function keyOf(name, value) {
    return name === PROGRESS ? value.id : value.key;
  }

  // One request in its own transaction. `run` gets the object store and
  // returns the request whose result is wanted, or nothing.
  function tx(name, mode, run) {
    return new Promise(function (resolve, reject) {
      var transaction;
      var request;
      try {
        transaction = db.transaction(name, mode);
        request = run(transaction.objectStore(name));
      } catch (e) {
        reject(e);
        return;
      }
      transaction.oncomplete = function () {
        resolve(request ? request.result : undefined);
      };
      transaction.onerror = transaction.onabort = function () {
        reject(transaction.error);
      };
    });
  }

  function dbGet(name, key) {
    if (!db) return Promise.resolve(memory[name][key] || null);
    return tx(name, "readonly", function (store) {
      return store.get(key);
    }).then(function (value) {
      return value || null;
    });
  }

  function dbAll(name) {
    if (!db) {
      return Promise.resolve(
        Object.keys(memory[name]).map(function (key) {
          return memory[name][key];
        })
      );
    }
    return tx(name, "readonly", function (store) {
      return store.getAll();
    });
  }

  function dbPut(name, value) {
    if (!db) {
      memory[name][keyOf(name, value)] = value;
      return Promise.resolve();
    }
    return tx(name, "readwrite", function (store) {
      store.put(value);
    });
  }

  function dbDelete(name, key) {
    if (!db) {
      delete memory[name][key];
      return Promise.resolve();
    }
    return tx(name, "readwrite", function (store) {
      store.delete(key);
    });
  }

  // ---------------------------------------------------------------- record

  function uuid() {
    var c = window.crypto;
    if (c && c.randomUUID) return c.randomUUID();
    var b = new Uint8Array(16);
    c.getRandomValues(b);
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    var hex = [];
    for (var i = 0; i < 16; i++) {
      hex.push((b[i] + 0x100).toString(16).slice(1));
    }
    return (
      hex.slice(0, 4).join("") +
      "-" +
      hex.slice(4, 6).join("") +
      "-" +
      hex.slice(6, 8).join("") +
      "-" +
      hex.slice(8, 10).join("") +
      "-" +
      hex.slice(10).join("")
    );
  }

  function blank() {
    var now = Date.now();
    return {
      id: uuid(),
      // { "<term slug>": time the term was finished }
      done: {},
      // { p: "<term slug>/<step number>", t: time } or null
      last: null,
      // Time of the last reset. Terms finished at or before it do not count.
      resetAt: 0,
      // The account this record was synced with, or null.
      owner: null,
      // True while a change has not reached the account yet.
      dirty: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  function number(value) {
    var n = Number(value);
    return isFinite(n) && n > 0 ? n : 0;
  }

  function place(value) {
    if (!value || typeof value.p !== "string" || !value.p) return null;
    return { p: value.p.slice(0, 200), t: number(value.t) };
  }

  // Two states of the same progress, made into one. A term is done if either
  // state finished it after the latest reset; the place is the newer one.
  function merge(a, b) {
    var resetAt = Math.max(number(a.resetAt), number(b.resetAt));
    var done = {};
    [a.done, b.done].forEach(function (source) {
      if (!source || typeof source !== "object") return;
      Object.keys(source).forEach(function (slug) {
        var t = number(source[slug]);
        if (t <= resetAt) return;
        if (!done[slug] || t < done[slug]) done[slug] = t;
      });
    });
    var last = null;
    [place(a.last), place(b.last)].forEach(function (candidate) {
      if (candidate && (!last || candidate.t > last.t)) last = candidate;
    });
    return { done: done, last: last, resetAt: resetAt };
  }

  // A stored value, with anything unexpected dropped.
  function clean(stored) {
    var state = merge(stored, {});
    var fresh = blank();
    return {
      id: String(stored.id),
      done: state.done,
      last: state.last,
      resetAt: state.resetAt,
      owner: typeof stored.owner === "string" ? stored.owner : null,
      dirty: Boolean(stored.dirty),
      createdAt: number(stored.createdAt) || fresh.createdAt,
      updatedAt: number(stored.updatedAt) || fresh.updatedAt,
    };
  }

  // Text that is the same for two states exactly when they hold the same
  // progress.
  function signature(state) {
    var slugs = Object.keys(state.done).sort();
    return JSON.stringify([
      state.resetAt,
      slugs.map(function (slug) {
        return [slug, state.done[slug]];
      }),
      state.last ? [state.last.p, state.last.t] : null,
    ]);
  }

  function apply(state) {
    record.done = state.done;
    record.last = state.last;
    record.resetAt = state.resetAt;
  }

  function snapshot() {
    return JSON.parse(JSON.stringify(record));
  }

  function emitChange() {
    changeListeners.forEach(function (listener) {
      listener();
    });
  }

  // What is stored under the active id, merged into the record in memory.
  // Another tab may have signed in since this one read the record. Then the
  // stored copy belongs to an account and this one does not yet: it takes
  // the owner, and its own reset, made before signing in, no longer counts.
  function absorb(stored) {
    var mine = record;
    if (stored.owner && !record.owner) {
      record.owner = stored.owner;
      mine = { done: record.done, last: record.last, resetAt: 0 };
    }
    apply(merge(mine, stored));
  }

  // Writes the active record. Another tab may have written since this one
  // read, so what is stored is merged in first, unless `replace` is set.
  function persist(replace) {
    var id = record.id;
    if (!db) {
      memory.progress[id] = snapshot();
      return Promise.resolve();
    }
    var changed = false;
    return tx(PROGRESS, "readwrite", function (store) {
      var read = store.get(id);
      read.onsuccess = function () {
        if (record.id !== id) return;
        if (read.result && !replace) {
          var before = signature(record);
          absorb(read.result);
          changed = signature(record) !== before;
        }
        store.put(snapshot());
      };
    }).then(
      function () {
        if (changed) emitChange();
      },
      function () {
        // The write failed: progress then lasts for this visit only.
      }
    );
  }

  function saveActive() {
    return persist().then(function () {
      return dbPut(META, { key: ACTIVE, value: record.id }).catch(
        function () {}
      );
    });
  }

  // Progress from before IndexedDB: a list of finished slugs and a place.
  function importOld() {
    try {
      var list = JSON.parse(window.localStorage.getItem(OLD_DONE) || "[]");
      var now = Date.now();
      if (Array.isArray(list)) {
        list.forEach(function (slug) {
          if (typeof slug === "string" && slug) record.done[slug] = now;
        });
      }
      var last = window.localStorage.getItem(OLD_LAST);
      if (last) record.last = { p: last, t: now };
    } catch (e) {
      // Nothing stored, or storage is unavailable.
    }
  }

  function removeOld() {
    try {
      window.localStorage.removeItem(OLD_DONE);
      window.localStorage.removeItem(OLD_LAST);
    } catch (e) {
      // Nothing to remove.
    }
  }

  function loadActive() {
    return dbGet(META, ACTIVE)
      .then(function (row) {
        return row ? dbGet(PROGRESS, row.value) : null;
      })
      .catch(function () {
        return null;
      });
  }

  function open() {
    return openDb()
      .then(function (d) {
        db = d;
        return loadActive();
      })
      .then(function (stored) {
        if (stored) {
          record = clean(stored);
          return;
        }
        record = blank();
        importOld();
        return saveActive().then(function () {
          // Keep the old copy if it could not be moved.
          if (db) removeOld();
        });
      })
      .then(function () {
        startAuth();
        document.addEventListener("visibilitychange", onVisibility);
        window.addEventListener("online", function () {
          if (!clientPromise) resumeSession();
          else sync();
        });
      });
  }

  // Coming back to the tab: another tab, or another device, may have moved
  // on. Leaving it: send what is waiting.
  function onVisibility() {
    if (document.visibilityState === "hidden") {
      flush();
      return;
    }
    var id = record.id;
    loadActive()
      .then(function (stored) {
        if (!stored || record.id !== id) return;
        var before = record.id + signature(record);
        if (stored.id === id) {
          absorb(stored);
        } else {
          // Another tab signed out, or signed in to another account.
          record = clean(stored);
        }
        if (record.id + signature(record) !== before) emitChange();
      })
      .then(function () {
        if (!clientPromise) resumeSession();
        else if (user && Date.now() - lastPull > PULL_EVERY) sync();
      });
  }

  // --------------------------------------------------------------- changes

  function cancelPush() {
    window.clearTimeout(pushTimer);
    pushDue = 0;
  }

  // A later change never postpones a push that is already waiting.
  function schedulePush(delay) {
    var due = Date.now() + delay;
    if (pushDue && pushDue <= due) return;
    window.clearTimeout(pushTimer);
    pushDue = due;
    pushTimer = window.setTimeout(flush, delay);
  }

  function touch(delay) {
    record.updatedAt = Date.now();
    record.dirty = true;
    persist();
    if (user) schedulePush(delay);
  }

  function markDone(slug) {
    if (record.done[slug]) return false;
    record.done[slug] = Math.max(Date.now(), record.resetAt + 1);
    touch(PUSH_SOON);
    return true;
  }

  function reset() {
    record.done = {};
    record.resetAt = Math.max(Date.now(), record.resetAt + 1);
    touch(PUSH_SOON);
  }

  function setLast(p) {
    if (record.last && record.last.p === p) return;
    record.last = { p: p, t: Date.now() };
    touch(PUSH_LATER);
  }

  // --------------------------------------------------------------- account

  function setAuth(patch) {
    var changed = false;
    Object.keys(patch).forEach(function (key) {
      if (auth[key] !== patch[key]) {
        auth[key] = patch[key];
        changed = true;
      }
    });
    if (!changed) return;
    authListeners.forEach(function (listener) {
      listener(authState());
    });
  }

  function authState() {
    return {
      available: auth.available,
      status: auth.status,
      email: auth.email,
      sync: auth.sync,
    };
  }

  // The session is kept beside the progress, not in localStorage.
  var authStorage = {
    getItem: function (key) {
      return dbGet(META, AUTH_PREFIX + key).then(
        function (row) {
          return row ? row.value : null;
        },
        function () {
          return null;
        }
      );
    },
    setItem: function (key, value) {
      return dbPut(META, { key: AUTH_PREFIX + key, value: value }).catch(
        function () {}
      );
    },
    removeItem: function (key) {
      return dbDelete(META, AUTH_PREFIX + key).catch(function () {});
    },
  };

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (window.supabase && window.supabase.createClient) {
        resolve();
        return;
      }
      var script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = function () {
        resolve();
      };
      script.onerror = function () {
        reject(new Error("Could not load " + src));
      };
      document.head.appendChild(script);
    });
  }

  function loadClient() {
    if (clientPromise) return clientPromise;
    clientPromise = loadScript(config.lib).then(function () {
      client = window.supabase.createClient(config.url, config.key, {
        auth: {
          flowType: "pkce",
          storage: authStorage,
          storageKey: SESSION_KEY,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      client.auth.onAuthStateChange(function (event, session) {
        // The client must not be called from inside its own callback.
        window.setTimeout(function () {
          onSession(session);
        }, 0);
      });
      return client;
    });
    clientPromise.catch(function () {
      clientPromise = null;
    });
    return clientPromise;
  }

  function startAuth() {
    if (!config) return;
    var query = new URLSearchParams(window.location.search);
    // Google or Supabase refused: say so, and tidy the address.
    if (query.has("error") && query.has("error_description")) {
      ["error", "error_code", "error_description"].forEach(function (key) {
        query.delete(key);
      });
      var rest = query.toString();
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname +
          (rest ? "?" + rest : "") +
          window.location.hash
      );
      notice = "failed";
    }
    resumeSession(query.has("code"));
  }

  // Loads the client when a session is stored, or when the visitor is on
  // the way back from Google.
  function resumeSession(returning) {
    if (!config || clientPromise) return;
    dbGet(META, AUTH_PREFIX + SESSION_KEY)
      .catch(function () {
        return null;
      })
      .then(function (stored) {
        if (!stored && !returning) return;
        if (clientPromise) return;
        setAuth({ status: "busy" });
        return loadClient();
      })
      .catch(function (error) {
        setAuth({ status: "out" });
        if (window.console) console.warn(error);
      });
  }

  function onSession(session) {
    var next = session && session.user ? session.user : null;
    if (!next) {
      user = null;
      cancelPush();
      setAuth({ status: "out", email: "", sync: "idle" });
      return;
    }
    var changed = !user || user.id !== next.id;
    user = next;
    setAuth({ status: "in", email: next.email || "" });
    if (changed) adopt().then(sync);
  }

  // Makes sure the active record belongs to the account that just signed in.
  function adopt() {
    var uid = user.id;
    if (record.owner === uid) return Promise.resolve();
    return dbAll(PROGRESS)
      .catch(function () {
        return [];
      })
      .then(function (all) {
        var mine = all.filter(function (other) {
          return other.owner === uid && other.id !== record.id;
        })[0];

        if (!record.owner) {
          // A reset made before signing in was about this browser only. It
          // must not clear what the account already holds.
          record.resetAt = 0;
          if (!mine) {
            record.owner = uid;
            record.dirty = true;
            return persist(true);
          }
          // This browser already holds a record of this account: the
          // anonymous one is folded into it.
          var anonymous = record;
          record = clean(mine);
          apply(merge(record, anonymous));
          record.dirty = true;
          record.updatedAt = Date.now();
          return dbDelete(PROGRESS, anonymous.id)
            .catch(function () {})
            .then(saveActive)
            .then(emitChange);
        }

        // The record belongs to another account. It is left as it is.
        record = mine ? clean(mine) : blank();
        record.owner = uid;
        return saveActive().then(emitChange);
      });
  }

  function fromRow(row) {
    return { done: row.done, last: row.last, resetAt: row.reset_at };
  }

  function push() {
    var id = record.id;
    var stamp = record.updatedAt;
    return client
      .from(TABLE)
      .upsert(
        {
          id: id,
          done: record.done,
          last: record.last,
          reset_at: record.resetAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .then(function (result) {
        if (result.error) throw result.error;
        // Only clean if nothing changed while the request was out.
        if (record.id !== id || record.updatedAt !== stamp) return;
        record.dirty = false;
        return persist();
      });
  }

  function synced() {
    if (!user) return;
    setAuth({ sync: record.dirty ? "syncing" : "synced" });
    // Changed while the request was out: send again.
    if (record.dirty) schedulePush(PUSH_SOON);
  }

  function failed(error) {
    if (user) setAuth({ sync: "error" });
    if (window.console) console.warn("Progress was not synced.", error);
  }

  // Sends what is waiting, without reading first.
  function flush() {
    cancelPush();
    if (!client || !user || !record.dirty) return Promise.resolve();
    if (syncing) {
      syncAgain = true;
      return syncing;
    }
    setAuth({ sync: "syncing" });
    return push().then(synced, failed);
  }

  // Reads every record of the account, merges them into this one, and
  // writes this one back if it differs from its row.
  function sync() {
    if (!client || !user) return Promise.resolve();
    if (syncing) {
      syncAgain = true;
      return syncing;
    }
    cancelPush();
    setAuth({ sync: "syncing" });
    var id = record.id;
    var uid = user.id;
    syncing = client
      .from(TABLE)
      .select("id,done,last,reset_at")
      .eq("user_id", uid)
      .then(function (result) {
        if (result.error) throw result.error;
        // Signed out, or switched account, while the request was out.
        if (record.id !== id || !user || user.id !== uid) return;
        lastPull = Date.now();
        var before = signature(record);
        var merged = record;
        var own = null;
        result.data.forEach(function (row) {
          var state = fromRow(row);
          if (row.id === id) own = merge(state, {});
          merged = merge(merged, state);
        });
        apply(merged);
        var changed = signature(record) !== before;
        var stale = !own || signature(own) !== signature(record);
        return (changed ? persist() : Promise.resolve()).then(function () {
          if (changed) emitChange();
          if (stale || record.dirty) return push();
        });
      })
      .then(synced, failed)
      .then(function () {
        syncing = null;
        if (!syncAgain) return;
        syncAgain = false;
        return sync();
      });
    return syncing;
  }

  // Whether the project accepts Google sign-in. Asked before leaving the
  // page, so that a provider that is switched off shows a message here
  // instead of an error page there.
  function providerReady() {
    return fetch(config.url + "/auth/v1/settings", {
      headers: { apikey: config.key },
    })
      .then(function (response) {
        return response.ok ? response.json() : null;
      })
      .then(function (settings) {
        return Boolean(
          settings && settings.external && settings.external.google
        );
      })
      .catch(function () {
        return false;
      });
  }

  // Resolves to "redirect" when the browser is on its way to Google, and to
  // "unavailable" when sign-in cannot be used.
  function signIn() {
    if (!config) return Promise.resolve("unavailable");
    setAuth({ status: "busy" });
    return providerReady()
      .then(function (ready) {
        if (!ready) return "unavailable";
        return loadClient()
          .then(function (c) {
            return c.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo: window.location.origin + window.location.pathname,
              },
            });
          })
          .then(function (result) {
            if (result.error) throw result.error;
            return "redirect";
          });
      })
      .catch(function (error) {
        if (window.console) console.warn(error);
        return "unavailable";
      })
      .then(function (outcome) {
        if (outcome !== "redirect") {
          setAuth({ status: user ? "in" : "out" });
        }
        return outcome;
      });
  }

  // Signing out sends what is waiting, ends the session in this browser, and
  // starts a new anonymous record. The account's record stays stored here,
  // and is picked up again at the next sign-in.
  function signOut() {
    if (!client || !user) return Promise.resolve();
    setAuth({ status: "busy" });
    return flush()
      .then(function () {
        return client.auth.signOut({ scope: "local" });
      })
      .catch(function (error) {
        if (window.console) console.warn(error);
      })
      .then(function () {
        user = null;
        cancelPush();
        record = blank();
        return saveActive();
      })
      .then(function () {
        setAuth({ status: "out", email: "", sync: "idle" });
        emitChange();
      });
  }

  function configure(options) {
    config =
      options && options.url && options.key && options.lib ? options : null;
    auth.available = Boolean(config);
  }

  window.LearnStore = {
    configure: configure,
    open: open,
    done: function () {
      return record.done;
    },
    last: function () {
      return record.last ? record.last.p : "";
    },
    markDone: markDone,
    reset: reset,
    setLast: setLast,
    onChange: function (listener) {
      changeListeners.push(listener);
    },
    auth: authState,
    // "failed" once, after coming back from a sign-in that was refused.
    takeNotice: function () {
      var value = notice;
      notice = "";
      return value;
    },
    onAuth: function (listener) {
      authListeners.push(listener);
    },
    signIn: signIn,
    signOut: signOut,
    sync: sync,
  };
})();
