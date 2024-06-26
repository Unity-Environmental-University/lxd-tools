import {IUserData} from "../canvasDataDefs";
import {frontPageBio, IProfile} from "../profile";
import {mockUserData} from "../__mocks__/mockUserData";

describe('frontPageBio', () => {
        const profile = {
            user: {...mockUserData, email: "ttestersson@unity.edu"},
            displayName: "Test Testersson Phd"
        }
    it('renders display name properly', () => {
        expect(frontPageBio(profile)).toContain(profile.displayName);
    })
    it('renders email properly', () => {
        expect(frontPageBio(profile)).toContain(profile.user.email);
    })

})
