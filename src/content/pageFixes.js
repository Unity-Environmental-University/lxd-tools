(async() => {
  let link = document.querySelector('[aria-label="Pages. Disabled. Not visible to students"]');
  if (link) {
    let url = link.getAttribute('href');
    url = url.replace('wiki', 'pages');
    link.setAttribute("href", url);
  }

})();