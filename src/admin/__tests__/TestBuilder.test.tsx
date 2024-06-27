import {
    BAD_TEST_PLACEHOLDER, FIND_PLACEHOLDER,
    GOOD_TEST_PLACEHOLDER,
    REPLACE_PLACEHOLDER,
    TestBuilder,
    TestBuilderProps
} from "../TestBuilder"
import {screen, render} from "@testing-library/react";
import '@testing-library/jest-dom';

const defaultProps:TestBuilderProps = {

}
function renderComponent(props?:Partial<TestBuilderProps>) {
    render(TestBuilder({...defaultProps,  ...props}));

}

describe("TestBuilder", () => {
    it("renders", () => {
        renderComponent();
        expect(screen.queryByPlaceholderText(REPLACE_PLACEHOLDER)).toBeInTheDocument()
        expect(screen.queryByPlaceholderText(FIND_PLACEHOLDER)).toBeInTheDocument()
        expect(screen.queryAllByPlaceholderText(BAD_TEST_PLACEHOLDER).length).toBe(2);
        expect(screen.queryAllByPlaceholderText(GOOD_TEST_PLACEHOLDER).length).toBe(2);
    });
    test.todo("Updates ")
})
