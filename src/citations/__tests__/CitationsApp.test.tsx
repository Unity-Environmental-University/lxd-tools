import {act} from "react";
import {render} from "@testing-library/react";
import CitationsApp from "@/citations/CitationsApp";


const renderBody = () => act (() => render(<CitationsApp/>))

describe('CitationsApp', () => {
    it('renders', async() => {
        await( renderBody())

    })
})