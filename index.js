var postcss = require('postcss');

const isCompose = n => n.type === 'atrule' && n.name === 'compose';
const notCompose = n => n.type !== 'atrule' || !isCompose(n);

const distinctCombo = (rules, newRules) => rules
      .filter(rule => {
        const r = newRules.filter(
          newRule => newRule.prop && newRule.prop == rule.prop
        );
        return !r || r.length === 0;
      })
      .concat(newRules);

module.exports = postcss.plugin('postcss-composition', function (opts) {
  opts = opts || {};

  // Work with options here

  return function (root, result) {
    root.walkRules((rule) => {
      const composeNode = rule.nodes.filter(isCompose)[0];

      if ( composeNode ) {
        const classes = composeNode
              .params
              .replace(/\(([^(]+)\)/, '$1')
              .split(/,|\r?\n|\r/)
              .map(_ => _.trim())
              .filter(_ => _ && _ !== '');

        let newNodes = [];

        classes.map(c => {
          root.walkRules(r => {
            if ( r.selector === c ) {
              newNodes = newNodes.concat(r.nodes);
            }
          });
        });

        newNodes = distinctCombo(newNodes, rule.nodes.filter(notCompose));

        rule.nodes = newNodes;
      }
    });

  };
});
