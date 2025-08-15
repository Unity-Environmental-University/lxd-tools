import {} from "./rubricOrganize";

describe("regex url test", () => {
    it("matches rubric url to regex", () => {
        const url = "/courses/2222222/rubrics/1111111";
        const pageRegex: RegExp = new RegExp('^/courses/[0-9]+/rubrics/[0-9]+');

        expect(pageRegex.test(url)).toBeTruthy();
    })

    it("matches rubric url to regex", () => {
        const url = "/courses/2222222/rubrics/1111111/edit";
        const pageRegex: RegExp = new RegExp('^/courses/[0-9]+/rubrics/[0-9]+');

        expect(pageRegex.test(url)).toBeTruthy();
    })

    it("matches rubric url to regex", () => {
        const url = "/courses/2/rubrics/114";
        const pageRegex: RegExp = new RegExp('^/courses/[0-9]+/rubrics/[0-9]+');

        expect(pageRegex.test(url)).toBeTruthy();
    })
})
