function check( Vue, done, f ) {
  Vue.nextTick(() => {
    try {
      f();
      if (done) { done() };
    } catch( e ) {
      console.log(e)
      done( e );
    }
  })
}


var setupVm = function (Vue, Component, testData, template, VToolTip) {
  let v = new Vue({
    template: '<div>' + template + '</div>',
    components: {
      'test': Component
    },
    data: testData
  }).$mount()
  Vue.use(VToolTip)
  return v
}

var getComponent = function(vm) {
  return vm.$children[0]
}

var setupComponent = function(Vue, Component, testData) {
  var vm = setupVm(Vue, Component, testData)
  return vm.$children[0]
}

var stubFBBridge = function (fbb) {
  fbb.fbdb = {
    ref: function (path) {
      return {
        once: function (stuff, cb) { return },
        set: function (stuff, cb) { return }
      }
    }
  }
  fbb.idefRef = sinon.stub().returns('path')
  return fbb
}
