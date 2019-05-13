import * as utils from './utils';

let _config = { delay: 100 };
let observables = [];

export const init = (config) => {
  _config = utils.merge(_config, config || {});

  var debouncedCheck = utils.debounce(check, _config.delay);

  window.addEventListener('resize', debouncedCheck, false);
  window.addEventListener('scroll', check, false);
};

export const add = (element, callback) => {
  observables.push({
    element,
    callback,
    visibility: false
  });
};

// Check if visibility has changed
const check = () => {
  observables.forEach(obs => {
    var visibility = isVisible(obs.element);
    if (visibility !== obs.visibility) {
      if (visibility) {
        obs.callback('observer-' + obs.element.getAttribute('data-observer'));
      }
      obs.visibility = visibility;
    }
  });
};

// Check if element is fully visible in viewport
// https://stackoverflow.com/a/7557433/2037629
const isVisible = (element) => {
  if (element) {
    var rect = element.getBoundingClientRect();
    var page = document.querySelector('body').getBoundingClientRect();

    return (
      // Mobile
      rect.right - rect.width == page.width ||
      // Desktop
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
};
