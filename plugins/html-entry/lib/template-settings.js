module.exports = {
  escape: /template_start%-([\s\S]+?)%template_end/g,
  evaluate: /template_start%([\s\S]+?)%template_end/g,
  interpolate: /template_start%=([\s\S]+?)%template_end/g
}
