/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!**********************************!*\
  !*** ./src/content/pageFixes.js ***!
  \**********************************/
(async() => {
  let link = document.querySelector('[aria-label="Pages. Disabled. Not visible to students"]');
  if (link) {
    let url = link.getAttribute('href');
    url = url.replace('wiki', 'pages');
    link.setAttribute("href", url);
  }

})();
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnZUZpeGVzLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsSSIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL3NyYy9jb250ZW50L3BhZ2VGaXhlcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoYXN5bmMoKSA9PiB7XHJcbiAgbGV0IGxpbmsgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbYXJpYS1sYWJlbD1cIlBhZ2VzLiBEaXNhYmxlZC4gTm90IHZpc2libGUgdG8gc3R1ZGVudHNcIl0nKTtcclxuICBpZiAobGluaykge1xyXG4gICAgbGV0IHVybCA9IGxpbmsuZ2V0QXR0cmlidXRlKCdocmVmJyk7XHJcbiAgICB1cmwgPSB1cmwucmVwbGFjZSgnd2lraScsICdwYWdlcycpO1xyXG4gICAgbGluay5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIHVybCk7XHJcbiAgfVxyXG5cclxufSkoKTsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=