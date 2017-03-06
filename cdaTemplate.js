"use strict";
var templator = (function () {

  function ajax (url = "/", resType = 'text', data = "") {
    return new Promise (function (resolve, reject) {
      var req = new XMLHttpRequest();
      req.onreadystatechange = function () {
        if (req.readyState === 4) {
          if (req.status >= 400 && req.status < 600) {
            reject("HTTP Error " + req.status + ": " + req.statusText);
          } else if (req.status >= 200 && req.status < 400) {
            resolve(req.response);
          }
        }
      };
      req.open("GET", url);
      req.responseType = resType;
      req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      req.send();
    });
  }

  // For empty callback parameters
  var emptyFunc = function () {
    return;
  }
  var passFunc = function (input) {
    return input;
  }

  // Delete all the child nodes of an element
  function empty (target) {
    while (target.hasChildNodes()) {
      target.removeChild(target.lastChild);
    }
  }

  // Clone the child nodes of an element into a new Document Fragment
  function newFragmentClone (sourceElem) {
    var frag = document.createDocumentFragment();
    var sourceNodes = sourceElem.childNodes;
    for (var node of sourceNodes.values()) {
      frag.appendChild(node.cloneNode(true));
    }
    return frag;
  }

  // Custom Data Attribute -> Data Injector Function
  var injectors;
  injectors = {
    "data-content-text": function (input, target, pos = false) {
      if (!pos) {
        pos = "afterbegin";
        empty(target);
      }
      target.insertAdjacentText(pos, String(input));
    },
    "data-content-text-append": function (input, target) {
      injectors["data-content-text"](input, target, "beforeend");
    },
    "data-content-text-prepend": function (input, target) {
      injectors["data-content-text"](input, target, "afterbegin");
    },
    "data-innerHTML": function (input, target, pos = false) {
      if (!pos) {
        pos = "afterbegin";
        empty(target);
      }
      target.insertAdjacentHTML(pos, input);
    },
    "data-content": function (input, target) {
      injectors["data-innerHTML"](input, target);
    },
    "data-content-append": function (input, target) {
      injectors["data-innerHTML"](input, target, "beforeend");
    },
    "data-content-prepend": function (input, target) {
      injectors["data-innerHTML"](input, target, "afterbegin");
    },
    "data-class": function (input, target) {
      target.setAttribute("class", input);
    },
    "data-style": function (input, target) {
      target.setAttribute("style", input);
    },
    "data-id": function (input, target) {
      target.setAttribute("id", input);
    },
    "data-for": function (input, target) {
      target.setAttribute("id", input);
    },
    "data-href": function (input, target) {
      target.setAttribute("href", input);
    },
    "data-value": function (input, target) {
      target.setAttribute("value", input);
    },
    "data-link": function (input, target) {
      var a = document.createElement("a");
      a.setAttribute("href", input);
      a.insertAdjacentHTML("afterbegin", target.innerHTML);
      empty(target);
      target.insertAdjacentElement("afterbegin", a);
    },
    "data-link-wrap": function (input, target) {
      var a = document.createElement("a");
      a.setAttribute("href", input);
      a.insertAdjacentElement("afterbegin", target.cloneNode(true));
      target.parentNode.replaceChild(a, target);
    },
    "data-alt": function (input, target) {
      target.setAttribute("alt", input);
    }
  };

  // Document Fragment Cache
  var cache = {
    docs: {},
    hasDoc: function (id) {
      return cache.docs.hasOwnProperty(id);
    },
    getDoc: function (id) {
      return cache.docs[id].cloneNode(true);
    },
    saveDoc: function (id, doc) {
      cache.docs[id] = doc.cloneNode(true);
    }
  };

  // The default options/conf Object
  var defaultSettings = {
    data: false,
    append: false,
    prepend: false,
    isFile: false,
    overwriteCache: false,
    beforeInsert: emptyFunc,
    afterInsert: emptyFunc,
    complete: emptyFunc,
    success: emptyFunc,
    error: false,
    errorMessage: "There was an error loading the template.",
    paged: false,
    pageNo: 1,
    elemPerPage: 10
  };

  // Insert a Prepared Template into destElem
  function insertTemplate (templDoc, destElem, conf) {
    // Before insertion Callback
    conf.beforeInsert();
    // Insert the Template into destElement
    if (templDoc.hasChildNodes()) {
      var ok = true;
      console.log("Inserting Template into DOM");
      if (conf.append) {
        // Append the destination's children
        ok = destElem.appendChild(templDoc);
      } else if (conf.prepend) {
        // Prepend the destination's children
        ok = destElem.insertBefore(templDoc, destElem.firstChild);
      } else {
        // Overwrite the destination's children
        empty(destElem);
        ok = destElem.appendChild(templDoc);
      }
      if (ok != false) {
        conf.afterInsert();
        conf.success();
      } else if (ok === false) {
        if (conf.error) {
          conf.error();
        } else {
          destElem.insertAdjacentText("beforeend", document.createTextNode(String(conf.errorMessage)));
          console.error(conf.errorMessage);
        }
      }
      conf.complete();
    }
  }

  // Prepare a Template DocumentFragment with data
  function prepareTemplate (templDoc, conf) {
    // Inject any data into the Template
    if (conf.hasOwnProperty("data") && Object.keys(conf.data).length > 0) {
      // Paginate the data
      var curData = conf.data;
      if (conf.paged && Array.isArray(conf.data)) {
        var pages = Math.ceil(curData.length / conf.elemPerPage);
        if (conf.pageNo >= pages) {
          var start = conf.pageNo * conf.elemPerPage;
          var stop = conf.elemPerPage + start;
          curData = conf.data.slice(start, stop);
        }
      }
      // Look for data attributes in the template
      for (var dataAttr in injectors) {
        var dataNodes = templDoc.querySelectorAll("[" + dataAttr + "]");
        if (dataNodes.length > 0) {
          for (var dataNode of dataNodes.values()) {
            console.log(dataAttr + " found in " + dataNode.nodeName);
            // Get tag value
            var templTag = dataNode.getAttribute(dataAttr);
            if (templTag !== null && templTag !== "" && curData.hasOwnProperty(templTag)) {
              console.log("Injecting \"" + curData[templTag] + "\" from \"" + templTag + "\"");
              // Inject Data into the Template
              dataNode.removeAttribute(dataAttr);
              injectors[dataAttr](curData[templTag], dataNode);
            }
          }
        }
      }
    }
    return templDoc;
  }

  function stageTemplate (templDoc, destElem, conf) {
    // Prepare the Template
    var preppedDoc = prepareTemplate(templDoc, conf);
    // Insert the Template into the DOM
    insertTemplate(preppedDoc, destElem, conf);
  }

  // Prepare and insert a Template into destElem
  function loadTemplate (templLoc, destId, settings) {
    // Configuration Init
    var conf = Object.assign({}, defaultSettings, settings);
    // Destination element for the template
    var destElem = document.getElementById(destId);
    if (destElem !== null) {
      // Stage Document Cache
      if (!conf.overwriteCache && cache.hasDoc(templLoc)) {
        // Load the template from the cache
        var templDoc = cache.getDoc(templLoc);
        console.log("Loading Cached Template: " + templLoc);
        // Proceed to populate and insert the template
        stageTemplate(templDoc, destElem, conf);
      } else {
        if (conf.isFile) {
          // Get template from remote file
          ajax(templLoc, "text").then(function (html) {
            // Load the template into a new Document Fragment
            var templDoc = document.createDocumentFragment();
            templDoc.innerHTML = html;
            // Save to Document Cache
            cache.saveDoc(templLoc, templDoc);
            console.log("Loading Remote Template:");
            console.log(templDoc.innerHTML);
            // Proceed to populate and insert the template
            stageTemplate(templDoc, destElem, conf);
          }).catch(console.error);
        } else {
          // Get template from an in-document node
          var templElem = document.getElementById(templLoc);
          if (templElem !== null) {
            console.log("Loading Local Template:");
            console.log(templElem);
            // Load the template into a new Document Fragment
            var tagName = templElem.tagName;
            var childNodes = templElem.childNodes;
            if ((tagName == "TEMPLATE" || tagName == "SCRIPT") && (childNodes.length === 1 && childNodes[0].nodeType === 3)) {
              // Get template from in-document script/template element
              // Convert the template text node into document nodes
              var newElem = document.createElement("div");
              newElem.innerHTML = templElem.textContent;
              var templDoc = newFragmentClone(newElem);
            } else {
              // Get template from in-document live node
              var templDoc = newFragmentClone(templElem);
            }
            // Save to Document Cache
            cache.saveDoc(templLoc, templDoc);
            // Proceed to populate and insert the template
            stageTemplate(templDoc, destElem, conf);
          } else {
            console.error("Template ID \"" + templId + "\" not found.");
          }
        }
      }
    } else {
      console.error("Template Destination ID \"" + destId + "\" not found.");
    }
  }

  var pub = {};

  // Load a Template from the DOM
  pub.loadTemplate = function (templId, destId, settings = {}) {
    loadTemplate(templId, destId, settings);
  }

  // Load a Template with Ajax
  pub.loadTemplateXhr = function (url, destId, settings = {}) {
    settings.isFile = true;
    loadTemplate(url, destId, settings);
  };

  return pub;
})();