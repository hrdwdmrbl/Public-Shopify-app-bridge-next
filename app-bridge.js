!(function () {
  var t, n;
  function e(t, n) {
    if (n)
      for (let e in n) {
        const o = n[e];
        null != o && "" !== o && (t[e] = o);
      }
  }
  function o(t, n) {
    customElements.get(t) || customElements.define(t, n);
  }
  const i = null != (t = globalThis.HTMLElement) ? t : class {};
  class r extends i {
    constructor() {
      super(),
        (this.attachShadow({ mode: "open" }).innerHTML =
          "<style>:host{display: none;}</style><slot></slot>");
    }
  }
  function a(t) {
    try {
      return navigator.userAgent.includes(t);
    } catch (n) {
      return !1;
    }
  }
  function c() {
    return a("Unframed") && "MobileWebView" in window;
  }
  function s() {
    return a("Shopify Mobile");
  }
  function u() {
    return a("Shopify POS");
  }
  const l = (() => {
      for (let n = 0; n < parent.frames.length; n++)
        try {
          const t = parent.frames[n];
          if (t.location.origin === location.origin) return t === window;
        } catch (t) {}
      return !1;
    })(),
    f = [
      "hmac",
      "locale",
      "protocol",
      "session",
      "id_token",
      "shop",
      "timestamp",
      "host",
      "embedded",
      "appLoadId",
    ];
  function d(t) {
    const n = new URL(t);
    return f.forEach((t) => n.searchParams.delete(t)), n;
  }
  const h = [
    "FailedAuthentication",
    "InvalidAction",
    "InvalidActionType",
    "InvalidOptions",
    "InvalidOrigin",
    "InvalidPayload",
    "Network",
    "Permission",
    "Persistence",
    "UnexpectedAction",
    "UnsupportedOperation",
  ];
  function p(t, n, e) {
    h.forEach((o) => {
      t.subscribe("Error." + o, n, e);
    });
  }
  const m = /\/app\-?bridge[/.-]/i;
  "object" == typeof document &&
    (null == (n = window.document.currentScript) || n.src);
  const v = new URL("https://cdn.shopify.com/shopifycloud/app-bridge.js")
      .hostname,
    b = ["apiKey", "shop"],
    g = /(^admin\.shopify\.com|\.myshopify\.com|\.spin\.dev|localhost)$/,
    w = { TITLE_BAR: "TITLEBAR", WEBVITALS: "WEB_VITALS" };
  function y(t, n) {
    var e;
    const [o, ...i] = t.split("."),
      r = E(o);
    let a = "APP::" + (null != (e = w[r]) ? e : r);
    for (const s of i) a += "::" + E(s);
    const c = { group: o, type: a };
    return null != n && (c.payload = n), c;
  }
  function E(t) {
    return t.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase();
  }
  const T = Symbol.for("RemoteUi::Retain"),
    L = Symbol.for("RemoteUi::Release"),
    A = Symbol.for("RemoteUi::RetainedBy");
  class S {
    constructor() {
      this.memoryManaged = new Set();
    }
    add(t) {
      this.memoryManaged.add(t), t[A].add(this), t[T]();
    }
    release() {
      for (const t of this.memoryManaged) t[A].delete(this), t[L]();
      this.memoryManaged.clear();
    }
  }
  function P(t) {
    return !!(t && t[T] && t[L]);
  }
  function k(t, { deep: n = !0 } = {}) {
    return C(t, n, new Map());
  }
  function C(t, n, e) {
    const o = e.get(t);
    if (null != o) return o;
    const i = P(t);
    if ((i && t[T](), e.set(t, i), n)) {
      if (Array.isArray(t)) {
        const o = t.reduce((t, o) => C(o, n, e) || t, i);
        return e.set(t, o), o;
      }
      if (R(t)) {
        const o = Object.keys(t).reduce((o, i) => C(t[i], n, e) || o, i);
        return e.set(t, o), o;
      }
    }
    return e.set(t, i), i;
  }
  function R(t) {
    if (null == t || "object" != typeof t) return !1;
    const n = Object.getPrototypeOf(t);
    return null == n || n === Object.prototype;
  }
  const O = "_@f";
  function M(t) {
    const n = new Map(),
      e = new Map(),
      o = new Map();
    return {
      encode: function o(i, r = new Map()) {
        if (null == i) return [i];
        const a = r.get(i);
        if (a) return a;
        if ("object" == typeof i) {
          if (Array.isArray(i)) {
            r.set(i, [void 0]);
            const t = [],
              n = [
                i.map((n) => {
                  const [e, i = []] = o(n, r);
                  return t.push(...i), e;
                }),
                t,
              ];
            return r.set(i, n), n;
          }
          if (R(i)) {
            r.set(i, [void 0]);
            const t = [],
              n = [
                Object.keys(i).reduce((n, e) => {
                  const [a, c = []] = o(i[e], r);
                  return t.push(...c), { ...n, [e]: a };
                }, {}),
                t,
              ];
            return r.set(i, n), n;
          }
        }
        if ("function" == typeof i) {
          if (n.has(i)) {
            const t = n.get(i),
              e = [{ [O]: t }];
            return r.set(i, e), e;
          }
          const o = t.uuid();
          n.set(i, o), e.set(o, i);
          const a = [{ [O]: o }];
          return r.set(i, a), a;
        }
        const c = [i];
        return r.set(i, c), c;
      },
      decode: i,
      async call(t, n) {
        const o = new S(),
          r = e.get(t);
        if (null == r)
          throw Error(
            "You attempted to call a function that was already released."
          );
        try {
          const t = P(r) ? [o, ...r[A]] : [o];
          return await r(...i(n, t));
        } finally {
          o.release();
        }
      },
      release(t) {
        const o = e.get(t);
        o && (e.delete(t), n.delete(o));
      },
      terminate() {
        n.clear(), e.clear(), o.clear();
      },
    };
    function i(n, e) {
      if ("object" == typeof n) {
        if (null == n) return n;
        if (n instanceof ArrayBuffer) return n;
        if (Array.isArray(n)) return n.map((t) => i(t, e));
        if (O in n) {
          const i = n[O];
          if (o.has(i)) return o.get(i);
          let r = 0,
            a = !1;
          const c = () => {
              (r -= 1), 0 === r && ((a = !0), o.delete(i), t.release(i));
            },
            s = () => {
              r += 1;
            },
            u = new Set(e),
            l = (...n) => {
              if (a)
                throw Error(
                  "You attempted to call a function that was already released."
                );
              if (!o.has(i))
                throw Error(
                  "You attempted to call a function that was already revoked."
                );
              return t.call(i, n);
            };
          Object.defineProperties(l, {
            [L]: { value: c, writable: !1 },
            [T]: { value: s, writable: !1 },
            [A]: { value: u, writable: !1 },
          });
          for (const t of u) t.add(l);
          return o.set(i, l), l;
        }
        return Object.keys(n).reduce((t, o) => ({ ...t, [o]: i(n[o], e) }), {});
      }
      return n;
    }
  }
  function B() {
    return `${I()}-${I()}-${I()}-${I()}`;
  }
  function I() {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16);
  }
  const x = (t) => t.toString(16),
    N = `${x(Date.now())}-${x((1e9 * Math.random()) | 0)}-`;
  let U = 0;
  function $() {
    return N + x(++U);
  }
  const j = Symbol(),
    D = Symbol(),
    _ = Symbol();
  function F(t) {
    !("type" in t) ||
      ("radio" !== t.type && "checkbox" !== t.type) ||
      t.dispatchEvent(new Event("click", { bubbles: !0 })),
      t.dispatchEvent(
        new InputEvent("input", { bubbles: !0, inputType: "reset" })
      ),
      t.dispatchEvent(new Event("change", { bubbles: !0 }));
  }
  function q(t) {
    return !!t && "form" === t.localName;
  }
  const z = Symbol();
  function V(t, n, e) {
    const o = t[n];
    return (
      Object.defineProperty(t, n, {
        enumerable: !0,
        configurable: !0,
        value: e,
        writable: !0,
      }),
      (e[z] = o),
      o
    );
  }
  const W = (t, n, e) => {
      const o = self.fetch;
      V(globalThis, "fetch", async function (i, r) {
        var a;
        const c = i instanceof Request ? i : new Request(i),
          s = new URL(c.url),
          u =
            s.hostname === location.hostname ||
            s.hostname.endsWith("." + location.hostname),
          l = new Headers((null == r ? void 0 : r.headers) || {}),
          { adminApiPromise: f } = e,
          d = await f;
        if (!u && d) {
          const t = i instanceof Request ? i : new Request(i, r),
            n = Array.from(t.headers.entries()),
            e = await d.shouldIntercept(t.method, t.url, n);
          if (e && e.intercept) {
            const e = await d.fetch({
              method: t.method,
              url: t.url,
              headers: n,
              body: null != (a = await t.text()) ? a : void 0,
            });
            return new Response(e.body, e);
          }
        }
        !u ||
          c.headers.has("Authorization") ||
          l.has("Authorization") ||
          l.set("Authorization", "Bearer " + (await t.idToken())),
          !u ||
            c.headers.has("Accept-Language") ||
            l.has("Accept-Language") ||
            l.set("Accept-Language", t.config.locale);
        const h = await o(c, { ...r, headers: l }),
          p = h.headers.get("X-Shopify-API-Request-Failure-Reauthorize-Url");
        return u && p
          ? (n.send("Navigation.redirect.remote", {
              url: new URL(p, location.href).href,
            }),
            new Promise(() => {}))
          : h;
      });
    },
    Y = (t, n) => {
      t.idToken = () =>
        new Promise((t) => {
          n.subscribe(
            "SessionToken.respond",
            ({ sessionToken: n }) => {
              t(n);
            },
            { once: !0 }
          ),
            n.send("SessionToken.request");
        });
    },
    H = {
      oneOf(t, { caseInsensitive: n = !0 } = {}) {
        n && (t = t.map((t) => t.toLowerCase()));
        const e = new Set(t);
        return (t) => (
          n && (t = null == t ? void 0 : t.toLowerCase()), e.has(t)
        );
      },
      anyString: () => (t) => "string" == typeof t,
      flag: () => (t) => null != t && 0 === t.length,
    },
    J = { anyText: { type: 3 } };
  function X(t) {
    return `<${t.localName}>`;
  }
  function G(t, n) {
    return !(
      (n.type && n.type !== t.nodeType) ||
      (n.name && n.name !== t.localName)
    );
  }
  function K(t, n) {
    var e;
    if ((n.type && n.type !== t.nodeType) || (n.name && n.name !== t.localName))
      throw Error("Unexpected tag " + t.outerHTML);
    const { attributes: o = {}, children: i = [] } = n;
    if (1 === t.nodeType)
      !(function (t, n = {}) {
        const e = Object.entries(n),
          o = new Set(t.getAttributeNames());
        for (const [r, a] of e)
          if (o.delete(r)) {
            if (a.value && !Q(a.value)(t.getAttribute(r), r, t))
              throw Error(`Unexpected value for attribute "${r}" on ${X(t)}`);
          } else if (a.required)
            throw Error(`Missing attribute "${r}" on ${X(t)}`);
        const i = Array.from(o).filter((t) => !t.startsWith("data-"));
        if (0 !== i.length)
          throw Error(`Unexpected attributes on ${X(t)}: ${i}`);
      })(t, o);
    else if (
      3 === t.nodeType &&
      (null == (e = o.data) ? void 0 : e.value) &&
      !Q(o.data.value)(t.data, "data", t)
    )
      throw Error("Unexpected text");
    for (const r of t.childNodes) {
      if (8 === r.nodeType) continue;
      if (3 === r.nodeType && 0 === r.data.trim().length) continue;
      const n = i.find((t) => G(r, t));
      if (!n) throw Error(`Unexpected tag <${r.outerHTML}> in ${X(t)}`);
      K(r, n);
    }
  }
  function Q(t) {
    return "function" == typeof t
      ? t
      : t instanceof RegExp
      ? (n) => ((t.lastIndex = 0), t.test(null != n ? n : ""))
      : (n) => t === n;
  }
  const Z = { value: H.anyString() },
    tt = { id: Z, name: Z, class: Z, rel: Z, onclick: Z },
    nt = tt,
    et = { ...tt, active: Z, href: Z, target: Z },
    ot = "ui-nav-menu",
    it = {
      name: "ui-nav-menu",
      children: [{ name: "a", attributes: et, children: [J.anyText] }],
    },
    rt = new WeakMap();
  function at(t) {
    if (!rt.has(t)) {
      const n = "href" in t ? btoa(t.href) : $();
      rt.set(t, n);
    }
    return rt.get(t);
  }
  const ct = /^shopify:\/*admin\//i;
  function st(t) {
    const n = d(new URL(t)).href;
    if (ct.test(n)) return n.replace(ct, "/");
  }
  const ut = {
      query: "",
      selectionIds: [],
      action: "add",
      multiple: !1,
      filter: { hidden: !0, variants: !0, draft: void 0, archived: void 0 },
    },
    lt = new Set(["product", "variant", "collection"]),
    ft = "APP::SCANNER::OPEN::CAMERA";
  function dt(t) {
    const n = (null == t ? void 0 : t.Scanner) || {},
      { Dispatch: e } = n[ft] || {};
    return !!e;
  }
  let ht = !1;
  const pt = "ui-title-bar",
    mt = Symbol(),
    vt = [
      {
        name: "button",
        attributes: {
          ...nt,
          variant: { value: H.oneOf(["breadcrumb", "primary"]) },
        },
        children: [J.anyText],
      },
      {
        name: "a",
        attributes: {
          ...et,
          variant: { value: H.oneOf(["breadcrumb", "primary"]) },
        },
        children: [J.anyText],
      },
    ],
    bt = {
      name: "section",
      attributes: { label: Z },
      children: [
        { name: "button", attributes: nt, children: [J.anyText] },
        { name: "a", attributes: et, children: [J.anyText] },
      ],
    };
  bt.children.push(bt);
  const gt = {
    name: "ui-title-bar",
    attributes: { title: Z },
    children: [...vt, bt],
  };
  function wt(t) {
    var n;
    return (
      t[mt] || (t[mt] = $()),
      {
        id: t[mt],
        label: null != (n = t.textContent) ? n : "",
        disabled: t.disabled,
      }
    );
  }
  function yt(t) {
    return null != t && (Et(t) || yt(t.parentNode));
  }
  function Et(t) {
    return "TITLE" === t.nodeName;
  }
  const Tt = { duration: 5e3 },
    Lt = Object.assign({
      "./contextual-save-bar.ts": (t, n) => {
        if (!l) return;
        const e = $();
        function o(t) {
          return (
            !0 === t[j] &&
            (("value" in t && t.value !== t[D]) ||
              ("checked" in t && t.checked !== t[_]))
          );
        }
        function i() {
          let t = !1;
          for (const n of document.forms)
            if (((t = [].some.call(n.elements, o)), t)) break;
          t
            ? n.send("ContextualSaveBar.show", {
                id: e,
                leaveConfirmationDisable: !0,
              })
            : n.send("ContextualSaveBar.hide", { id: e });
        }
        function r(t) {
          if (t.requestSubmit) return t.requestSubmit();
          const n = document.createElement("input");
          (n.type = "submit"),
            (n.hidden = !0),
            t.appendChild(n),
            n.click(),
            t.removeChild(n);
        }
        function a(t) {
          const n = t.target;
          n[j] = !0;
          const e = n.form;
          e && e.hasAttribute("data-save-bar") && i();
        }
        function c(t) {
          t[j] ||
            ("value" in t && (t[D] = t.value),
            "checked" in t && (t[_] = t.checked));
        }
        n.subscribe("ContextualSaveBar.save", () => {
          for (const t of document.forms)
            t.hasAttribute("data-save-bar") && r(t);
        }),
          n.subscribe("ContextualSaveBar.discard", () => {
            for (const t of document.forms)
              t.hasAttribute("data-save-bar") && t.reset();
          }),
          addEventListener("submit", function (t) {
            const n = t.target;
            for (const e of n.elements) (e[j] = !1), c(e);
            i();
          }),
          addEventListener("reset", function (t) {
            const n = t.target;
            for (const e of n.elements)
              D in e &&
                Object.getOwnPropertyDescriptor(
                  e.constructor.prototype,
                  "value"
                ).set.call(e, e[D]),
                _ in e && (e.checked = e[_]),
                (e[j] = !1),
                c(e),
                F(e);
            i();
          }),
          addEventListener("change", a),
          addEventListener("input", a),
          addEventListener("focusin", (t) => {
            const n = t.target;
            n && ("checked" in n || "value" in n) && c(n);
          }),
          addEventListener("beforeinput", (t) => {
            c(t.target);
          }),
          new MutationObserver((t) => {
            for (const n of t) {
              if (n.attributeName && "form" === n.target.localName) return i();
              for (const t of n.addedNodes) if (q(t)) return i();
              for (const t of n.removedNodes) if (q(t)) return i();
            }
          }).observe(document, {
            subtree: !0,
            childList: !0,
            attributes: !0,
            attributeFilter: ["data-save-bar"],
          }),
          i();
      },
      "./environment.ts": (t) => {
        t.environment = {
          mobile: s(),
          embedded: top !== self || c(),
          pos: u(),
        };
      },
      "./fetch.ts": W,
      "./id-token.ts": Y,
      "./loading.ts": (t, n) => {
        t.loading = (t) => {
          t ? n.send("Loading.start") : n.send("Loading.stop");
        };
      },
      "./navigation-menu.ts": (t, n) => {
        let e;
        function i() {
          e || (e = setTimeout(a, 0));
        }
        async function a(t) {
          clearTimeout(e);
          const o = await c;
          if (!o)
            return void console.warn(ot + " cannot be used in modal context");
          const i = Array.from(document.querySelectorAll(ot)),
            r = { items: i.flatMap((t) => t.menuItems()) },
            a =
              null != t
                ? t
                : i.map((t) => t.selectedMenuItemId()).find(Boolean);
          a && (r.active = a), n.send(`Menu.${o}_Menu.UPDATE`, r), (e = 0);
        }
        const c = new Promise((t) => {
          n.subscribe(
            "getState",
            ({ features: n }) => {
              const e = (null == n ? void 0 : n.Menu) || {},
                { Dispatch: o } = e["APP::MENU::NAVIGATION_MENU::UPDATE"] || {},
                { Dispatch: i } = e["APP::MENU::CHANNEL_MENU::UPDATE"] || {};
              t(i ? "channel" : o ? "navigation" : void 0);
            },
            { once: !0 }
          );
        });
        o(
          ot,
          class extends r {
            connectedCallback() {
              this.t = new AbortController();
              const t = { signal: this.t.signal };
              n.subscribe("Navigation.redirect.app", (t) => this.o(t), t),
                addEventListener("beforeunload", () => this.i(), t),
                addEventListener("popstate", () => this.u(), t),
                (this.l = new MutationObserver(() => this.u())),
                this.l.observe(this, {
                  childList: !0,
                  subtree: !0,
                  attributes: !0,
                  characterData: !0,
                }),
                this.u();
            }
            o(t) {
              var e, o, r;
              if (!this.t) return;
              const {
                pathname: c,
                search: s,
                href: u,
              } = d(new URL(t.path, location.href));
              if (u === d(location.href).href) return;
              const l = (t) => {
                  for (const [n, e] of this.h())
                    if (e.destination.path === t) return n;
                },
                f = null == (e = this.h(!0).next().value) ? void 0 : e[0],
                h = null != (r = null != (o = l(t.path)) ? o : l(c)) ? r : f;
              if (h) {
                let t = function (t) {
                  (n = t.defaultPrevented), t.preventDefault();
                };
                if (
                  ("http:" !== h.protocol && "https:" !== h.protocol) ||
                  new URL("", h.href).href === new URL("", location.href).href
                )
                  return h.click(), void i();
                let n = !1;
                if (
                  (addEventListener("click", t),
                  h.click(),
                  removeEventListener("click", t),
                  n)
                )
                  return void i();
              }
              h && a(at(h)), this.i();
              const p = `${t.path}${t.path.includes("?") ? "&=" : "?="}`;
              n.send("Navigation.redirect.app", { path: p });
            }
            u() {
              K(this, it), i();
            }
            i() {
              var t, n;
              null == (t = this.t) || t.abort(),
                (this.t = void 0),
                null == (n = this.l) || n.disconnect(),
                (this.l = void 0);
            }
            disconnectedCallback() {
              this.i(), i();
            }
            *h(t = !1) {
              var n;
              const e = this.querySelectorAll(":scope > a");
              for (const o of e) {
                const e = null != (n = o.textContent) ? n : "",
                  i = o.pathname + o.search;
                t === (o.rel + "").includes("home") &&
                  (yield [
                    o,
                    {
                      id: at(o),
                      destination: { path: i },
                      label: e,
                      redirectType: "APP::NAVIGATION::REDIRECT::APP",
                    },
                  ]);
              }
            }
            menuItems(t = !1) {
              return Array.from(this.h(t)).map(([, t]) => t);
            }
            selectedMenuItemId() {
              const t = Array.from(
                this.querySelectorAll(':scope > a:not([rel~="home"])')
              );
              let n = t.find((t) => t.hasAttribute("active"));
              if (!n) {
                const e = d(location.href);
                (e.hash = ""), (n = t.find((t) => t.href === e.href));
              }
              return n ? at(n) : null;
            }
          }
        );
      },
      "./navigation.ts": (t, n) => {
        const e = self.navigation;
        function o(t, e) {
          if (!t) return;
          const o = d(new URL(t, location.href)),
            i = `${o.pathname}${o.search}${o.hash}`;
          l && n.send("Navigation.history." + e, { path: i });
        }
        if (e && "navigate" in e) {
          e.navigate;
          const t = V(e, "navigate", function (e, o) {
            const i = st(e);
            return i
              ? (n.send("Navigation.redirect.admin.path", { path: i }),
                {
                  committed: new Promise(() => {}),
                  finished: new Promise(() => {}),
                })
              : t.call(this, e, o);
          });
        }
        if (e && "oncurrententrychange" in e)
          e.addEventListener("currententrychange", () => {
            o(location.href, "replace");
          });
        else {
          const t = history.pushState;
          V(history, "pushState", function (n, e, i) {
            t.call(this, n, e, i), o(i, "replace");
          });
          const n = history.replaceState;
          V(history, "replaceState", function (t, e, i) {
            n.call(this, t, e, i), o(i, "replace");
          }),
            addEventListener("popstate", () => {
              o(location.href, "replace");
            });
        }
        const i = self.open;
        V(self, "open", function (t, e, o) {
          if (null == t) return i.call(this, t, e, o);
          const r = (function (t) {
            const n = new URL(t, location.href);
            return "app:" === n.protocol
              ? new URL(n.href.replace(/^app:\/{0,2}/, ""), location.href).href
              : n.href;
          })(t);
          (e = (e || "") + ""), (o = (o || "") + "");
          const a = st(r);
          if (a)
            return (
              n.send("Navigation.redirect.admin.path", {
                path: a,
                newContext: "" === e || "_blank" === e,
              }),
              null
            );
          switch (e) {
            case "_self":
              break;
            case "_top":
            case "_parent":
              return n.send("Navigation.redirect.remote", { url: r }), top;
            case "_modal":
              throw Error("_modal is not yet implemented");
            case "":
            case "_blank":
              if (!/noopener/i.test(o)) break;
              return (
                n.send("Navigation.redirect.remote", {
                  url: r,
                  newContext: !0,
                }),
                null
              );
          }
          return i.call(this, r, e, o);
        }),
          addEventListener("click", (t) => {
            let n = t.target;
            for (; n; ) {
              if (n instanceof Element && "A" === n.tagName) {
                const e = n.getAttribute("href");
                if (null == e) {
                  n = n.parentNode;
                  continue;
                }
                const o = new URL(e, location.href).protocol;
                if ("shopify:" === o || "app:" === o || "extension:" === o) {
                  t.preventDefault();
                  const o = n.getAttribute("target") || void 0,
                    i = n.getAttribute("rel") || void 0;
                  return void open(e, o, i);
                }
              }
              n = n.parentNode;
            }
          }),
          o(location.href, "replace");
      },
      "./print.ts": (t, n) => {
        (s() || u()) &&
          V(self, "print", function () {
            var t;
            const e =
              (null == (t = document.scrollingElement)
                ? void 0
                : t.scrollHeight) || document.body.offsetHeight;
            n.send("Print.app", { height: e });
          });
      },
      "./resource-picker.ts": (t, n) => {
        let e;
        t.resourcePicker = function t(o) {
          if (e) return e.finally(() => t(o));
          const i = new Promise((t, i) => {
            const r = $(),
              {
                type: a,
                query: c,
                selectionIds: s,
                action: u,
                multiple: l,
                filter: f,
              } = Object.assign({}, ut, o);
            if (!lt.has(a))
              return i(
                Error(
                  "The 'type' option for resourcePicker must be one of " +
                    Array.from(lt).join(", ")
                )
              );
            const d = new AbortController(),
              { signal: h } = d;
            function m() {
              d.abort(), (e = void 0);
            }
            n.subscribe(
              "Resource_Picker.select",
              (n) => {
                m();
                const e = n.selection;
                Object.defineProperty(e, "selection", { value: e }), t(e);
              },
              { id: r, signal: h }
            ),
              n.subscribe(
                "Resource_Picker.cancel",
                () => {
                  m(), t(void 0);
                },
                { id: r, signal: h }
              ),
              p(
                n,
                (t) => {
                  m(), i(Error("ResourcePicker error", { cause: t }));
                },
                { id: r, signal: h }
              ),
              n.send("Resource_Picker.open", {
                id: r,
                resourceType: a,
                initialQuery: c,
                initialSelectionIds: s,
                actionVerb: null == u ? void 0 : u.toLowerCase(),
                selectMultiple: l,
                showHidden: null == f ? void 0 : f.hidden,
                showVariants: null == f ? void 0 : f.variants,
                showDraft: !1 !== (null == f ? void 0 : f.draft),
                showArchived: !1 !== (null == f ? void 0 : f.archived),
                showDraftBadge: void 0 === (null == f ? void 0 : f.draft),
                showArchivedBadge: void 0 === (null == f ? void 0 : f.archived),
              });
          });
          return (e = i), i;
        };
      },
      "./scanner.ts": (t, n) => {
        t.scanner = {
          capture: function () {
            return new Promise((t, e) => {
              const o = $(),
                i = new AbortController(),
                { signal: r } = i;
              function a(t) {
                i.abort(), e(Error("Scanner error", { cause: t }));
              }
              function c() {
                p(n, a, { signal: r, id: o }),
                  n.subscribe(
                    "Scanner.capture",
                    ({ data: n }) => {
                      i.abort(),
                        n && n.scanData
                          ? t({ data: n.scanData })
                          : e(Error("No scanner data"));
                    },
                    { id: o, signal: r }
                  ),
                  n.send("Scanner.open.camera", { id: o });
              }
              n.subscribe(
                "getState",
                ({ features: t }) => {
                  dt(t)
                    ? c()
                    : (function () {
                        const t = $(),
                          e = new AbortController();
                        i.signal.addEventListener("abort", () => e.abort()),
                          p(
                            n,
                            (t) => {
                              e.abort(), a(t);
                            },
                            { signal: e.signal, id: t }
                          ),
                          n.subscribe(
                            "Features.update",
                            ({ features: t }) => {
                              dt(t) && (e.abort(), c());
                            },
                            { signal: e.signal, id: t }
                          ),
                          n.send("Features.request", {
                            id: t,
                            feature: "Scanner",
                            action: ft,
                          });
                      })();
                },
                { once: !0, signal: r }
              );
            });
          },
        };
      },
      "./share.ts": (t, n) => {
        if (!s() && !u()) return;
        const e = navigator.share;
        V(navigator, "share", async function (t) {
          return t
            ? new Promise((e, o) => {
                const { title: i, text: r, url: a } = t,
                  c = $(),
                  s = new AbortController(),
                  { signal: u } = s;
                function l(t) {
                  s.abort(), o(Error("Share error", { cause: t }));
                }
                p(n, l, { signal: u, id: c }),
                  n.subscribe(
                    "Share.close",
                    (t) => {
                      const { success: n } = t;
                      n ? (s.abort(), e()) : l("Share is dismissed");
                    },
                    { signal: u, id: c }
                  ),
                  n.send("Share.show", {
                    id: c,
                    text: null != r ? r : i,
                    url: a,
                  });
              })
            : e.call(this, t);
        });
      },
      "./shortcut.ts": (t, n) => {
        if (ht) return;
        ht = !0;
        const e = { keys: ["k"], held: ["Meta", "Control"] };
        !(function ({ keys: t, held: n, handler: e }) {
          let o = [];
          document.addEventListener(
            "keydown",
            (i) => {
              t.flat().includes(i.key)
                ? (o.push(i.key),
                  ((e) => {
                    const i = t.every((t) => o.includes(t)),
                      r =
                        !n ||
                        ((t, n) => n.some((n) => t.getModifierState(n)))(e, n);
                    return i && r;
                  })(i) &&
                    !(() => {
                      const t = document.activeElement;
                      return (
                        null != t &&
                        null != t.tagName &&
                        ("INPUT" === t.tagName ||
                          "SELECT" === t.tagName ||
                          "TEXTAREA" === t.tagName ||
                          t.hasAttribute("contenteditable"))
                      );
                    })() &&
                    e(i))
                : (o = []);
            },
            { capture: !0 }
          );
        })({
          ...e,
          handler: () => {
            n.send("Shortcut.invoke", e);
          },
        });
      },
      "./title-bar.ts": (t, n) => {
        let e;
        function i() {
          var t;
          if (e)
            return null != (t = e.getAttribute("title")) ? t : document.title;
        }
        function a(t) {
          var n;
          const o = Array.from(
            null != (n = null == e ? void 0 : e.querySelectorAll("button, a"))
              ? n
              : []
          ).find((n) => n[mt] == t);
          null == o || o.click();
        }
        function c() {
          var t, o, r, a;
          !(function () {
            var t, n, o;
            e =
              null ==
              (o =
                null ==
                (n =
                  null == (t = document.documentElement)
                    ? void 0
                    : t.getElementsByTagName)
                  ? void 0
                  : n.call(t, pt))
                ? void 0
                : o[0];
          })();
          const {
              primaryButton: c,
              secondaryButtons: s,
              breadcrumb: u,
            } = null !=
            (o =
              null == (t = null == e ? void 0 : e.buttons) ? void 0 : t.call(e))
              ? o
              : {},
            l = { title: i() };
          c &&
            (l.buttons = Object.assign(null != (r = l.buttons) ? r : {}, {
              primary: c,
            })),
            s &&
              ((l.buttons = Object.assign(null != (a = l.buttons) ? a : {}, {
                secondary: s,
              })),
              u && (l.breadcrumbs = { id: "breadcrumb", label: u })),
            n.send("TitleBar.update", l);
        }
        const s = Object.getOwnPropertyDescriptor(Document.prototype, "title");
        Object.defineProperty(document, "title", {
          ...s,
          set(t) {
            s.set.call(this, t), c();
          },
        }),
          new MutationObserver((t) => {
            for (let n of t)
              if (
                yt(n.target) ||
                [].some.call(n.addedNodes, Et) ||
                [].some.call(n.removedNodes, Et)
              )
                return c();
          }).observe(document, {
            subtree: !0,
            childList: !0,
            characterData: !0,
          }),
          n.subscribe("TitleBar.buttons.button.click", (t) =>
            null == a ? void 0 : a(t.id)
          ),
          n.subscribe("TitleBar.breadcrumbs.button.click", (t) =>
            null == a ? void 0 : a(t.id)
          ),
          o(
            pt,
            class extends r {
              static get observedAttributes() {
                return ["title"];
              }
              connectedCallback() {
                (this.l = new MutationObserver(() => {
                  this.u();
                })),
                  this.l.observe(this, {
                    childList: !0,
                    subtree: !0,
                    attributes: !0,
                    characterData: !0,
                  }),
                  this.u();
              }
              p() {
                const t = this.querySelector(":scope > [variant=breadcrumb]");
                return t && (t[mt] = "breadcrumb"), t;
              }
              u() {
                K(this, gt), c();
              }
              disconnectedCallback() {
                var t;
                this.u(), null == (t = this.l) || t.disconnect();
              }
              attributeChangedCallback() {
                this.u();
              }
              buttons() {
                const t = this.p(),
                  n = this.querySelector(":scope > [variant=primary]"),
                  e = Array.from(
                    this.querySelectorAll(
                      ":scope > :not([variant=primary]):not([variant=breadcrumb]), :scope > section"
                    )
                  ).map((t) => {
                    return "SECTION" !== t.nodeName
                      ? wt(t)
                      : ((n = t)[mt] || (n[mt] = $()),
                        {
                          id: n[mt],
                          label:
                            null != (e = n.getAttribute("label"))
                              ? e
                              : "Actions",
                          buttons: Array.from(
                            n.querySelectorAll("button, a")
                          ).map(wt),
                        });
                    var n, e;
                  });
                return {
                  ...(t ? { breadcrumb: t.textContent } : {}),
                  ...(n ? { primaryButton: wt(n) } : {}),
                  secondaryButtons: e,
                };
              }
            }
          ),
          c();
      },
      "./toast.ts": (t, n) => {
        t.toast = {
          show(t, e = {}) {
            const o = $(),
              i = new AbortController(),
              {
                action: r,
                duration: a,
                isError: c,
                onAction: s,
                onDismiss: u,
              } = Object.assign({}, Tt, e);
            return (
              n.subscribe("Toast.action", () => (null == s ? void 0 : s()), {
                id: o,
                signal: i.signal,
              }),
              n.subscribe(
                "Toast.clear",
                () => {
                  i.abort(), null == u || u();
                },
                { id: o, signal: i.signal }
              ),
              n.send("Toast.show", {
                id: o,
                message: t,
                isError: c,
                duration: a,
                action: r ? { content: r } : void 0,
              }),
              o
            );
          },
          hide(t) {
            n.send("Toast.clear", { id: t });
          },
        };
      },
      "./user.ts": (t, n) => {
        t.user = () =>
          new Promise((t) => {
            n.subscribe(
              "getState",
              ({ staffMember: n, pos: e }) => {
                const o = { ...n, ...(e || {}).user },
                  i = {
                    id: o.id,
                    name: o.name || o.firstName || "",
                    firstName: o.firstName,
                    lastName: o.lastName,
                    email: o.email,
                    accountAccess: o.accountAccess,
                    accountType: o.accountType || o.userType,
                  };
                t(i);
              },
              { once: !0 }
            );
          });
      },
      "./web-vitals.ts": async (t, n) => {
        if ("undefined" == typeof window || window.$scwv || s() || u()) return;
        window.$scwv = !0;
        const {
            onLCP: e,
            onFID: o,
            onCLS: i,
            onFCP: r,
            onTTFB: a,
            onINP: c,
          } = await Promise.resolve().then(() => Ln),
          l = (t) => (e) => {
            n.send("WebVitals." + t, {
              id: e.id,
              metricName: e.name,
              value: e.value,
            });
          };
        e(l("largestContentfulPaint")),
          o(l("firstInputDelay")),
          i(l("CumulativeLayoutShift")),
          r(l("FirstContentfulPaint")),
          a(l("TimeToFirstByte")),
          c(l("InteractionToNextPaint"));
      },
    });
  !(async function () {
    var t, n, o;
    try {
      if ("then" in ((null == (t = self.shopify) ? void 0 : t.ready) || {}))
        return;
    } catch (E) {}
    if (
      !(function () {
        try {
          if (!document.currentScript)
            return (
              console.error(
                'The script tag loading App Bridge has `type="module"`'
              ),
              !1
            );
          const t = document.currentScript;
          return t.async
            ? (console.error("The script tag loading App Bridge has `async`"),
              !1)
            : t.defer
            ? (console.error("The script tag loading App Bridge has `defer`."),
              !1)
            : t.src
            ? new URL(t.src).hostname != v
              ? (console.error(
                  "The script tag loading App Bridge is not loading App Bridge from the Shopify CDN."
                ),
                !1)
              : 0 ===
                  [...document.scripts]
                    .filter((t) =>
                      (function (t) {
                        return (
                          !!t.src &&
                          !t.defer &&
                          !t.async &&
                          "module" !== t.type &&
                          !t.dataset.appBridgeCompatible &&
                          /^ *(|(text|application)\/(x-)?(java|ecma)script) *$/i.test(
                            t.type
                          )
                        );
                      })(t)
                    )
                    .indexOf(t) ||
                (console.error(
                  "The script tag loading App Bridge must be the first script tag in the document."
                ),
                !1)
            : (console.error(
                "The script tag loading App Bridge is not loading App Bridge from the Shopify CDN."
              ),
              !1);
        } catch (t) {
          return console.error("App Bridge failed to self-validate", t), !1;
        }
      })()
    )
      throw Error(
        "Shopifyâ€™s App Bridge must be included as the first <script> tag and must link to Shopifyâ€™s CDN. Do not use async, defer or type=module. Aborting."
      );
    null == (n = document.currentScript) || n.src;
    const { config: i, params: r } = (function () {
      var t, n;
      const o = new URLSearchParams(location.search),
        i = { locale: "en-US" };
      e(
        i,
        (function () {
          try {
            const n = sessionStorage.getItem("app-bridge-config");
            if (n)
              try {
                return JSON.parse(n);
              } catch (t) {}
            return {};
          } catch (E) {
            return {};
          }
        })()
      ),
        e(
          i,
          null != (n = null == (t = window.shopify) ? void 0 : t.config)
            ? n
            : {}
        ),
        e(
          i,
          (function () {
            var t;
            const n = Array.from(document.getElementsByTagName("script"));
            document.currentScript && n.unshift(document.currentScript);
            const o = {};
            for (const r of n)
              if (r.src)
                try {
                  const t = new URL(r.src);
                  t.hostname === v &&
                    m.test(t.pathname) &&
                    (t.searchParams.forEach((t, n) => {
                      t && (o[n] = t);
                    }),
                    e(o, r.dataset));
                } catch (i) {}
              else if ("shopify/config" === r.type)
                try {
                  e(o, JSON.parse(null != (t = r.textContent) ? t : "{}"));
                } catch (E) {
                  console.warn(
                    "App Bridge Next: failed to parse configuration. " + E
                  );
                }
            return o;
          })()
        ),
        e(
          i,
          (function () {
            const t = Array.from(
                document.querySelectorAll('meta[name^="shopify-"i]')
              ),
              n = {};
            for (const o of t)
              o.hasAttribute("name") &&
                (n[
                  ((e = o.getAttribute("name").replace(/shopify-/i, "")),
                  e.toLowerCase().replace(/-+(.)/g, (t, n) => n.toUpperCase()))
                ] = o.getAttribute("content"));
            var e;
            return n;
          })()
        ),
        e(
          i,
          (function (t) {
            return {
              shop: t.get("shop"),
              host: t.get("host"),
              locale: t.get("locale"),
            };
          })(o)
        );
      const r = (function (t) {
        const n = b.filter((n) => !(n in t));
        if (0 !== n.length)
          throw Error(
            "App Bridge Next: missing required configuration fields: " + n
          );
        return t;
      })(i);
      return { config: r, params: o };
    })();
    Object.freeze(i),
      (function (t) {
        try {
          sessionStorage.setItem("app-bridge-config", JSON.stringify(t));
        } catch (n) {}
      })(i);
    const a = i.host ? atob(i.host) : i.shop,
      s = new URL("https://" + a).origin,
      u = (function (t, n) {
        let e = "";
        const o = { name: "app-bridge-cdn", version: "1" };
        function i(i, r) {
          "dispatch" === i &&
            ((r.clientInterface = o), (r.version = o.version));
          const a = { type: i, payload: r, source: n };
          t.postMessage(a, e || "*");
        }
        function r(n, o, { signal: i } = {}) {
          (null == i ? void 0 : i.aborted) ||
            t.addEventListener(
              "message",
              function (t) {
                if (e) {
                  if (t.origin !== e) return;
                } else {
                  if (
                    !(
                      (g.test(new URL(t.origin).hostname) &&
                        t.origin !== location.origin) ||
                      (c() && t.origin === location.origin)
                    )
                  )
                    return;
                  e = t.origin;
                }
                const i = t.data;
                if (null != i && "object" == typeof i && i.payload && i.type)
                  switch (i.type) {
                    case "getState":
                      "getState" === n && o(i.payload, i);
                      break;
                    case "dispatch":
                      ("function" == typeof n
                        ? n(i.payload.type)
                        : n === i.payload.type) && o(i.payload.payload, i);
                  }
              },
              { signal: i }
            );
        }
        return {
          send: function (t, n) {
            "getState" !== t ? i("dispatch", y(t, n)) : i("getState", {});
          },
          subscribe: function (t, n, e = {}) {
            var o;
            if ("getState" === t)
              return r("getState", n, e), i("getState", {}), () => {};
            const a = new AbortController();
            null == (o = null == e ? void 0 : e.signal) ||
              o.addEventListener("abort", () => a.abort());
            const c = y(t, e.id ? { id: e.id } : void 0);
            a.signal.addEventListener("abort", () => {
              i("unsubscribe", c);
            }),
              r(
                c.type,
                (t, o) => {
                  (function (t, n) {
                    return void 0 === t || (null == n ? void 0 : n.id) === t;
                  })(e.id, t) && (n(t, o), !0 === e.once && a.abort());
                },
                { signal: a.signal }
              ),
              i("subscribe", c),
              r(
                y("Client.initialize").type,
                () => {
                  i("unsubscribe", c), i("subscribe", c);
                },
                { signal: a.signal }
              );
          },
        };
      })(
        (null == (o = globalThis.shopify) ? void 0 : o.transport) ||
          (c() && window === window.top
            ? {
                addEventListener: globalThis.addEventListener.bind(globalThis),
                removeEventListener:
                  globalThis.removeEventListener.bind(globalThis),
                postMessage(t) {
                  const n = JSON.stringify({
                    id: "unframed://fromClient",
                    origin: new URL(location.toString()).origin,
                    data: t,
                  });
                  window.MobileWebView.postMessage(n);
                },
              }
            : {
                addEventListener: globalThis.addEventListener.bind(globalThis),
                removeEventListener:
                  globalThis.removeEventListener.bind(globalThis),
                postMessage: globalThis.parent.postMessage.bind(
                  globalThis.parent
                ),
              }),
        i
      ),
      l = { config: i, protocol: u, origin: s };
    let f;
    const d = { protocol: u, adminApiPromise: new Promise((t) => (f = t)) };
    Object.defineProperty(self, "shopify", {
      configurable: !0,
      writable: !0,
      value: l,
    });
    const h =
      navigator.userAgent.includes("Shopify Mobile") &&
      !navigator.userAgent.includes("Extensibility") &&
      window === top;
    if (
      (top === window &&
        !c() &&
        !(null != (p = l.config.disabledFeatures) ? p : []).includes(
          "auto-redirect"
        )) ||
      h
    )
      return (function (t, n) {
        const e = new URL(location.origin);
        t.forEach((t, n) => {
          "host" !== n &&
            "shop" !== n &&
            (e.searchParams.get(n) || e.searchParams.set(n, t));
        });
        const o = e.pathname + e.search,
          { host: i, shop: r } = n.config,
          a = `${"https://" + (i ? atob(i) : r + "/admin")}/apps/${
            n.config.apiKey
          }${o}`;
        return location.assign(a);
      })(r, l);
    var p;
    if (r.get("shopify-reload") && !r.get("id_token"))
      return (
        f(void 0),
        w({ idToken: Y, fetch: W }, []),
        (async function (t, n) {
          const e = new URL(t, location.origin);
          if (e.origin !== location.origin)
            throw Error(
              `?shopify-reload must be same-origin (${e.origin} !== ${location.origin})`
            );
          document.removeChild(document.documentElement),
            e.searchParams.delete("shopify-reload"),
            history.replaceState(null, "", e.href);
          const o = (
            await fetch(e.href, {
              headers: { accept: "text/html", "X-Shopify-Bounce": "1" },
              window: null,
            })
          ).body
            .pipeThrough(new TextDecoderStream())
            .getReader();
          for (;;) {
            const { value: t, done: n } = await o.read();
            if (n) break;
            let e = t;
            document.write(e);
          }
          document.dispatchEvent(
            new Event("DOMContentLoaded", { bubbles: !0 })
          ),
            document.dispatchEvent(new Event("load", { bubbles: !0 }));
        })(r.get("shopify-reload"))
      );
    function w(t, n = []) {
      const e = Object.entries(t).filter(
        ([t]) =>
          !(function (t, n) {
            const e = (t.split("/").pop().split(".")[0] || "").replace(
              /-([a-z])/gi,
              (t, n) => n.toUpperCase()
            );
            return n.includes(e);
          })(t, n)
      );
      e.map(async ([t, n]) => {
        try {
          n(l, u, d);
        } catch (e) {
          console.error(
            `Initializing ${t} failed: ${null == e ? void 0 : e.message}\n${
              e.stack
            }`
          );
        }
      });
    }
    !(function () {
      var t;
      u.send("Client.initialize"),
        (async () => {
          var t;
          const n = await (async function (t) {
            const n = new Promise((n, e) => {
              const o = new AbortController();
              t.subscribe(
                "Client.initialize",
                () => {
                  setTimeout(() => {
                    o.signal.aborted ||
                      (o.abort(), e(Error("Host did not expose RPC")));
                  }, 10);
                },
                { signal: o.signal }
              ),
                t.subscribe(
                  "Client.rpc",
                  ({ port: t }) => {
                    const e = (function (
                      t,
                      { uuid: n = B, createEncoder: e = M, callable: o } = {}
                    ) {
                      let i = !1,
                        r = t;
                      const a = new Map(),
                        c = new Map(),
                        s = (function (t, n) {
                          let e;
                          if (null == n) {
                            if ("function" != typeof Proxy)
                              throw Error(
                                "You must pass an array of callable methods in environments without Proxies."
                              );
                            const n = new Map();
                            e = new Proxy(
                              {},
                              {
                                get(e, o) {
                                  if (n.has(o)) return n.get(o);
                                  const i = t(o);
                                  return n.set(o, i), i;
                                },
                              }
                            );
                          } else {
                            e = {};
                            for (const o of n)
                              Object.defineProperty(e, o, {
                                value: t(o),
                                writable: !1,
                                configurable: !0,
                                enumerable: !0,
                              });
                          }
                          return e;
                        })(d, o),
                        u = e({
                          uuid: n,
                          release(t) {
                            l(3, [t]);
                          },
                          call(t, e, o) {
                            const i = n(),
                              r = h(i, o),
                              [a, c] = u.encode(e);
                            return l(5, [i, t, a], c), r;
                          },
                        });
                      return (
                        r.addEventListener("message", f),
                        {
                          call: s,
                          replace(t) {
                            const n = r;
                            (r = t),
                              n.removeEventListener("message", f),
                              t.addEventListener("message", f);
                          },
                          expose(t) {
                            for (const n of Object.keys(t)) {
                              const e = t[n];
                              "function" == typeof e
                                ? a.set(n, e)
                                : a.delete(n);
                            }
                          },
                          callable(...t) {
                            if (null != o)
                              for (const n of t)
                                Object.defineProperty(s, n, {
                                  value: d(n),
                                  writable: !1,
                                  configurable: !0,
                                  enumerable: !0,
                                });
                          },
                          terminate() {
                            l(2, void 0), p(), r.terminate && r.terminate();
                          },
                        }
                      );
                      function l(t, n, e) {
                        i || r.postMessage(n ? [t, n] : [t], e);
                      }
                      async function f(t) {
                        const { data: n } = t;
                        if (null != n && Array.isArray(n))
                          switch (n[0]) {
                            case 2:
                              p();
                              break;
                            case 0: {
                              const t = new S(),
                                [o, i, r] = n[1],
                                c = a.get(i);
                              try {
                                if (null == c)
                                  throw Error(
                                    `No '${i}' method is exposed on this endpoint`
                                  );
                                const [n, e] = u.encode(
                                  await c(...u.decode(r, [t]))
                                );
                                l(1, [o, void 0, n], e);
                              } catch (e) {
                                const { name: t, message: n, stack: i } = e;
                                throw (
                                  (l(1, [o, { name: t, message: n, stack: i }]),
                                  e)
                                );
                              } finally {
                                t.release();
                              }
                              break;
                            }
                            case 1: {
                              const [t] = n[1];
                              c.get(t)(...n[1]), c.delete(t);
                              break;
                            }
                            case 3: {
                              const [t] = n[1];
                              u.release(t);
                              break;
                            }
                            case 6: {
                              const [t] = n[1];
                              c.get(t)(...n[1]), c.delete(t);
                              break;
                            }
                            case 5: {
                              const [t, o, i] = n[1];
                              try {
                                const n = await u.call(o, i),
                                  [e, r] = u.encode(n);
                                l(6, [t, void 0, e], r);
                              } catch (e) {
                                const { name: n, message: o, stack: i } = e;
                                throw (
                                  (l(6, [t, { name: n, message: o, stack: i }]),
                                  e)
                                );
                              }
                              break;
                            }
                          }
                      }
                      function d(t) {
                        return (...e) => {
                          if (i)
                            return Promise.reject(
                              Error(
                                "You attempted to call a function on a terminated web worker."
                              )
                            );
                          if ("string" != typeof t && "number" != typeof t)
                            return Promise.reject(
                              Error(
                                "Canâ€™t call a symbol method on a remote endpoint: " +
                                  t.toString()
                              )
                            );
                          const o = n(),
                            r = h(o),
                            [a, c] = u.encode(e);
                          return l(0, [o, t, a], c), r;
                        };
                      }
                      function h(t, n) {
                        return new Promise((e, o) => {
                          c.set(t, (t, i, r) => {
                            if (null == i) e(r && u.decode(r, n));
                            else {
                              const t = Error();
                              Object.assign(t, i), o(t);
                            }
                          });
                        });
                      }
                      function p() {
                        var t;
                        (i = !0),
                          a.clear(),
                          c.clear(),
                          null === (t = u.terminate) ||
                            void 0 === t ||
                            t.call(u),
                          r.removeEventListener("message", f);
                      }
                    })(
                      ((i = t),
                      {
                        postMessage: (...t) => i.postMessage(...t),
                        addEventListener: (...t) => i.addEventListener(...t),
                        removeEventListener: (...t) =>
                          i.removeEventListener(...t),
                        terminate() {
                          i.close();
                        },
                      })
                    );
                    var i;
                    t.start(), o.abort(), n(e.call.getApi());
                  },
                  { signal: o.signal }
                );
            });
            try {
              const t = await n;
              return k(t), t;
            } catch (E) {
              console.error(E);
            }
          })(u);
          f(
            null == (t = null == n ? void 0 : n.internal) ? void 0 : t.adminApi
          );
        })(),
        w(Lt, null != (t = i.disabledFeatures) ? t : []),
        u.send("Loading.stop");
    })(),
      (l.ready = Promise.resolve());
  })();
  var At,
    St,
    Pt,
    kt,
    Ct,
    Rt = -1,
    Ot = function (t) {
      addEventListener(
        "pageshow",
        function (n) {
          n.persisted && ((Rt = n.timeStamp), t(n));
        },
        !0
      );
    },
    Mt = function () {
      return (
        window.performance &&
        performance.getEntriesByType &&
        performance.getEntriesByType("navigation")[0]
      );
    },
    Bt = function () {
      var t = Mt();
      return (t && t.activationStart) || 0;
    },
    It = function (t, n) {
      var e = Mt(),
        o = "navigate";
      return (
        Rt >= 0
          ? (o = "back-forward-cache")
          : e &&
            (document.prerendering || Bt() > 0
              ? (o = "prerender")
              : document.wasDiscarded
              ? (o = "restore")
              : e.type && (o = e.type.replace(/_/g, "-"))),
        {
          name: t,
          value: void 0 === n ? -1 : n,
          rating: "good",
          delta: 0,
          entries: [],
          id: "v3-"
            .concat(Date.now(), "-")
            .concat(Math.floor(8999999999999 * Math.random()) + 1e12),
          navigationType: o,
        }
      );
    },
    xt = function (t, n, e) {
      try {
        if (PerformanceObserver.supportedEntryTypes.includes(t)) {
          var o = new PerformanceObserver(function (t) {
            Promise.resolve().then(function () {
              n(t.getEntries());
            });
          });
          return (
            o.observe(Object.assign({ type: t, buffered: !0 }, e || {})), o
          );
        }
      } catch (i) {}
    },
    Nt = function (t, n, e, o) {
      var i, r;
      return function (a) {
        var c, s;
        n.value >= 0 &&
          (a || o) &&
          ((r = n.value - (i || 0)) || void 0 === i) &&
          ((i = n.value),
          (n.delta = r),
          (n.rating =
            (c = n.value) > (s = e)[1]
              ? "poor"
              : c > s[0]
              ? "needs-improvement"
              : "good"),
          t(n));
      };
    },
    Ut = function (t) {
      requestAnimationFrame(function () {
        return requestAnimationFrame(function () {
          return t();
        });
      });
    },
    $t = function (t) {
      var n = function (n) {
        ("pagehide" !== n.type && "hidden" !== document.visibilityState) ||
          t(n);
      };
      addEventListener("visibilitychange", n, !0),
        addEventListener("pagehide", n, !0);
    },
    jt = function (t) {
      var n = !1;
      return function (e) {
        n || (t(e), (n = !0));
      };
    },
    Dt = -1,
    _t = function () {
      return "hidden" !== document.visibilityState || document.prerendering
        ? 1 / 0
        : 0;
    },
    Ft = function (t) {
      "hidden" === document.visibilityState &&
        Dt > -1 &&
        ((Dt = "visibilitychange" === t.type ? t.timeStamp : 0), zt());
    },
    qt = function () {
      addEventListener("visibilitychange", Ft, !0),
        addEventListener("prerenderingchange", Ft, !0);
    },
    zt = function () {
      removeEventListener("visibilitychange", Ft, !0),
        removeEventListener("prerenderingchange", Ft, !0);
    },
    Vt = function () {
      return (
        Dt < 0 &&
          ((Dt = _t()),
          qt(),
          Ot(function () {
            setTimeout(function () {
              (Dt = _t()), qt();
            }, 0);
          })),
        {
          get firstHiddenTime() {
            return Dt;
          },
        }
      );
    },
    Wt = function (t) {
      document.prerendering
        ? addEventListener(
            "prerenderingchange",
            function () {
              return t();
            },
            !0
          )
        : t();
    },
    Yt = [1800, 3e3],
    Ht = function (t, n) {
      (n = n || {}),
        Wt(function () {
          var e,
            o = Vt(),
            i = It("FCP"),
            r = xt("paint", function (t) {
              t.forEach(function (t) {
                "first-contentful-paint" === t.name &&
                  (r.disconnect(),
                  t.startTime < o.firstHiddenTime &&
                    ((i.value = Math.max(t.startTime - Bt(), 0)),
                    i.entries.push(t),
                    e(!0)));
              });
            });
          r &&
            ((e = Nt(t, i, Yt, n.reportAllChanges)),
            Ot(function (o) {
              (i = It("FCP")),
                (e = Nt(t, i, Yt, n.reportAllChanges)),
                Ut(function () {
                  (i.value = performance.now() - o.timeStamp), e(!0);
                });
            }));
        });
    },
    Jt = [0.1, 0.25],
    Xt = function (t, n) {
      (n = n || {}),
        Ht(
          jt(function () {
            var e,
              o = It("CLS", 0),
              i = 0,
              r = [],
              a = function (t) {
                t.forEach(function (t) {
                  if (!t.hadRecentInput) {
                    var n = r[0],
                      e = r[r.length - 1];
                    i &&
                    t.startTime - e.startTime < 1e3 &&
                    t.startTime - n.startTime < 5e3
                      ? ((i += t.value), r.push(t))
                      : ((i = t.value), (r = [t]));
                  }
                }),
                  i > o.value && ((o.value = i), (o.entries = r), e());
              },
              c = xt("layout-shift", a);
            c &&
              ((e = Nt(t, o, Jt, n.reportAllChanges)),
              $t(function () {
                a(c.takeRecords()), e(!0);
              }),
              Ot(function () {
                (i = 0),
                  (o = It("CLS", 0)),
                  (e = Nt(t, o, Jt, n.reportAllChanges)),
                  Ut(function () {
                    return e();
                  });
              }),
              setTimeout(e, 0));
          })
        );
    },
    Gt = { passive: !0, capture: !0 },
    Kt = new Date(),
    Qt = function (t, n) {
      At ||
        ((At = n), (St = t), (Pt = new Date()), nn(removeEventListener), Zt());
    },
    Zt = function () {
      if (St >= 0 && St < Pt - Kt) {
        var t = {
          entryType: "first-input",
          name: At.type,
          target: At.target,
          cancelable: At.cancelable,
          startTime: At.timeStamp,
          processingStart: At.timeStamp + St,
        };
        kt.forEach(function (n) {
          n(t);
        }),
          (kt = []);
      }
    },
    tn = function (t) {
      if (t.cancelable) {
        var n =
          (t.timeStamp > 1e12 ? new Date() : performance.now()) - t.timeStamp;
        "pointerdown" == t.type
          ? ((e = n),
            (o = t),
            (i = function () {
              Qt(e, o), a();
            }),
            (r = function () {
              a();
            }),
            (a = function () {
              removeEventListener("pointerup", i, Gt),
                removeEventListener("pointercancel", r, Gt);
            }),
            addEventListener("pointerup", i, Gt),
            addEventListener("pointercancel", r, Gt))
          : Qt(n, t);
      }
      var e, o, i, r, a;
    },
    nn = function (t) {
      ["mousedown", "keydown", "touchstart", "pointerdown"].forEach(function (
        n
      ) {
        return t(n, tn, Gt);
      });
    },
    en = [100, 300],
    on = function (t, n) {
      (n = n || {}),
        Wt(function () {
          var e,
            o = Vt(),
            i = It("FID"),
            r = function (t) {
              t.startTime < o.firstHiddenTime &&
                ((i.value = t.processingStart - t.startTime),
                i.entries.push(t),
                e(!0));
            },
            a = function (t) {
              t.forEach(r);
            },
            c = xt("first-input", a);
          (e = Nt(t, i, en, n.reportAllChanges)),
            c &&
              $t(
                jt(function () {
                  a(c.takeRecords()), c.disconnect();
                })
              ),
            c &&
              Ot(function () {
                var o;
                (i = It("FID")),
                  (e = Nt(t, i, en, n.reportAllChanges)),
                  (kt = []),
                  (St = -1),
                  (At = null),
                  nn(addEventListener),
                  (o = r),
                  kt.push(o),
                  Zt();
              });
        });
    },
    rn = 0,
    an = 1 / 0,
    cn = 0,
    sn = function (t) {
      t.forEach(function (t) {
        t.interactionId &&
          ((an = Math.min(an, t.interactionId)),
          (cn = Math.max(cn, t.interactionId)),
          (rn = cn ? (cn - an) / 7 + 1 : 0));
      });
    },
    un = function () {
      return Ct ? rn : performance.interactionCount || 0;
    },
    ln = [200, 500],
    fn = 0,
    dn = function () {
      return un() - fn;
    },
    hn = [],
    pn = {},
    mn = function (t) {
      var n = hn[hn.length - 1],
        e = pn[t.interactionId];
      if (e || hn.length < 10 || t.duration > n.latency) {
        if (e) e.entries.push(t), (e.latency = Math.max(e.latency, t.duration));
        else {
          var o = { id: t.interactionId, latency: t.duration, entries: [t] };
          (pn[o.id] = o), hn.push(o);
        }
        hn.sort(function (t, n) {
          return n.latency - t.latency;
        }),
          hn.splice(10).forEach(function (t) {
            delete pn[t.id];
          });
      }
    },
    vn = function (t, n) {
      (n = n || {}),
        Wt(function () {
          "interactionCount" in performance ||
            Ct ||
            (Ct = xt("event", sn, {
              type: "event",
              buffered: !0,
              durationThreshold: 0,
            }));
          var e,
            o = It("INP"),
            i = function (t) {
              t.forEach(function (t) {
                t.interactionId && mn(t),
                  "first-input" === t.entryType &&
                    !hn.some(function (n) {
                      return n.entries.some(function (n) {
                        return (
                          t.duration === n.duration &&
                          t.startTime === n.startTime
                        );
                      });
                    }) &&
                    mn(t);
              });
              var n,
                i =
                  ((n = Math.min(hn.length - 1, Math.floor(dn() / 50))), hn[n]);
              i &&
                i.latency !== o.value &&
                ((o.value = i.latency), (o.entries = i.entries), e());
            },
            r = xt("event", i, {
              durationThreshold: n.durationThreshold || 40,
            });
          (e = Nt(t, o, ln, n.reportAllChanges)),
            r &&
              (r.observe({ type: "first-input", buffered: !0 }),
              $t(function () {
                i(r.takeRecords()),
                  o.value < 0 && dn() > 0 && ((o.value = 0), (o.entries = [])),
                  e(!0);
              }),
              Ot(function () {
                (hn = []),
                  (fn = un()),
                  (o = It("INP")),
                  (e = Nt(t, o, ln, n.reportAllChanges));
              }));
        });
    },
    bn = [2500, 4e3],
    gn = {},
    wn = function (t, n) {
      (n = n || {}),
        Wt(function () {
          var e,
            o = Vt(),
            i = It("LCP"),
            r = function (t) {
              var n = t[t.length - 1];
              n &&
                n.startTime < o.firstHiddenTime &&
                ((i.value = Math.max(n.startTime - Bt(), 0)),
                (i.entries = [n]),
                e());
            },
            a = xt("largest-contentful-paint", r);
          if (a) {
            e = Nt(t, i, bn, n.reportAllChanges);
            var c = jt(function () {
              gn[i.id] ||
                (r(a.takeRecords()), a.disconnect(), (gn[i.id] = !0), e(!0));
            });
            ["keydown", "click"].forEach(function (t) {
              addEventListener(t, c, !0);
            }),
              $t(c),
              Ot(function (o) {
                (i = It("LCP")),
                  (e = Nt(t, i, bn, n.reportAllChanges)),
                  Ut(function () {
                    (i.value = performance.now() - o.timeStamp),
                      (gn[i.id] = !0),
                      e(!0);
                  });
              });
          }
        });
    },
    yn = [800, 1800],
    En = function t(n) {
      document.prerendering
        ? Wt(function () {
            return t(n);
          })
        : "complete" !== document.readyState
        ? addEventListener(
            "load",
            function () {
              return t(n);
            },
            !0
          )
        : setTimeout(n, 0);
    },
    Tn = function (t, n) {
      n = n || {};
      var e = It("TTFB"),
        o = Nt(t, e, yn, n.reportAllChanges);
      En(function () {
        var i = Mt();
        if (i) {
          var r = i.responseStart;
          if (r <= 0 || r > performance.now()) return;
          (e.value = Math.max(r - Bt(), 0)),
            (e.entries = [i]),
            o(!0),
            Ot(function () {
              (e = It("TTFB", 0)), (o = Nt(t, e, yn, n.reportAllChanges))(!0);
            });
        }
      });
    };
  const Ln = {
    __proto__: null,
    CLSThresholds: Jt,
    FCPThresholds: Yt,
    FIDThresholds: en,
    INPThresholds: ln,
    LCPThresholds: bn,
    TTFBThresholds: yn,
    getCLS: Xt,
    getFCP: Ht,
    getFID: on,
    getINP: vn,
    getLCP: wn,
    getTTFB: Tn,
    onCLS: Xt,
    onFCP: Ht,
    onFID: on,
    onINP: vn,
    onLCP: wn,
    onTTFB: Tn,
  };
})();
