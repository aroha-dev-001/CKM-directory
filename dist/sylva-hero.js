(function () {
  "use strict";

  var LABEL = "Pollen and a butterfly over the Kudremukh hills";
  var SRC = "sylva-living-world/living-green.html?v=sylva2";

  function mount() {
    var host = document.getElementById("sylva-hero");
    if (!host) return;

    var iframe = null;
    var hostVisible = true;
    var documentVisible = !document.hidden;

    function sync() {
      var mounted = hostVisible && documentVisible;
      if (mounted && !iframe) {
        iframe = document.createElement("iframe");
        iframe.className = "sylva-living-world-frame";
        iframe.title = LABEL;
        iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
        iframe.setAttribute("loading", "eager");
        iframe.src = SRC;
        iframe.addEventListener("load", function () {
          host.setAttribute("data-state", "ready");
        });
        host.appendChild(iframe);
        host.setAttribute("data-state", "loading");
      } else if (!mounted && iframe) {
        iframe.remove();
        iframe = null;
        host.setAttribute("data-state", "loading");
      }
    }

    if (typeof IntersectionObserver !== "undefined") {
      var observer = new IntersectionObserver(function (entries) {
        hostVisible = entries[0] ? entries[0].isIntersecting : true;
        sync();
      });
      observer.observe(host);
    }

    document.addEventListener("visibilitychange", function () {
      documentVisible = !document.hidden;
      sync();
    });

    sync();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
