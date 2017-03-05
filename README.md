# WIP
# cdaTemplate
This template engine was originally based off the concepts introduced by [jquery-template](https://github.com/codepb/jquery-template)

# Documentation
You may load templates either from the contents of `<script>` tags present in the document body, or from the contents of HTML files loaded via AJAX.

You are provided with two interfaces for doing so: `loadTemplate` and `loadTemplateXhr`.
## Methods
___
###`loadTemplate`
######Function
```JavaScript
cdaTemplate.loadTemplate( templateID , destinationID , options );
```
Clones the contents of the `templateID` element, injects data into it, and inserts the clone into the `destinationID` element.

##### Parameters

- **`templateID`** String

  The ID Attribute of the template.

- **`destinationID`** String

  The ID Attribute of the destination.

- **`options`** Object

  See [Options Documentation]()

___
###`loadTemplateXhr`
######Function
```JavaScript
cdaTemplate.loadTemplateXhr( templateURL , destinationID , options );
```
Retrieves a clone of the HTML file at `templateURL`, injects data into it, and inserts the clone into the `destinationID` element.

##### Parameters

- **`templateURL`** String

  The URL of the template HTML file.

- **`destinationID`** String

  The ID Attribute of the destination.

- **`options`** Object

  See [Options Documentation]()

___
## Options
Several options are available for use in the `options` object.

Option|DataType|Description
---|---|---
`data`|Object|An object with named properties matching tags in a template.
`append`|Boolean|Appends the children of the destination element with the template.
`prepend`|Boolean|Prepends the children of the destination element with the template.
`beforeInsert`|Function|The Callback to execute before inserting the template.
`afterInsert`|Function|The Callback to execute after inserting the template.
`complete`|Function|The Callback to execute after finishing execution. (Non-conditional)
`success`|Function|The Callback to execute if template loading was successful.
`error`|Function|The Callback to execute if template loading was not successful. Errors output into the destination element if not set.
`errorMessage`|String|The error message to output into the destination element. (Not used if `error` is set)
`paged`|Boolean|Enables pagination.
`pageNo`|Number|The page number to start at.
`elemPerPage`|Number|The number of elements to include per-page.

## Data Binding Attributes
Several data binding attributes are available for use in templates.

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
`data-link`|Inserts an `<a>` tag into the element's contents and sets it's `href` attribute.
`data-link-wrap`|Wraps the element in an `<a>` tag and sets it's `href` attribute.
`data-style`|Sets the `style` attribute of the element.
`data-value`|Sets the `value` attribute of the element.

## Examples
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
cdaTemplate.loadTemplate("myTemplate", "myContainer", {
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
cdaTemplate.loadTemplate("/myTemplate.html", "myContainer", {
    data: { myTag: "Hello World!" }
});
```
##### Result - Destination Element:
```HTML
<div id="myContainer"><div>Hello World!</div></div>
```
</details>
