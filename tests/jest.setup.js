import Vue from 'vue'

Vue.config.productionTip = false

const error = global.console.error
const warn = global.console.warn

global.console.error = function(...args) {
  error(...args)
  throw new Error(args)
}

global.console.warn = function(...args) {
  warn(...args)
  throw new Error(args)
}
