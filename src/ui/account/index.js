import * as chrome from "webextension-polyfill";
import {Account, Term} from "../../canvas";

(async() => {
    const account = await Account.getFromUrl()
    const activeTerms = await Term.getTerms('active');
    let gradTerm = activeTerms.find((term) => term.name.search(/DE8W/));
    let ugTerm = activeTerms.find((term) => term.name.search(/DE(\/?HL)?-\s{3}-\d+-\d+/));

    let termEl = document.getElementById('termFilter');
    console.log(activeTerms);
    console.log(gradTerm);
    console.log(ugTerm);

})()