# WIP
# cdaTemplate
This template engine was originally based off the concepts introduced by [jquery-template](https://github.com/codepb/jquery-template)

# Documentation
You may load templates either from the contents of `<script>` tags present in the document body, or from the contents of HTML files loaded via AJAX.

You are provided with two interfaces for doing so: `loadTemplate` and `loadTemplateXhr`.
## Methods
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

## Options
Several options are available for use in the `options` object.
### data:
### append
### prepend

## Data Binding Attributes

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
<div id="myContainer">Hello World!</div>
```
</details>

<details><summary>Basic Example - Remote AJAX Template</summary>
This example shows usage of a remote template retreived via AJAX.
##### Remote HTML File Template:
```HTML
<div data-content-text="myTag"></div>
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
<div id="myContainer">Hello World!</div>
```
</details>
