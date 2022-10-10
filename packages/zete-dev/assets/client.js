function rendering() {
  if (typeof window === 'undefined') return;

  console.log('Rendering Page');
}

function init() {
  window.sapianse = {};
}

// init

window.sapianseKit = {};
window.sapianseKit.render = rendering;
window.sapianseKit.init = init;

init();
