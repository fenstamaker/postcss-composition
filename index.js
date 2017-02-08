var postcss = require('postcss');

const trim = _ => _.trim();
const nonEmpty = _ => _ && _ !== '';
const isCompose = _ => _.type === 'atrule' && _.name === 'compose';
const notCompose = _ => _.type !== 'atrule' || !isCompose(_);
const isPseudo = _ => _ && _.pseudo;

function fmtSelector(selector) {
  return { selector };
}


function pseudo(ref) {
  const p = ref.selector
        .split(/:(.+)/);
  return Object.assign({}, ref, {
    selector: p[0],
    pseudo: p[1] && p[1] ? ':' + p[1] : null
  });
}

function getSelectors(selectorString) {
  return selectorString
      .split(',')
      .map(trim)
      .map(fmtSelector)
      .map(pseudo);
}

function eqSelector(selectors, c) {
  let i = selectors.map(_ => _.selector).indexOf(c);
  return i > -1 ? selectors[i] : null;
}

function distinctCombo(rules, newRules) {
  return rules
    .filter(rule => {
      const r = newRules.filter(
        newRule => newRule.prop && newRule.prop == rule.prop
      );
      return !r || r.length === 0;
    })
    .concat(newRules);
}

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
              .map(trim)
              .filter(nonEmpty);

        let newNodes = [];

        classes.map(c => {
          root.walkRules(r => {
            const selectors = getSelectors(r.selector);
            let s = eqSelector(selectors, c);
            if ( isPseudo(s) ) {
              const clone = r.clone();
              clone.selector = rule.selector + s.pseudo;
              root.insertAfter(rule, clone);
            } else if ( s ) {
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
