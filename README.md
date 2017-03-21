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
You may load templates either from the contents of `<script>` tags present in the document body, or from the contents of HTML files loaded via AJAX.

Templates are stored in an internal cache for fast re-use. If you make a change to a template and would like to overwrite the cached version, you can use the `overwriteCache` option.

## :bulb: Methods
You are provided with two interfaces for loading templates: `loadTemplate` and `loadTemplateXhr`. They can be accessed via the `cdaTemplate` namespace.
___
###`loadTemplate`

######Function
```JavaScript
cdaTemplate.loadTemplate( templateSelector , destinationSelector , options );
```
Clones the contents of the element targeted by `templateSelector`, injects data into the clone, and inserts the clone into any elements targeted by `destinationSelector`. The two parameters must be valid CSS Selectors.

If multiple elements match `destinationSelector`, you can enable insertion into multiple destinations via the `multiDest` option; otherwise, only the first element matching the Selector will receive the template.

##### Parameters

- **`templateSelector`** String

  A valid CSS Selector targeting the template.

- **`destinationSelector`** String

  A valid CSS Selector targeting one or more destinations.

- **`options`** Object

  Accepts a range of configuration options. See [Options Documentation](#wrench-options)

___
###`loadTemplateXhr`

######Function
```JavaScript
cdaTemplate.loadTemplateXhr( templateURL , destinationSelector , options );
```
Retrieves a clone of the HTML file at `templateURL`, injects data into it, and inserts the clone into any elements targeted by `destinationSelector`; which must be a valid CSS Selector.

If multiple elements match `destinationSelector`, you can enable insertion into multiple destinations via the `multiDest` option; otherwise, only the first element matching the Selector will receive the template.

##### Parameters

- **`templateURL`** String

  The URL of the template HTML file.

- **`destinationSelector`** String

  A valid CSS Selector targeting one or more destinations.

- **`options`** Object

  Accepts a range of configuration options. See [Options Documentation](#wrench-options)

___
## :wrench: Options
Several options are available for use in the `options` object.

Option|DataType|Default|Description
---|---|---|---
`append`|Boolean|`false`|Appends the children of the destination element with the template.
`afterInsert`|Function|No-Op|The Callback to execute after inserting the template.
`beforeInsert`|Function|No-Op|The Callback to execute before inserting the template.
`complete`|Function|No-Op|The Callback to execute after finishing execution. (Non-conditional)
`data`|Object/Array|`false`|An Object or Array with named properties matching tags in a template.
`elemPerPage`|Number|`10`|The number of elements to include per-page.
`error`|Function|No-Op|The Callback to execute if template loading was not successful. Errors output into the destination element if not set.
`errorMessage`|String|`false`|The error message to output into the destination element. (Not used if `error` is set)
`multiDest`|Boolean|`false`|Inserts the templates into multiple elements matching the `destinationSelector`. (Only the first match is used otherwise)
`overwriteCache`|Boolean|`false`|Forces the template to load from it's original location instead of the cache. (Slower)
`paged`|Boolean|`false`|Enables pagination of the `data` property if `data` is an Array.
`pageNo`|Number|`1`|The page number to start at.
`prepend`|Boolean|`false`|Prepends the children of the destination element with the template.
`success`|Function|No-Op|The Callback to execute if template loading was successful.

## :paperclip: Data Insertion Attributes
Several one-way data insertion attributes are available for use in templates.

Attribute|Description
---|---
`data-alt`|Sets the `alt` attribute of the element.
`data-class`|Sets the `class` attribute of the element.
`data-content`|Inserts the data into the element as document nodes.
`data-content-append`|Appends the data to the element's children as document nodes.
`data-content-prepend`|Appends the data to the element's children as document nodes.
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

## :clipboard: Examples
<details><summary>Basic Example - In-Document `<script>` Template</summary>
This example shows usage of an in-document template in a `<script>` tag.
##### In-Document Template Element:
```HTML
<script id="myTemplate">
    <div data-content-text="myTag"></div>
</script>
```
##### In-Document Destination Element:
```HTML
<div id="myContainer"></div>
```
##### JavaScript:
```JavaScript
cdaTemplate.loadTemplate("#myTemplate", "#myContainer", {
    data: { myTag: "Hello World!" }
});
```
##### Result - Destination Element:
```HTML
<div id="myContainer"><div>Hello World!</div></div>
```
</details>

<details><summary>Basic Example - Remote AJAX Template</summary>
This example shows usage of a remote template retreived via AJAX.
##### Remote HTML File Template:
######myTemplate.html
```HTML
<div data-content-text="myTag"></div>
```
##### In-Document Destination Element:
```HTML
<div id="myContainer"></div>
```
##### JavaScript:
```JavaScript
cdaTemplate.loadTemplate("/myTemplate.html", "#myContainer", {
    data: { myTag: "Hello World!" }
});
```
##### Result - Destination Element:
```HTML
<div id="myContainer"><div>Hello World!</div></div>
```
</details>
