(function() {
  if (window.top !== window && location.hostname.match(/\.?youtube\.com$/)) {
    return;
  }

  if (!safari) {
    return;
  }

  var settings = {
    usersToHide: [],
    hideRecommendedChannels: false,
    hideComments: false
  };

  function parseSettings(settings) {
    settings.usersToHide = (settings.usersToHide || "").split(/,\s*/);

    return settings;
  }

  function toArray(list) {
    return Array.prototype.slice.call(list);
  }

  function removeNode(node) {
    if (node && node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }

  function closestByClassName(node, className) {
    if (!node) {
      return;
    }

    while (node && node.classList && !node.classList.contains(className)) {
      node = node.parentNode;

      if (!node) {
        return;
      }
    }

    return node;
  }

  function hideVideos(users) {
    users.forEach(function(user) {
      var links = document.querySelectorAll("a[href$='/" + user + "']");

      toArray(links).forEach(function(link) {
        var parents = [
          closestByClassName(link, "feed-item-container"),
          closestByClassName(link, "yt-shelf-grid-item")
        ];

        parents.forEach(function(parent) {
          removeNode(parent);
        });
      });
    });
  }

  function hideRecommendedChannels() {
    var titles = document.querySelectorAll(".shelf-title-annotation");

    toArray(titles).forEach(function(title) {
      var parent = closestByClassName(title, "feed-item-container");

      if (parent) {
        removeNode(parent);
      }
    });
  }

  function hideRecommended() {
    var link = document.querySelector("a[href^='/feed/recommended']");

    if (!link) {
      return;
    }

    var parent = closestByClassName(link, "feed-item-container");

    if (parent) {
      removeNode(parent);
    }
  }

  function hideFromUpNext(users) {
    var nodes = document.querySelectorAll("[data-name=relmfu], [data-name=related]");

    toArray(nodes).forEach(function(node) {
      var user = node.textContent;

      if (users.indexOf(user) === -1) {
        return;
      }

      var parent = closestByClassName(node, "video-list-item");

      if (parent) {
        removeNode(parent);
      }
    })
  }

  function hideComments() {
    var node = document.querySelector("#watch-discussion");

    if (node) {
      removeNode(node);
    }
  }

  function cleanup() {
    hideVideos(settings.usersToHide);
    hideFromUpNext(settings.usersToHide);

    if (settings.hideRecommendedChannels) {
      hideRecommendedChannels();
      hideRecommended();
    }

    if (settings.hideComments) {
      hideComments();
    }
  }

  safari.self.addEventListener("message", function(event) {
    if (event.name === "settings") {
      settings = parseSettings(event.message);
      cleanup();
    }
  }, false);

  safari.self.tab.dispatchMessage("settings");

  var tid;
  var debouncedCleanup = function() {
    clearTimeout(tid);
    tid = setTimeout(cleanup, 100);
  };

  document.body.addEventListener("DOMSubtreeModified", debouncedCleanup, false);
  document.body.addEventListener("DOMNodeInserted", debouncedCleanup, false);
  document.body.addEventListener("DOMNodeRemoved", debouncedCleanup, false);
})();
