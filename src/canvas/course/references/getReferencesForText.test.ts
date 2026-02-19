import getReferencesForText from "@ueu/ueu-canvas/course/references/getReferencesForText";
import {fetchJson} from "@ueu/ueu-canvas/fetch/fetchJson";
import {jest} from "@jest/globals";
import mockCiteAsResponse from "@ueu/ueu-canvas/course/references/mockCiteAsResponse";

jest.mock('@/canvas/fetch/fetchJson', () => ({
    fetchJson: jest.fn(),
}))

describe('getReferencesForText', () => {
    const userEmail = 'ttestersson@unity.edu';
    const testText = "The Hungry, Hungry Caterpillar";
    (fetchJson as jest.Mock).mockImplementation(async () => mockCiteAsResponse)
    it('passes email and text into url', async () => {
        const refs = await getReferencesForText(testText, userEmail);

    });
});