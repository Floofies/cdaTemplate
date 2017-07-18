"use strict";
var cdaTemplate = (function () {
  //+---------------------------+
  //| Data Injection Functions  |
  //+---------------------------+
  // Custom Data Attribute -> Data Injector Function
  var _injectors;
  _injectors = {
    // Sets the `alt` attribute of the element.
    "data-alt": function (input, target) {
      target.setAttribute("alt", input);
    },
    // Sets the `class` attribute of the element.
    "data-class": function (input, target) {
      target.setAttribute("class", input);
    },
    // Inserts the data into the element as document nodes.
    "data-content": function (input, target, pos = false) {
      if (!pos) {
        pos = "afterbegin";
        empty(target);
      }
      target.insertAdjacentHTML(pos, input);
    },
    // Appends the data to the element's children as document nodes.
    "data-content-append": function (input, target) {
      _injectors["data-content"](input, target, "beforeend");
    },
    // Prepends the data to the element's children as document nodes.
    "data-content-prepend": function (input, target) {
      _injectors["data-content"](input, target, "afterbegin");
    },
    // Inserts data into the element as a text node.
    "data-content-text": function (input, target, pos = false) {
      if (!pos) {
        pos = "afterbegin";
        empty(target);
      }
      target.insertAdjacentText(pos, String(input));
    },
    // Appends the data to the element's children as a text node.
    "data-content-text-append": function (input, target) {
      _injectors["data-content-text"](input, target, "beforeend");
    },
    // Prepends the data to the element's children as a text node.
    "data-content-text-prepend": function (input, target) {
      _injectors["data-content-text"](input, target, "afterbegin");
    },
    // 	Sets the `for` attribute of the element.
    "data-for": function (input, target) {
      target.setAttribute("id", input);
    },
    // Sets the `href` attribute of the element.
    "data-href": function (input, target) {
      target.setAttribute("href", input);
    },
    // Sets the `id` attribute of the element.
    "data-id": function (input, target) {
      target.setAttribute("id", input);
    },
    // Wraps the element's contents in an `<a>` tag and sets it's `href` attribute.
    "data-link": function (input, target) {
      var a = document.createElement("a");
      a.setAttribute("href", input);
      a.insertAdjacentHTML("afterbegin", target.innerHTML);
      empty(target);
      target.insertAdjacentElement("afterbegin", a);
    },
    // Wraps the entire element in an `<a>` tag and sets it's `href` attribute.
    "data-link-wrap": function (input, target) {
      var a = document.createElement("a");
      a.setAttribute("href", input);
      a.insertAdjacentElement("afterbegin", target.cloneNode(true));
      target.parentNode.replaceChild(a, target);
    },
    // Sets the `style` attribute of the element.
    "data-style": function (input, target) {
      target.setAttribute("style", input);
    },
    // Sets the `value` attribute of the element.
    "data-value": function (input, target) {
      target.setAttribute("value", input);
    }
  };
  // Make sure no injectors get directly changed at runtime.
  Object.freeze(_injectors);

  //+---------------------------+
  //| Generic Utility Functions |
  //+---------------------------+
  /**
  * ajax - A Promise wrapper for XMLHttpRequest
  * @param  {String} url = "/"         A web address, URL or URI.
  * @param  {String} resType = 'text'  The server response type.
  * @param  {Mixed} data = null        Data to send to the server.
  * @return {Promise}                  Resolved with response or Rejected with error.
  */
  function ajax(url = "/", resType = 'text', data = null) {
    return new Promise(function (resolve, reject) {
      var req = new XMLHttpRequest();
      req.onreadystatechange = function () {
        if (req.readyState === 4) {
          if (req.status >= 400 && req.status < 600) {
            reject(new Error("XHR HTTP Error " + req.status + ": " + req.statusText));
          } else if (req.status >= 200 && req.status < 400) {
            resolve(req.response);
          }
        }
      };
      req.open("GET", url);
      req.responseType = resType;
      req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      req.send(data);
    });
  }
  // For empty callback parameters
  var _noOp = function () {
    return;
  };
  var _identity = function (input) {
    return input;
  };
  /**
  * assert - Logs an error message to console if `boolean` is false,
  *  If `boolean` is `true`, nothing happens.
  *  If `errorType` is set, throws a new Error of type `errorType` instead of logging to console.
  * @param  {Boolean} boolean         The activation Boolean.
  * @param  {String} message          The message to log, or include in the Error.
  * @param  {Error} errorType = null  If not `null`, throws a new error of `errorType`.
  */
  function assert(boolean, message, errorType = null) {
    if (!boolean) {
      if (errorType !== null && errorType instanceof Error) {
        throw new errorType(message);
      } else {
        console.error(message);
      }
    }
  }
  // Thunks to `assert` for method argument type checking.
  function assertArgType(boolean, typeString, argName) {
    assert(boolean, "Argument " + argName + " must be " + typeString, TypeError);
  }
  function assertString(input, argName) {
    assertArgType(typeof input === "string", "a String", argName);
  }
  function assertFunction(input, argName) {
    assertArgType(typeof input === "function", "a Function", argName);
  }
  function assertObject(input, argName) {
    assertArgType(typeof input === "object" && !Array.isArray(input), "an Object", argName);
  }
  function assertArray(input, argName) {
    assertArgType(Array.isArray(input), "an Array", argName);
  }
  /**
  * dataAttr - Returns a W3C valid Data Attribute Name based on `string`.
  * @param  {String} string  The original String to base the new one off of.
  * @return {String}         The new Data Attribute Name String.
  */
  function dataAttr(string) {
    string = string.trim().replace(/\s+/g, "-").toLowerCase();
    return string.substring(0, 5) === "data-" ? string : "data-" + string;
  }
  /**
  * empty - Deletes all the child nodes of an element.
  * @param  {Element} target  The Element to empty.
  */
  function empty(target) {
    while (target.hasChildNodes()) {
      target.removeChild(target.lastChild);
    }
  }
  /**
  * newFragmentClone - Clone the child nodes of an element into a new Document Fragment.
  * @param  {Element} sourceElem  The Element to Clone.
  * @return {DocumentFragment}    The clone of sourceElem.
  */
  function newFragmentClone(sourceElem) {
    var frag = document.createDocumentFragment();
    for (var node of sourceElem.childNodes.values()) {
      frag.appendChild(node.cloneNode(true));
    }
    return frag;
  }
  /**
  * newFragmentParse - Parses an HTML string into DOM nodes in a Document Fragment.
  * @param  {String} sourceHtml  Parse an HTML string into a new Document Fragment.
  * @return {DocumentFragment}   Contains the DOM parsed from sourceHtml.
  */
  function newFragmentParse(sourceHtml) {
    return document.createRange().createContextualFragment(sourceHtml);
  };
  //+---------------------------+
  //| Engine-Specific Functions |
  //+---------------------------+
  // Document Fragment Cache
  function Cache() {
    var _docs = [];
    // Resets internal array to an empty one.
    this.reset = () => _docs = [];
    // Checks if a document named `id` is in the cache.
    this.hasDoc = (id) => _docs.indexOf(id) !== -1;
    // Returns a cloned DocumentFragment or `null` if one was not found.
    this.getDoc = function (id) {
      var index = _docs.indexOf(id);
      if (index !== -1) {
        return _docs[index].cloneNode(true);
      } else {
        return null;
      }
    };
    // Saves a clone of `doc` named `id` to the cache.
    this.saveDoc = (id, doc) => _docs[_docs.length] = doc.cloneNode(true);
  };
  /**
  * insertTemplate - Insert a Template into destElems
  * @param  {DocumentFragment} templDoc  The template.
  * @param  {Node|NodeList} destElems    Destination Node(s). A single Node or a NodeList.
  * @param  {Object} conf                Configuration.
  * @return {Array<Node>}                The inserted Template Node(s).
  */
  function insertTemplates(templDoc, destElems, conf) {
    // Before insertion Callback
    conf.beforeInsert();
    // Insert the Templates into destElement
    var insertedTemplates = [];
    var destQueue = [];
    // Set up destination insertion queue.
    if (conf.multiDest) {
      // If multiple destinations
      for (var destElem of destElems.values()) {
        destQueue[destQueue.length] = destElem;
      }
    } else {
      // If single destination
      destQueue = [destElems];
    }
    // Only proceed if we have some nodes to insert
    if (templDoc.hasChildNodes()) {
      var errorStatus = false;
      // Iterate through the destinations for insertion
      for (var loc = 0; loc < destQueue.length; loc++) {
        var destElem = destQueue[loc];
        var liveTmpl = false;
        if (conf.prepend) {
          // Prepend the destination's children
          liveTmpl = destElem.insertBefore(templDoc.cloneNode(true), destElem.firstChild);
        } else {
          if (!conf.append) {
            // Overwrite the destination's children
            empty(destElem);
          }
          // Append the destination's children
          liveTmpl = destElem.appendChild(templDoc.cloneNode(true));
        }
        if (liveTmpl != false) {
          insertedTemplates[insertedTemplates.length] = liveTmpl;
        } else {
          errorStatus = true;
          break;
        }
      }
      if (!errorStatus) {
        conf.afterInsert(insertedTemplates);
        conf.success(insertedTemplates);
      } else {
        if (conf.error && (conf.error instanceof Function)) {
          conf.error();
        } else {
          destElem.insertAdjacentText("beforeend", document.createTextNode(conf.errorMessage));
        }
      }
    }
    conf.complete();
    return insertedTemplates;
  }
  /**
  * injectData - Format & inject data into templDoc.
  * @param  {Array<DocumentFragment>} templDocs  The unpopulated template DocumentFragments.
  * @param  {Object} conf                        Configuration.
  * @return {DoucmentFragment}                   All prepared templates in a single DocumentFragment.
  */
  function injectData(templDocs, conf) {
    var preparedDoc = document.createDocumentFragment();
    if (templDocs.length > 0) {
      // Paginate the data
      if (conf.paged) {
        // We can safely assume `conf.data` is an Array at this point, as it gets checked in the public interface.
        var pages = Math.ceil(conf.data.length / conf.elemPerPage);
        if (conf.pageNo >= pages && conf.data !== null && conf.data.length > 0) {
          // TODO: Test this!
          var dataQueue = conf.data.slice((conf.pageNo - 1) * conf.elemPerPage, conf.elemPerPage + conf.pageNo);
        } else {
          var dataQueue = null;
        }
      } else {
        var dataQueue = [conf.data];
      }
      // Iterate the templates and data, for data injection
      _iterTemplates: for (var loc = 0; loc < templDocs.length; loc++) {
        var templDoc = templDocs[loc];
        if (dataQueue !== null && loc < dataQueue.length) {
          var curData = dataQueue[loc];
        } else {
          var curData = null;
        }
        if (!templDoc.hasChildNodes()) {
          continue;
        }
        // Iterate the data injectors and look for them in the `templDoc`
        _iterAttributes: for (var dataAttr in conf.injectors) {
          if (curData !== null) {
            var dataNodes = templDoc.querySelectorAll("[" + dataAttr + "]");
            if (dataNodes.length === 0) {
              continue;
            }
            for (var dataNode of dataNodes.values()) {
              // NOTE: For non-existent attrs, `getAttribute` may return `null` OR an empty string, depending on DOM Core.
              // Get data formatter attribute.
              var formatTag = dataNode.getAttribute(dataAttr + "-format");
              if (formatTag !== null && formatTag !== "" && formatTag in conf.formatters) {
                // Format data.
                curData = conf.formatters[formatTag](curData);
              }
              // Get data injection attribute.
              var templTag = dataNode.getAttribute(dataAttr);
              if (templTag !== null && templTag !== "" && templTag in curData) {
                if (conf.removeAttr) {
                  dataNode.removeAttribute(dataAttr);
                }
                // Inject data.
                conf.injectors[dataAttr](curData[templTag], dataNode);
              }
            }
          }
        }
        if (conf.paged && conf.elemPerPage > 1) {
          // If we have multiple templates
          preparedDoc.appendChild(templDoc);
        } else {
          preparedDoc = templDoc;
        }
      }
    }
    return preparedDoc;
  }
  /**
  * getDestinations - Get destination Node(s) from the DOM.
  * @param  {String} destSel  Destination QuerySelector.
  * @param  {Object} conf     Configuration.
  * @return {Node|NodeList}   Destination Node(s).
  */
  function getDestinations(destSel, conf) {
    if (conf.multiDest) {
      var destElems = document.querySelectorAll(destSel);
      assert(destElems !== null && destElems.length > 0, "Template Destination \"" + destSel + "\" not found.", Error);
    } else {
      var destElems = document.querySelector(destSel);
      assert(destElems !== null, "Template Destination \"" + destSel + "\" not found.", Error);
    }
    return destElems;
  }
  /**
  * getTemplateXHR - Get template from a remote file.
  * @param  {String} templLoc  URL of the Template HTML file.
  * @param  {Array} destElems  Array of Destination Elements.
  * @param  {Object} conf      Configuration.
  * @return {Promise}          Resolves with Template DocumentFragment.
  */
  function getTemplateXHR(templUrl, destElems, conf) {
    return conf.ajax(templUrl, "text").then(function (html) {
      return newFramgmentParse(html);
    });
  }
  /**
  * getTemplateDOM - Get template from a DOM node.
  * @param  {String} templLoc   Template QuerySelector.
  * @param  {Array} destElems   Array of Destination Elements.
  * @param  {Object} conf       Configuration.
  * @return {DocumentFragment}  Document containing the Template.
  */
  function getTemplateDOM(templLoc, destElems, conf) {
    var templElem = document.querySelector(templLoc);
    assert(templElem !== null, "Template \"" + templLoc + "\" not found.", Error);
    // Load the template into a new Document Fragment
    var tagName = templElem.tagName;
    var childNodes = templElem.childNodes;
    if ((tagName == "TEMPLATE" || tagName == "SCRIPT") && (childNodes.length === 1 && childNodes[0].nodeType === 3)) {
      // Get template from a script/template element
      // Convert the template text node into document nodes
      return newFragmentParse(templElem.textContent);
    } else {
      // Get template from a live node
      return newFragmentClone(templElem);
    }
  }
  /**
  * loadTemplate - Load, prepare, and insert a Template into destElem(s).
  * @param  {String} templLoc      Template QuerySelector or URI/URL.
  * @param  {String} destSel       Destination QuerySelector.
  * @param  {Object} conf          Configuration.
  * @return {Array<Node>|Promise}  An array of inserted template Nodes, or a Promise which resolves with that.
  */
  function loadTemplate(templLoc, destSel, conf) {
    var destElems = getDestinations(destSel, conf);
    // Handles cache saving, pagination, and continuing control flow for injection/insertion.
    function insertionThunk(templDoc) {
      // Check if we need to save the template to the cache.
      // `cachedDoc` is hoisted from below this function.
      if (cachedDoc === null) {
        conf.cache.saveDoc(templLoc, templDoc);
      }
      // Duplicate the template for pagination
      var templDocs = [];
      if (conf.paged && conf.elemPerPage > 1) {
        for (var loc = 0; loc < conf.elemPerPage; loc++) {
          templDocs[templDocs.length] = templDoc.cloneNode(true);
        }
      } else {
        templDocs = [templDoc];
      }
      // Formats & injects data into `templDocs`, inserts them into `destElems`, and returns an array of inserted live Nodes.
      return insertTemplates(injectData(templDocs, conf), destElems, conf);
    }
    var cachedDoc = null;
    if (!conf.overwriteCache) {
      cachedDoc = conf.cache.getDoc(templLoc);
    }
    if (cachedDoc !== null) {
      if (conf.isFile || conf.async) {
        // Asynchronous
        return Promise.resolve(insertionThunk(cachedDoc));
      }
      // Synchronous
      return insertionThunk(cachedDoc);
    }
    if (conf.isFile) {
      // Asynchronous XHR
      return getTemplateXHR(templLoc, conf).then(insertionThunk);
    }
    if (conf.async) {
      // Asynchronous
      return Promise.resolve(insertionThunk(getTemplateDOM(templLoc)));
    }
    // Synchronous
    return insertionThunk(getTemplateDOM(templLoc));
  }
  // The default Configuration Object
  function newConfiguration() {
    return {
      afterInsert: _noOp,
      ajax: ajax,
      append: false,
      async: false,
      beforeInsert: _noOp,
      cache: new Cache(),
      complete: _noOp,
      data: null,
      elemPerPage: 10,
      error: false,
      errorMessage: "There was an error loading the template.",
      formatters: {},
      injectors: {},
      isFile: false,
      multiDest: false,
      overwriteCache: false,
      paged: false,
      pageNo: 1,
      prepend: false,
      removeAttr: true,
      success: _noOp,
    };
  };
  //+---------------------------+
  //| Public Interface          |
  //+---------------------------+
  function _constructor(conf = {}) {
    assertObject(conf, 1);
    this.conf = Object.assign({}, newConfiguration(), conf);
    /**
    * addInjector - Adds a custom Data Injection Attriute and node-mutating callback.
    *   The `data` prefix is automatically added if it is missing.
    * @param  {String} name                The name of the attribute, with or without a `data` prefix.
    * @param  {injectorCallback} callback  The injector callback to run. Accepts two parameters, `input` and `target`.
      * @callback injectorCallback         This callback can mutate `target` directly, via the DOM API.
      * @param {Mixed} input               A value to be injected into `target`.
      * @param {Node} target               The target Node to inject `input` into.
    */
    this.addInjector = function (name, callback) {
      assertString(name, 1);
      assertFunction(callback, 2);
      this.conf.attributes[dataAttr(name)] = callback;
    };
    /**
    * addFormatter - Adds a Formatter callback to the config object.
    *   It should not attempt to mutate the `value` parameter directly.
    * @param  {String} name                 Name of the formatter.
    * @param  {formatterCallback} callback  The formatter callback, accepts one "value" parameter.
      * @callback formatterCallback
      * @param {Mixed} value                Data to be formatted.
      * @return {Mixed}                     The formatted Data.
    */
    this.addFormatter = function (name, callback) {
      assertString(name, 1);
      assertFunction(callback, 2);
      this.conf.formatters[name] = callback;
    };
    /**
    * loadTemplate - Load a clone of template `templSel`, inject it with data, and insert it into `destSel`.
    *   Synchronous; returns the inserted Template.
    * @param  {String} templSel      Template QuerySelector.
    * @param  {String} destSel       Destination QuerySelector.
    * @param  {Object} conf = {}     Configuration.
    * @return {Array<Node>|Promise}  An array of inserted template Nodes, or a Promise which resolves with that.
    */
    this.loadTemplate = function (templSel, destSel, conf = {}) {
      assertString(templSel, 1);
      assertString(destSel, 2);
      assertObject(conf, 3);
      if (conf.data !== null) {
        if (conf.paged) {
          assertArray(conf.data, "configuration.data (When `paged` is set to `true`)");
        } else {
          assertObject(conf.data, "configuration.data (When `paged` is set to `false`)");
        }
      }
      var runConf = Object.assign({}, this.conf, { injectors: _injectors }, conf);
      if (runConf.isFile || !runConf.async) {
        // If `isFile` is set to `true`, this should return a Promise. Otherwise, an array of inserted live template Nodes.
        return loadTemplate(templSel, destSel, runConf);
      } else if (runConf.async) {
        return Promise.resolve(loadTemplate(tempSel, destSel, runConf));
      }
    };
    /**
    * loadTemplateAsync - Load a Template in a Promise.
    *   Asynchronous; returns a Promise Resolved with the inserted Template.
    * @param  {String} templSel   Template QuerySelector.
    * @param  {String} destSel    Destination QuerySelector.
    * @param  {Object} conf = {}  Configuration.
    * @return {Promise}           Resolves with an Array of live inserted template Nodes.
    */
    this.loadTemplateAsync = function (templSel, destSel, conf = {}) {
      assertObject(conf, 3);
      return this.loadTemplate(templSel, destSel, Object.assign({}, { async: true }, conf));
    };
    /**
    * loadTemplateXhr - Load a Template with Ajax.
    *   Asynchronous; returns a Promise Resolved with the inserted Template.
    * @param  {String} url        Template URL/URI.
    * @param  {String} destSel    Destination QuerySelector.
    * @param  {Object} conf = {}  Configuration.
    * @return {Promise}           Resolves with an Array of live inserted template Nodes.
    */
    this.loadTemplateXhr = function (url, destSel, conf = {}) {
      assertObject(conf, 3);
      return this.loadTemplate(url, destSel, Object.assign({}, { isFile: true }, conf));
    };
  }
  return _constructor;
})();
