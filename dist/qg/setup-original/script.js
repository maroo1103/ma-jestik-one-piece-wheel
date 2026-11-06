(() => {
  "use strict";
  const svg = document.getElementById("scene-map");
  const viewport = document.getElementById("scene-viewport");
  const tooltip = document.getElementById("tooltip");
  const output = document.getElementById("zoom-level");
  if (!svg || !viewport || !tooltip || !output) return;

  let scale = 100;
  const update = () => {
    svg.style.width = scale + "%";
    svg.style.minWidth = Math.round(860 * scale / 100) + "px";
    output.textContent = scale + " %";
  };
  const setZoom = delta => {
    scale = Math.min(200, Math.max(100, scale + delta));
    update();
  };

  document.getElementById("zoom-in").addEventListener("click", () => setZoom(25));
  document.getElementById("zoom-out").addEventListener("click", () => setZoom(-25));
  document.getElementById("zoom-reset").addEventListener("click", () => {
    scale = 100;
    update();
    viewport.scrollTo({left: 0, top: 0, behavior: "smooth"});
  });

  for (const spot of svg.querySelectorAll(".hotspot")) {
    const label = spot.dataset.label || spot.getAttribute("aria-label") || "Équipement";
    spot.addEventListener("pointerenter", event => {
      if (event.pointerType === "touch") return;
      tooltip.textContent = label;
      tooltip.classList.add("visible");
    });
    spot.addEventListener("pointermove", event => {
      if (event.pointerType === "touch") return;
      tooltip.style.left = Math.min(event.clientX + 14, window.innerWidth - 240) + "px";
      tooltip.style.top = Math.min(event.clientY + 14, window.innerHeight - 55) + "px";
    });
    spot.addEventListener("pointerleave", () => tooltip.classList.remove("visible"));
    spot.addEventListener("blur", () => tooltip.classList.remove("visible"));
  }
  update();
})();
