// Merge two objects, similar to Object.assign()
export const merge = (obj1, obj2) => {
  var result = {};

  Object.keys(obj1).forEach(key => {
    result[key] = obj1[key];
  });

  Object.keys(obj2).forEach(key => {
    result[key] = obj2[key];
  });

  return result;
};

// Makes nothing
export const noop = () => {};

// Allows function execution only every x milliseconds
// https://davidwalsh.name/javascript-debounce-function
export const debounce = (func, delay) => {
  var timer = null;

  return function () {
    var context = this;
    var args = arguments;

    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
};

// Makes a function only executable once
export const once = (func) => {
  var executed = false;

  return function () {
    if (!executed) {
      executed = true;
      return func.apply(this, arguments);
    }
  };
};

// Get device width
export const getWidth = () => {
  return parseInt((window.innerWidth > 0) ? window.innerWidth : screen.width);
};

// Generates a unique ID (good, but not RFC compliant)
// https://gist.github.com/gordonbrander/2230317
export const uuid = () => {
  return Math.random().toString(36).slice(2);
};

// Get user do-not-track settings
// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/doNotTrack
export const getDNTConsent = () => {
  if (typeof navigator.doNotTrack != 'undefined') {
    return navigator.doNotTrack == '1' ? false : true;
  } else {
    return true;
  }
};

// Get user operating system
export const getDevice = () => {
  if (typeof window != 'undefined') {
    const ua = window.navigator.userAgent;
    const p = window.navigator.platform;
    let n = null;
    return (n = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'].includes(p) ? 'MacOS' : ['iPhone', 'iPad', 'iPod'].includes(p) ? 'iOS' : ['Win32', 'Win64', 'Windows', 'WinCE'].includes(p) ? 'Windows' : /Android/.test(ua) ? 'Android' : !n && /Linux/.test(p) ? 'Linux' : 'unknown');
  }
  return 'unknown';
};
