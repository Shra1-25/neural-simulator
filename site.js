// Charts, tables, tooltips and play-when-visible clips for the companion page.
// Numbers: round 2b models on 204 held-out rubble piles (2,543 pieces), 19 Oct 2026.
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";

  var AGREE = [
    { tag: "PREDICT", q: ["Will this pull bring the pile down?"], r: 85, f: 82, b: 76 },
    { tag: "PREDICT + INFER", q: ["Same question, after test pulls", "on that piece"], r: 90, f: 85, b: 76 },
    { tag: "INFER", q: ["Is a stuck piece heavy or pinned?"], r: 92, f: 93, b: 84 },
    { tag: "INTERVENE", q: ["Mid-slide, does its choice of", "bracing or letting go stop the pile?"], r: 92, f: 91, b: 78 },
    { tag: "EXPLAIN", q: ["Had it pulled another piece,", "would the pile have come down?"], r: 86, f: 83, b: 75 },
    { tag: "ACT", q: ["Will this pull free the piece?"], r: 92, f: 91, b: 72 }
  ];

  var ATTEMPTS = [
    { label: "Regression, with test pulls", s: 1, c: 0, p: 1.02 },
    { label: "Regression, without", s: 1, c: 4, p: 1.18 },
    { label: "Flow matching, with test pulls", s: 2, c: 1, p: 1.04 },
    { label: "Flow matching, without", s: 2, c: 0, p: 1.16 },
    { label: "Random order", s: 0, c: 43, p: 1.92 }
  ];

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function txt(parent, x, y, s, cls, anchor) {
    var t = el("text", { x: x, y: y, "class": cls || "" , "text-anchor": anchor || "start" }, parent);
    t.textContent = s;
    return t;
  }
  function tipTarget(node, value, label) {
    node.setAttribute("data-tip", "1");
    node.setAttribute("tabindex", "0");
    node.setAttribute("aria-label", label + ": " + value);
    node.__tip = { value: value, label: label };
  }

  // ---------------------------------------------------------------- dot plot
  // Wide screens: question labels on the left. Narrow screens: label above its row.
  function agreeChart(host) {
    host.textContent = "";
    var compact = host.clientWidth < 560;
    var W = compact ? 400 : 900, x0 = compact ? 8 : 360, x1 = compact ? 384 : 870;
    var rowH = compact ? 92 : 58, top = compact ? 40 : 34, bottom = 34;
    var H = top + rowH * AGREE.length + bottom;
    var lo = 50, hi = 100;
    var X = function (v) { return x0 + (v - lo) / (hi - lo) * (x1 - x0); };
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, "class": "chart", role: "img",
      "aria-label": "Share of answers that match the physics engine, per question, for regression and flow matching" }, host);

    for (var v = lo; v <= hi; v += 10) {
      el("line", { x1: X(v), x2: X(v), y1: top - 8, y2: H - bottom + 4, "class": "grid" }, svg);
      txt(svg, X(v), H - bottom + 22, v + "%", "t-muted", "middle");
    }
    el("line", { x1: X(90), x2: X(90), y1: top - 14, y2: H - bottom + 4, "class": "target" }, svg);
    txt(svg, X(90), top - 18, "90% target", "t-muted", "middle");

    AGREE.forEach(function (row, i) {
      var y0 = top + rowH * i, cy;
      if (i > 0) el("line", { x1: 0, x2: W, y1: y0, y2: y0, "class": "grid" }, svg);
      if (compact) {
        txt(svg, 0, y0 + 16, row.tag, "t-tag");
        txt(svg, 0, y0 + 33, row.q.join(" ").length > 46 ? row.q[0] : row.q.join(" "), "t-ink");
        if (row.q.join(" ").length > 46 && row.q[1]) txt(svg, 0, y0 + 49, row.q[1], "t-ink");
        cy = y0 + rowH - 18;
      } else {
        cy = y0 + rowH / 2;
        txt(svg, 0, cy - 12, row.tag, "t-tag");
        row.q.forEach(function (line, j) { txt(svg, 0, cy + 5 + j * 16, line, "t-ink"); });
      }
      el("line", { x1: X(row.b), x2: X(row.b), y1: cy - 9, y2: cy + 9, "class": "base" }, svg);
      var bh = el("rect", { x: X(row.b) - 8, y: cy - 14, width: 16, height: 28, "class": "hit" }, svg);
      tipTarget(bh, row.b + "%", row.q.join(" ") + " (always the most common answer)");
      [["r", "s1", "Regression"], ["f", "s2", "Flow matching"]].forEach(function (s) {
        var cx = X(row[s[0]]);
        el("circle", { cx: cx, cy: cy, r: 6.5, "class": "dot " + s[1] }, svg);
        var hit = el("circle", { cx: cx, cy: cy, r: 13, "class": "hit" }, svg);
        tipTarget(hit, row[s[0]] + "%", s[2] + ": " + row.q.join(" "));
      });
    });
  }

  // ---------------------------------------------------------------- bar charts
  function barChart(host, key, title, max, ticks, fmt) {
    host.textContent = "";
    var compact = host.clientWidth < 420;
    var W = compact ? 360 : 470, x0 = compact ? 0 : 196, x1 = compact ? 320 : 440, th = 14;
    var rowH = compact ? 44 : 34, top = 34, bottom = 30;
    var H = top + rowH * ATTEMPTS.length + bottom;
    var X = function (v) { return x0 + v / max * (x1 - x0); };
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, "class": "chart", role: "img", "aria-label": title }, host);
    txt(svg, 0, 16, title, "t-ink");
    ticks.forEach(function (t) {
      el("line", { x1: X(t), x2: X(t), y1: top - 6, y2: H - bottom + 4, "class": "grid" }, svg);
      txt(svg, X(t), H - bottom + 20, fmt(t), "t-muted", "middle");
    });
    el("line", { x1: x0, x2: x0, y1: top - 6, y2: H - bottom + 4, "class": "axis" }, svg);
    ATTEMPTS.forEach(function (row, i) {
      var y0 = top + rowH * i, cy = compact ? y0 + 30 : y0 + rowH / 2, v = row[key], w = X(v) - x0;
      if (compact) txt(svg, 0, y0 + 14, row.label, "t-ink"); else txt(svg, 0, cy + 4, row.label, "t-ink");
      if (w > 0.5) {
        var r = Math.min(4, w), y = cy - th / 2;
        el("path", { d: "M" + x0 + "," + y + "h" + (w - r) + "a" + r + "," + r + " 0 0 1 " + r + "," + r +
          "v" + (th - 2 * r) + "a" + r + "," + r + " 0 0 1 " + (-r) + "," + r + "h" + (-(w - r)) + "z",
          "class": "s" + row.s }, svg);
      }
      txt(svg, X(v) + 6, cy + 4, fmt(v), "t-ink");
      var hit = el("rect", { x: x0, y: y0, width: x1 - x0 + 20, height: rowH, "class": "hit" }, svg);
      tipTarget(hit, fmt(v), row.label + ": " + title.toLowerCase());
    });
  }

  // ---------------------------------------------------------------- tables
  function fillTables() {
    var t1 = document.getElementById("table-agree");
    AGREE.forEach(function (row) {
      var tr = document.createElement("tr");
      [row.tag.charAt(0) + row.tag.slice(1).toLowerCase() + ": " + row.q.join(" "), row.r + "%", row.f + "%", row.b + "%"]
        .forEach(function (s, j) { var td = document.createElement("td"); td.textContent = s; if (j) td.className = "n"; tr.appendChild(td); });
      t1.appendChild(tr);
    });
    var t2 = document.getElementById("table-attempts");
    ATTEMPTS.forEach(function (row) {
      var tr = document.createElement("tr");
      [row.label, row.c + "%", row.p.toFixed(2)].forEach(function (s, j) {
        var td = document.createElement("td"); td.textContent = s; if (j) td.className = "n"; tr.appendChild(td);
      });
      t2.appendChild(tr);
    });
  }

  // ---------------------------------------------------------------- tooltip
  function tooltips() {
    var tip = document.getElementById("tip");
    function show(node, x, y) {
      var d = node.__tip; if (!d) return;
      tip.textContent = "";
      var s = document.createElement("strong"); s.textContent = d.value; tip.appendChild(s);
      var l = document.createElement("span"); l.textContent = d.label; tip.appendChild(l);
      tip.style.display = "block";
      var w = tip.offsetWidth, h = tip.offsetHeight;
      tip.style.left = Math.min(window.innerWidth - w - 8, x + 14) + "px";
      tip.style.top = Math.max(8, y - h - 12) + "px";
    }
    function hide() { tip.style.display = "none"; }
    document.querySelectorAll("[data-tip]").forEach(function (n) {
      n.addEventListener("pointermove", function (e) { show(n, e.clientX, e.clientY); });
      n.addEventListener("pointerleave", hide);
      n.addEventListener("focus", function () { var r = n.getBoundingClientRect(); show(n, r.right, r.top); });
      n.addEventListener("blur", hide);
    });
  }

  // ---------------------------------------------------------------- clips
  function clips() {
    var vids = document.querySelectorAll("video");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && e.intersectionRatio > 0.4) { var p = e.target.play(); if (p && p.catch) p.catch(function () {}); }
        else e.target.pause();
      });
    }, { threshold: [0, 0.4, 0.8] });
    vids.forEach(function (v) { io.observe(v); });
  }

  function drawCharts() {
    agreeChart(document.getElementById("chart-agree"));
    barChart(document.getElementById("chart-collapse"), "c", "Piles brought down", 50, [0, 10, 20, 30, 40, 50],
      function (v) { return v + "%"; });
    barChart(document.getElementById("chart-pulls"), "p", "Pulls per freed piece", 2, [0, 0.5, 1, 1.5, 2],
      function (v) { return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0$/, ""); });
    tooltips();
  }
  drawCharts();
  var lastW = window.innerWidth, timer;
  window.addEventListener("resize", function () {
    if (Math.abs(window.innerWidth - lastW) < 40) return;
    lastW = window.innerWidth; clearTimeout(timer); timer = setTimeout(drawCharts, 150);
  });
  fillTables();
  clips();
})();
