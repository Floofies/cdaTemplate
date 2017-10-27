
function newFragmentParse(tagString) {
	return document.createRange().createContextualFragment(tagString);
}
function empty(target) {
	while (target.hasChildNodes()) {
		target.removeChild(target.lastChild);
	}
}

var t = new cdaTemplate();
const injectors = t.conf.injectors;

const templateTypes = [
	"alt",
	"class",
	"content",
	"content-append",
	"content-prepend",
	"content-text",
	"content-text-append",
	"content-text-prepend",
	"for",
	"href",
	"id",
	"link",
	"link-wrap",
	"style",
	"value"
];
const attributes = [
	"alt",
	"class",
	"for",
	"href",
	"id",
	"style",
	"value"
];

const destination = document.getElementById("testDestination");

// ABOUT REFERENCING CHILD NODES MANUALLY:
// Within the injector tests, we use index 1 of `childNodes` because there are line returns at indexes 0 and 2.
// We could remove the line returns but it would sacrifice markup readability, so they will stay.

// Set up templates
const templates = {};
for (var type of templateTypes) {
	var templateElement = document.getElementById(type + "-test");
	if (templateElement === null) {
		throw new Error("Could not find element \"" + type + "-test\"");
	}
	templates[type] = newFragmentParse(templateElement.textContent);
}

describe("Data Injectors", function () {
	// Test generic attribute injectors
	for (var attr of attributes) {
		var dataAttr = "data-" + attr;
		describe(attr, function () {
			it("should add and set the \"" + attr + "\" attribute", function () {
				var liveTemplate = destination.appendChild(templates[attr].childNodes[1].cloneNode(true));
				injectors[dataAttr]("test", liveTemplate);
				expect(liveTemplate.getAttribute(attr)).toBe("test");
			});
		});
	}

	// Test abstract injectors
	describe("content", function () {
		it("should replace the content with DOM Nodes", function () {
			var liveTemplate = destination.appendChild(templates["content"].childNodes[1].cloneNode(true));
			injectors["data-content"]("<h1>test</h1>", liveTemplate);
			expect(liveTemplate.innerHTML).toBe("<h1>test</h1>");
		});
	});
	describe("content-append", function () {
		it("should append the content with DOM Nodes", function () {
			var liveTemplate = destination.appendChild(templates["content-append"].childNodes[1].cloneNode(true));
			injectors["data-content-append"]("<h1>test</h1>", liveTemplate);
			expect(liveTemplate.innerHTML).toBe("I should be appended to.<h1>test</h1>");
		});
	});
	describe("content-prepend", function () {
		it("should prepend the content with DOM Nodes", function () {
			var liveTemplate = destination.appendChild(templates["content-prepend"].childNodes[1].cloneNode(true));
			injectors["data-content-prepend"]("<h1>test</h1>", liveTemplate);
			expect(liveTemplate.innerHTML).toBe("<h1>test</h1>I should be prepended to.");
		});
	});

	// Test abstract injectors
	describe("content-text", function () {
		it("should replace the content with text", function () {
			var liveTemplate = destination.appendChild(templates["content-text"].childNodes[1].cloneNode(true));
			injectors["data-content-text"]("Hello World", liveTemplate);
			expect(liveTemplate.textContent).toBe("Hello World");
		});
	});
	describe("content-text-append", function () {
		it("should append the content with text", function () {
			var liveTemplate = destination.appendChild(templates["content-text-append"].childNodes[1].cloneNode(true));
			injectors["data-content-text-append"]("Hello World", liveTemplate);
			expect(liveTemplate.textContent).toBe("I should be appended to.Hello World");
		});
	});
	describe("content-text-prepend", function () {
		it("should prepend the content with text", function () {
			var liveTemplate = destination.appendChild(templates["content-text-prepend"].childNodes[1].cloneNode(true));
			injectors["data-content-text-prepend"]("Hello World", liveTemplate);
			expect(liveTemplate.textContent).toBe("Hello WorldI should be prepended to.");
		});
	});
});

describe("Interface Functions", function () {
	describe("loadTemplate", function () {
		it("should load a template ", function () {
			expect();
		});
	});
});

describe("Custom Formatter", function () {
	it("should format to uppercase text", function () {
		var liveTemplate = destination.appendChild(templates["content-text"].childNodes[1].cloneNode(true));
		injectors["data-content-text"]("Hello World", liveTemplate);
		expect(liveTemplate.textContent).toBe("Hello World");
	});
});