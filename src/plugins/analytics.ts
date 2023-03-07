declare global {
  interface Window {
    dataLayer: Array<any>
    gtag: (...args: any[]) => void
  }
}

const GoogleAnalytics = {
  install(app, {trackingId, router}) {
    if (!trackingId) {
      app.config.globalProperties.$track = () => {}
    } else {
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`
      let head: HTMLElement = document.head!
      head.appendChild(script)

      function gtag(...args: any[]) {
        const dataLayer = (window.dataLayer = window.dataLayer || [])
        dataLayer.push(arguments)
      }
      gtag('js', new Date())
      gtag('config', trackingId)

      app.config.globalProperties.$track = function (action: string, params?: object) {
        gtag('event', action, params)
      }

      router.afterEach(to => { 
        gtag('config', trackingId, {page_path: to.fullPath})
      })
    }
  }
}

export default GoogleAnalytics
