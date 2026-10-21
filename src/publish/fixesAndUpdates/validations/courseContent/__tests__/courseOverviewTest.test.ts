import {
	checkUgHonorCodeFormat,
	ugHonorCodeHtml,
} from "@publish/fixesAndUpdates/validations/courseContent/courseOverviewTest";

function toDiv(html: string): HTMLDivElement {
	const container = document.createElement("div");
	container.innerHTML = html;
	return container.firstElementChild as HTMLDivElement;
}

describe("checkUgHonorCodeFormat", () => {
	it("accepts the template itself", () => {
		expect(checkUgHonorCodeFormat(toDiv(ugHonorCodeHtml))).toEqual([]);
	});

	it("ignores attributes, styles, and wrapper divs", () => {
		const restyled = ugHonorCodeHtml
			.replace(/ style="[^"]*"/g, "")
			.replace(/ data-[a-z-]+="[^"]*"/g, "");
		expect(checkUgHonorCodeFormat(toDiv(`<div class="wrap">${restyled}</div>`))).toEqual([]);
	});

	it("flags a changed list start number", () => {
		const renumbered = ugHonorCodeHtml.replace('<ol start="3">', '<ol start="2">');
		expect(checkUgHonorCodeFormat(toDiv(renumbered))).toHaveLength(1);
	});

	it("flags a list that lost its nesting", () => {
		const flattened = ugHonorCodeHtml.replace(
			/<li style="list-style-type: none;">\s*<ul>\s*(<li><em>Violations[^]*?<\/li>)\s*<\/ul>\s*<\/li>/,
			"$1",
		);
		expect(checkUgHonorCodeFormat(toDiv(flattened))).toHaveLength(1);
	});

	it("flags changed wording", () => {
		const reworded = ugHonorCodeHtml.replace(
			"The Academic Honor Code supersedes the grading rubric.",
			"The Academic Honor Code outranks the grading rubric.",
		);
		expect(checkUgHonorCodeFormat(toDiv(reworded))).toHaveLength(1);
	});

	it("flags a changed link target", () => {
		const relinked = ugHonorCodeHtml.replace("technology-commitment", "elsewhere");
		expect(checkUgHonorCodeFormat(toDiv(relinked))).toHaveLength(1);
	});
});
