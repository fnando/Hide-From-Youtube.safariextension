function sendSettings() {
  safari.application.browserWindows.forEach(function(window) {
    window.tabs.forEach(function(tab) {
      if (tab.url.match(/^https?:\/\/(.*?)\.youtube\.com\//)) {
        tab.page.dispatchMessage("settings", JSON.parse(JSON.stringify(safari.extension.settings)));
      }
    });
  });
}

safari.application.addEventListener("message", function(event) {
  if (event.name === "settings") {
    sendSettings();
  }
}, false);

safari.extension.settings.addEventListener("change", sendSettings, false);
