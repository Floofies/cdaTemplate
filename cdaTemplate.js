"use strict";
var cdaTemplate = (function () {
  /**
  * ajax - A Promise wrapper for XMLHttpRequest
  * @param  {String} url = "/"        A web address, URL or URI.
  * @param  {String} resType = 'text' The server response type.
  * @param  {Mixed} data = null       Data to send to the server.
  * @return {Promise}                 Resolved with response or Rejected with error.
  */
  function ajax (url = "/", resType = 'text', data = null) {
    return new Promise (function (resolve, reject) {
      var req = new XMLHttpRequest();
      req.onreadystatechange = function () {
        if (req.readyState === 4) {
          if (req.status >= 400 && req.status < 600) {
            reject({status: req.status, statusText: req.statusText});
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
  * assert - Logs an error message to console if boolean is false,
  *    If errorType is set, throws a new error of errorType instead.
  * @param  {Boolean} boolean         The activation boolean.
  * @param  {String} message          The message to log, or include in the Error.
  * @param  {Error} errorType = null  If not null, throws a new error of errorType.
  */
  function assert (boolean, message, errorType = null) {
    if (!boolean) {
      if (errorType !== null && errorType instanceof Error) {
        throw new errorType(message);
      } else {
        console.error(message);
      }
    }
  }
  /**
  * empty - Deletes all the child nodes of an element.
  * @param  {Element} target The Element to clear.
  */
  function empty (target) {
    while (target.hasChildNodes()) {
      target.removeChild(target.lastChild);
    }
  }
  /**
  * newFragmentClone - Clone the child nodes of an element into a new Document Fragment.
  * @param  {Element} sourceElem The Element to Clone.
  * @return {DocumentFragment}   The clone of sourceElem.
  */
  function newFragmentClone (sourceElem) {
    var frag = document.createDocumentFragment();
    var sourceNodes = sourceElem.childNodes;
    for (var node of sourceNodes.values()) {
      frag.appendChild(node.cloneNode(true));
    }
    return frag;
  }
  /**
  * newFragmentParse - Parses an HTML string into DOM nodes in a Document Fragment.
  * @param  {String} sourceHtml Parse an HTML string into a new Document Fragment.
  * @return {DocumentFragment}  Contains the DOM parsed from sourceHtml.
  */
  function newFragmentParse (sourceHtml) {
    return document.createRange().createContextualFragment(sourceHtml);
  };
  // Custom Data Attribute -> Data Injector Function
  var _injectors;
  _injectors = {
    "data-content-text": function (input, target, pos = false) {
      if (!pos) {
        pos = "afterbegin";
        empty(target);
      }
      target.insertAdjacentText(pos, String(input));
    },
    "data-content-text-append": function (input, target) {
      _injectors["data-content-text"](input, target, "beforeend");
    },
    "data-content-text-prepend": function (input, target) {
      _injectors["data-content-text"](input, target, "afterbegin");
    },
    "data-innerHTML": function (input, target, pos = false) {
      if (!pos) {
        pos = "afterbegin";
        empty(target);
      }
      target.insertAdjacentHTML(pos, input);
    },
    "data-content": function (input, target) {
      _injectors["data-innerHTML"](input, target);
    },
    "data-content-append": function (input, target) {
      _injectors["data-innerHTML"](input, target, "beforeend");
    },
    "data-content-prepend": function (input, target) {
      _injectors["data-innerHTML"](input, target, "afterbegin");
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
  Object.freeze(_injectors);
  /**
  * insertTemplate - Insert a Template into destElems
  * @param  {DocumentFragment} templDoc  Document containing the Template.
  * @param  {Node|NodeList} destElems    Destination Node(s). A single Node or a NodeList.
  * @param  {Object} conf                Configuration.
  * @return {Array<Node>|Node}           The inserted Template(s). A single Node or a NodeList.
  */
  function insertTemplate (templDoc, destElems, conf) {
    // Before insertion Callback
    conf.beforeInsert();
    // Insert the Template into destElement
    if (templDoc.hasChildNodes()) {
      var ok = true;
      var insertionQueue = [];
      if (conf.multiDest) {
        for (var destElem of destElems.values()) {
          insertionQueue[insertionQueue.length](destElem);
        }
      } else {
        insertionQueue = [destElems];
      }
      var insertedTemplates = [];
      var liveTmpl = false;
      for (destElem of insertionQueue) {
        if (conf.append) {
          // Append the destination's children
          liveTmpl = destElem.appendChild(templDoc.cloneNode(true));
        } else if (conf.prepend) {
          // Prepend the destination's children
          liveTmpl = destElem.insertBefore(templDoc.cloneNode(true), destElem.firstChild);
        } else {
          // Overwrite the destination's children
          empty(destElem);
          liveTmpl = destElem.appendChild(templDoc.cloneNode(true));
        }
        if (liveTmpl != false) {
          insertedTemplates[insertedTemplates.length] = liveTmpl;
          conf.afterInsert();
          var tmplOutput = conf.multiDest && insertionQueue.length > 1 ? insertedTemplates : liveTmpl;
          conf.success(tmplOutput);
        } else if (liveTmpl === false) {
          if (conf.error) {
            conf.error();
          } else {
            var errMsg = conf.errorMessage !== false ? conf.errorEmessage : "There was an error loading the template.";
            destElem.insertAdjacentText("beforeend", document.createTextNode(String(errMsg)));
            throw new Error(conf.errorMessage);
          }
        }
      }
    }
    conf.complete();
    if (liveTmpl != false) {
      return tmplOutput;
    }
  }
  /**
  * prepareTemplate - Inject data into templDoc.
  * @param  {DocumentFragment} templDoc Document containing the Template.
  * @param  {Object} conf               Configuration.
  * @return {DoucmentFragment}          templDoc.
  */
  function prepareTemplate (templDoc, conf) {
    // Inject any data into the Template
    if (conf.data !== null && Object.keys(conf.data).length > 0) {
      // Paginate the data
      var curData = conf.data;
      if (conf.paged && Array.isArray(conf.data)) {
        var pages = Math.ceil(curData.length / conf.elemPerPage);
        if (conf.pageNo >= pages) {
          curData = conf.data.slice((conf.pageNo - 1) * conf.elemPerPage, conf.elemPerPage + start);
        }
      }
      // Look for data attributes in the template
      var curInjectors = Object.assign({}, conf.attributes, _injectors);
      for (var dataAttr in curInjectors) {
        var dataNodes = templDoc.querySelectorAll("[" + dataAttr + "]");
        if (dataNodes.length > 0) {
          for (var dataNode of dataNodes.values()) {
            // Get tag value
            var templTag = dataNode.getAttribute(dataAttr);
            if (templTag !== null && templTag !== "" && templTag in curData) {
              // Pre-Format Data
              var injectValue = "";
              if (templTag in conf.formatters) {
                injectValue = conf.formatters[templTag](curData[templTag]);
              } else {
                injectValue = curData[templTag];
              }
              // Inject Data into the Template
              dataNode.removeAttribute(dataAttr);
              curInjectors[dataAttr](injectValue, dataNode);
            }
          }
        }
      }
    }
    return templDoc;
  }
  /**
  * getTemplateXHR - Get template from remote file.
  * @param  {String} templLoc  URL of the Template HTML file.
  * @param  {Array} destElems  Array of Destination Elements.
  * @param  {Object} conf      Configuration.
  * @return {Promise}          Resolves with Template DocumentFragment.
  */
  function getTemplateXHR (templUrl, destElems, conf) {
    return conf.ajax(templUrl, "text").then(function (html) {
      resolve(newFramgmentParse(html));
    });
  }
  /**
  * getTemplateDOM - Get template from DOM node
  * @param  {String} templLoc  Template QuerySelector.
  * @param  {Array} destElems  Array of Destination Elements.
  * @param  {Object} conf      Configuration.
  * @return {DocumentFragment} Document containing the Template.
  */
  function getTemplateDOM (templLoc, destElems, conf) {
    var templElem = document.querySelector(templLoc);
    assert(templElem !== null, "Template \"" + templLoc + "\" not found.", Error);
    // Load the template into a new Document Fragment
    var tagName = templElem.tagName;
    var childNodes = templElem.childNodes;
    if ((tagName == "TEMPLATE" || tagName == "SCRIPT") && (childNodes.length === 1 && childNodes[0].nodeType === 3)) {
      // Get template from a script/template element
      // Convert the template text node into document nodes
      return  newFragmentParse(templElem.textContent);
    } else {
      // Get template from a live node
      return newFragmentClone(templElem);
    }
  }
  /**
  * loadTemplate - Load, Prepare, and Insert a Template into destElem(s).
  * @param  {String} templLoc  Template QuerySelector or URI/URL.
  * @param  {String} destSel   Destination QuerySelector.
  * @param  {Object} conf      Configuration.
  */
  function loadTemplate (templLoc, destSel, conf) {
    // Destination element for the template
    if (conf.multiDest) {
      var destElems = document.querySelectorAll(destSel);
    } else {
      var destElems = document.querySelector(destSel);
    }
    assert(destElems !== null, "Template Destination \"" + destSel + "\" not found.", Error);
    function insertionThunk (templDoc) {
      // Insert data into the Template, then insert the Template into the DOM
      return insertTemplate(prepareTemplate(templDoc, conf), destElems, conf);
    }
    var templDoc = conf.cache.getDoc(templLoc);
    if (templDoc === null) {
      if (conf.isFile) {
        // Async
        return getTemplateXHR(templLoc, conf).then(insertionThunk);
      } else {
        // Sync
        templDoc = getTemplateDOM(templLoc);
        conf.cache.saveDoc(templLoc, templDoc);
        return insertionThunk(templDoc);
      }
    } else {
      return insertionThunk(templDoc);
    }
  }
  // The default Configuration Object
  function newConfiguration () {
    return {
      ajax: ajax,
      formatters: {},
      attributes: {},
      data: null,
      multiDest: false,
      append: false,
      prepend: false,
      isFile: false,
      overwriteCache: false,
      beforeInsert: _noOp,
      afterInsert: _noOp,
      complete: _noOp,
      success: _noOp,
      error: false,
      errorMessage: false,
      paged: false,
      pageNo: 1,
      elemPerPage: 10
    };
  };
  // Document Fragment Cache
  function Cache () {
    this.docs = [];
    this.reset = () => this.docs = [];
    this.hasDoc = (selector) => this.docs.indexOf(selector) !== -1;
    this.getDoc = function (selector) {
      var index = this.docs.indexOf(selector);
      if (index !== -1) {
        return this.docs[index].cloneNode(true);
      } else {
        return null;
      }
    };
    this.saveDoc = function (id, doc) {
      this.docs[this.docs.length] = doc.cloneNode(true);
    };
  };
  // Primary Interface Constructor
  function _constructor (conf = {}) {
    this.defaultConf = newConfiguration();
    this.conf = Object.assign({}, this.defaultConf, conf);
    this.conf.cache = new Cache();
    /**
    * anonymous function - description
    * @param  {String} name        description
    * @param  {Function} callback  description
    */
    this.addAttribute = function (name, callback) {
      this.conf.attributes["data" + name] = callback;
    };
    /**
    * addFormatter - Adds a Formatter callback to the config object.
    *  /!\ It should NOT mutate the input parameter!
    * @param  {String} name        Name of the formatter.
    * @param  {Function} callback  The formatter callback, accepts one "value" parameter.
    */
    this.addFormatter = function (name, callback) {
      this.conf.formatters[name] = callback;
    };
    /**
    * loadTemplate - Load a Template from the DOM.
    *   Synchronous; returns the inserted Template.
    * @param  {String} templSel       Template QuerySelector.
    * @param  {String} destSel        Destination QuerySelector.
    * @param  {Object} settings = {}  Configuration.
    * @return {DocumentFragment}      The inserted Template DocumentFragment.
    */
    this.loadTemplate = function (templSel, destSel, conf = {}) {
      return loadTemplate(templSel, destSel, Object.assign({}, this.conf, conf));
    };
    /**
    * loadTemplateXhr - Load a Template with Ajax.
    *   Asynchronous; returns a Promise Resolved with the inserted Template.
    * @param  {String} url        Template URL/URI.
    * @param  {String} destSel    Destination QuerySelector.
    * @param  {Object} conf = {}  Configuration.
    * @return {Promise}           Resolves with inserted Template DocumentFragment.
    */
    this.loadTemplateXhr = function (url, destSel, conf = {}) {
      conf.isFile = true;
      return this.loadTemplate(url, destSel, conf);
    };
  }
  return _constructor;
})();
