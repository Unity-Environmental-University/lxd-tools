// eslint-disable-next-line @/no-undef
module.exports = {
  process(src) {
    return {
      code: `module.exports = ${JSON.stringify(src)};`, // Returns the HTML as a string
    };
  },
};