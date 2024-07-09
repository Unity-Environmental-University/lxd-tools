import {EmailTextProps, renderEmailTemplate} from "@/publish/publishInterface/EmailLink";
import {render} from "@testing-library/react";
import publishEmailMock, {mockFilled, mockValues} from "@/publish/publishInterface/__mocks__/publishEmailMock";


test('render email template', () => {
    expect(renderEmailTemplate(publishEmailMock, mockValues)).toEqual(mockFilled);
})