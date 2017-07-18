# cdaTemplate
###### Custom Data Attribute Templating Engine
This template engine borrows several concepts from [jquery-template](https://github.com/codepb/jquery-template), and is very functionally similar.

# :books: Documentation
A template consists of HTML elements with [custom `data` attributes](#paperclip-data-insertion-attributes). The attribute __name__ specifies how the data should be inserted, while the attribute __value__ specifies the object property to track; like so:
```HTML
<!-- Inserts a Text Node -->
<div data-content-text="myTag"></div>

<!-- Inserts an href attribute -->
<a data-href="myTag">This is a link!</a>
```
You may load templates from any of the following sources:
- `<script>` Nodes.
- `<template>` Nodes.
- A "live" Node.
- A remote HTML file.

Templates are stored in an internal cache for fast re-use. If you make a change to a template and would like to overwrite the cached version, you can use the `overwriteCache` option.

## :clipboard: Examples
<details><summary>Basic Example 1: In-DOM Template</summary>

This example shows usage of an in-document template in a `<script>` tag.
##### HTML Document:
```HTML
<!-- Template Container Element -->
<script id="myTemplate">
  <div class="helloWorld" data-content-text="myTag"></div>
</script>

<!-- Destination Element -->
<div id="myContainer"></div>
```
##### Your Script:
```JavaScript
// Initialize an instance of cdaTemplate.
var templateLoader = new cdaTemplate();

// Set up the data source.
var dataSource = {
  myTag: "Hello World!"
};

// Load the template.
templateLoader.loadTemplate("#myTemplate", "#myContainer", {
  data: dataSource
});
```
##### The Resulting Destination Element:
```HTML
<div id="myContainer">
  <div class="helloWorld">
    Hello World!
  </div>
</div>
```
</details>

<details><summary>Basic Example 2: Remote File Template with XHR</summary>

This example shows usage of a remote template retreived via AJAX.
##### Remote HTML File Template - myTemplate.html:
```HTML
<div data-content-text="myTag"></div>
```
##### HTML Document:
```HTML
<!-- Destination Element -->
<div id="myContainer"></div>
```
##### Your Script:
```JavaScript
// Initialize an instance of cdaTemplate.
var templateLoader = new cdaTemplate();

// Set up the data source.
var dataSource = {
  myTag: "Hello World!"
};

// Load the template.
templateLoader.loadTemplateXhr("myTemplate.html", "#myContainer", {
  data: dataSource
});
```
##### The Resulting Destination Element:
```HTML
<div id="myContainer">
  <div class="helloWorld">
    Hello World!
  </div>
</div>
```
</details>

<details><summary>Basic Example 3: Custom Data Injector</summary>

This example shows a custom data injector which appends a Text Node to an Element's children 5 times.
##### HTML Document:
```HTML
<!-- Template Container Element -->
<script id="myTemplate">
  <div data-append-five-text="myTag"></div>
</script>

<!-- Destination Element -->
<div id="myContainer"></div>
```
##### Your Script:
```JavaScript
// Initialize an instance of cdaTemplate.
var loader = new cdaTemplate();

// Set up the data source.
var dataSource = {
  myTag: "Hello World!"
};

// Add a custom data injector.
// This one appends `input` into `target` 5 times.
loader.addInjector("append-five-text", function (input, target) {
  for (var i = 1; i <= 5; i++) {
    target.insertAdjacentText("beforeend", input);
  }
});

// Load the template.
loader.loadTemplate("#myTemplate", "#myContainer", {
  data: dataSource
});
```
##### The Resulting Destination Element:
```HTML
<div id="myContainer">
  <div>
    Hello World!
    Hello World!
    Hello World!
    Hello World!
    Hello World!
  </div>
</div>
```
</details>

<details><summary>Basic Example 4: Custom Data Formatter</summary>

This example shows a custom data formatter which pre-formats input data prior to it being injected into a template.
##### HTML Document:
```HTML
<!-- Template Container Element -->
<script id="myTemplate">
  <div data-content-text="myTag" data-content-text-format="myFormatter"></div>
</script>

<!-- Destination Element -->
<div id="myContainer"></div>
```
##### Your Script:
```JavaScript
// Initialize an instance of cdaTemplate.
var loader = new cdaTemplate();

// Add a custom data formatter.
// This one returns `input` with all uppercase letters.
loader.addFormatter("myFormatter", input => input.toUpperCase());

// Set up the data source.
var dataSource = {
  myTag: "Hello World!"
};

// Load the template.
loader.loadTemplate("#myTemplate", "#myContainer", {
  data: dataSource
});
```
##### The Resulting Destination Element:
```HTML
<div id="myContainer">
  <div>
    HELLO WORLD!
  </div>
</div>
```
</details>

## :bulb: Methods
You are provided with three interfaces for loading templates: `loadTemplate`, `loadTemplateAsync`, and `loadTemplateXhr`. They can be accessed via the `cdaTemplate` namespace.
___

### `loadTemplate`
###### Function
```JavaScript
cdaTemplate.loadTemplate( templateSelector , destinationSelector , options );
```
Clones the contents of the element targeted by `templateSelector`, injects data into the clone, and inserts the clone into any elements targeted by `destinationSelector`. The two parameters must be valid CSS Selectors.

If multiple elements match `destinationSelector`, you can enable insertion into multiple destinations via the `multiDest` option; otherwise, only the first element matching the Selector will receive the template.

##### Parameters

- **`templateSelector`** String

  A valid CSS Selector or URL targeting the template.

- **`destinationSelector`** String

  A valid CSS Selector targeting one or more destinations.

- **`options`** Object

  Accepts a range of configuration options. See [Options Documentation](#wrench-options)

___

### `loadTemplateAsync`
###### Async Function
```JavaScript
cdaTemplate.loadTemplateAsync( templateSelector , destinationSelector , options );
```
Wraps `loadTemplate` in a Promise.

This is the same as `async` to `true` in the configuration object.

##### Parameters

- **`templateSelector`** String

  A valid CSS Selector or URL targeting the template.

- **`destinationSelector`** String

  A valid CSS Selector targeting one or more destinations.

- **`options`** Object

  Accepts a range of configuration options. See [Options Documentation](#wrench-options)

##### Return Value

- Promise

  The Promise resolves with an Array containing the inserted template(s).
___

### `loadTemplateXhr`
###### Async Function
```JavaScript
cdaTemplate.loadTemplateXhr( templateURL , destinationSelector , options );
```
Retrieves a clone of the HTML file at `templateURL` via XHR, injects data into it, and inserts the clone into any element(s) targeted by `destinationSelector`; which must be a valid CSS Selector.

This is the same as setting `isFile` to `true` in the configuration object.

##### Parameters

- **`templateURL`** String

  The URL/URI of the template HTML file.

- **`destinationSelector`** String

  A valid CSS Selector targeting one or more destinations.

- **`options`** Object

  Accepts a range of configuration options. See [Options Documentation](#wrench-options)

##### Return Value

- Promise

  The Promise resolves with an Array containing the inserted template(s).

___

### `addInjector`
###### Function
```JavaScript
cdaTemplate.addInjector( name, callback );
```
Adds a custom injector function to the loader.

`name` will match to a Custom Data attribute in the HTML of your template, while `callback` will run when that attribute is encountered. The callback must mutate the DOM Node, `target`, directly.

##### Parameters

- **`name`** String

  The name of the injector attribute. (EX: `data-inject-thing` or `inject-thing`). The `data` prefix will be added automatically if it is missing.

- **`callback`** String

  The injector callback. Can mutate `target` directly via the DOM API.

##### Callback Parameters

- **`input`** Mixed

  Data to be injected into `target`.

- **`target`** Node

  The target Node to inject `input` into.

___

### `addFormatter`
###### Function
```JavaScript
cdaTemplate.addFormatter( name, callback );
```
Adds a custom formatter function to the loader.

`name` will match to the value of a `data-formatter` attribute in the HTML of your template, while `callback` will run when that name is encountered. The callback must return formatted data, but should not attempt to mutate `value` directly.

##### Parameters

- **`name`** String

  The name of the injector attribute. (EX: `data-inject-thing` or `inject-thing`). The `data` prefix will be added automatically if it is missing.

- **`callback`** Function

  The formatter callback. Must return formatted data.

##### Callback Parameters

- **`value`** Mixed

  A value to base formatted data from. Do not mutate.

___
## :wrench: Options
Several options are available for use in the `options` object.

Option|DataType|Default|Description
---|---|---|---
`async`|Boolean|`false`|If `true`, `loadTemplate` will return a Promise. (Same as running `loadTemplateAsync`)
`ajax`|Function|Built-In|The XHR function to retrieve templates through. Must return a Promise which resolves with the template DOMString.
`append`|Boolean|`false`|Appends the children of the destination element with the template.
`afterInsert`|Function|No-Op|The Callback to execute after inserting the template.
`beforeInsert`|Function|No-Op|The Callback to execute before inserting the template.
`complete`|Function|No-Op|The Callback to execute after finishing execution. (Non-conditional)
`data`|Object/Array|`false`|An Object or Array with named properties matching tags in a template.
`elemPerPage`|Number|`10`|The number of elements to include per-page.
`error`|Function|No-Op|The Callback to execute if template loading was not successful. Errors output into the destination element if not set.
`errorMessage`|String|`There was an error loading the template.`|The error message to output into the destination element. (Not used if `error` is set)
`isFile`|Boolean|`false`|Treats the first parameter of `loadTemplate` as a remote file URI/URL. (Same as running `loadTemplateXhr`)
`multiDest`|Boolean|`false`|Inserts the templates into multiple elements matching the `destinationSelector`. (Only the first match is used otherwise)
`overwriteCache`|Boolean|`false`|Forces the template to load from it's original location instead of the cache. (Slower)
`paged`|Boolean|`false`|Enables pagination of the `data` property if `data` is an Array.
`pageNo`|Number|`1`|The page number to start at.
`prepend`|Boolean|`false`|Prepends the children of the destination element with the template.
`removeAttrs`|Boolean|`true`|Removes `data` attributes from loaded templates.
`success`|Function|No-Op|The Callback to execute if template loading was successful.

## :paperclip: Data Insertion Attributes
Several one-way data insertion attributes are available for use in templates.

Attribute|Description
---|---
`data-alt`|Sets the `alt` attribute of the element.
`data-class`|Sets the `class` attribute of the element.
`data-content`|Inserts the data into the element as document nodes.
`data-content-append`|Appends the data to the element's children as document nodes.
`data-content-prepend`|Prepends the data to the element's children as document nodes.
`data-content-text`| Inserts data into the element as a text node.
`data-content-text-append`| Appends the data to the element's children as a text node.
`data-content-text-prepend`| Prepends the data to the element's children as a text node.
`data-for`|Sets the `for` attribute of the element.
`data-href`|Sets the `href` attribute of the element.
`data-id`|Sets the `id` attribute of the element.
`data-link`|Wraps the element's contents an `<a>` tag and sets it's `href` attribute.
`data-link-wrap`|Wraps the entire element in an `<a>` tag and sets it's `href` attribute.
`data-style`|Sets the `style` attribute of the element.
`data-value`|Sets the `value` attribute of the element.
