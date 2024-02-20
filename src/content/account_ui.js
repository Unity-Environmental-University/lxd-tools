(async() => {
    const src = chrome.runtime.getURL("src/modules/canvas_course.ts");
    const lxd = await import(src);
    const account = await lxd.Account.getFromUrl()
    const activeTerms = await lxd.Term.getTerms('active');
    let gradTerm = activeTerms.find((term) => term.name.search(/DE8W/));
    let ugTerm = activeTerms.find((term) => term.name.search(/DE(\/?HL)?-\s{3}-\d+-\d+/));

    let termEl = document.getElementById('termFilter');
    console.log(activeTerms);
    console.log(gradTerm);
    console.log(ugTerm);

})()