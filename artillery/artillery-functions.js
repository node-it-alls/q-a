const { randUrl } = require("@ngneat/falso");

function generateImageObjects(context) {
  context.vars["images"] = Array.from({ length: 5 }, () => ({
    url: randUrl(),
  }));
}

module.exports = {
  generateImageObjects,
};
