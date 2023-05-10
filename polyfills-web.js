if (!global.ErrorUtils) {
  console.log('ErrorUtils is not supported. Using polyfill.');

  global.ErrorUtils = function ErrorUtils() {
    return window.onError;
  };

  global.ErrorUtils.setGlobalHandler = function setGlobalHandler() {
    return window.onError;
  };
}
