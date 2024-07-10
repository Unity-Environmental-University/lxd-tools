import * as chrome from "webextension-polyfill";
import assert from "assert";
import {Account} from "@/canvas/Account";
import {Term} from "@/canvas/Term";

(async() => {
    //const account = await Account.getFromUrl()
    const activeTerms = await Term.getAllActiveTerms();
    assert(activeTerms);

    let gradTerm: Term | undefined = activeTerms.find((term) => term.name.search(/DE8W/));
    let ugTerm: Term | undefined = activeTerms.find((term) => term.name.search(/DE(\/?HL)?-\s{3}-\d+-\d+/));

    let termEl = document.getElementById('termFilter');


})()