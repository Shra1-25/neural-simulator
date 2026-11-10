// Clips play while the pointer is over them, a click or tap plays or pauses them, and they never start on their own.
document.querySelectorAll("video").forEach(function (v) {
  v.style.cursor = "pointer";
  v.addEventListener("mouseenter", function () { v.play().catch(function () {}); });
  v.addEventListener("mouseleave", function () { v.pause(); });
  v.addEventListener("click", function () { if (v.paused) { v.play().catch(function () {}); } else { v.pause(); } });
});
