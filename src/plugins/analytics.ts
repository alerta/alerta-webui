import VueRouter from 'vue-router'

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

const GoogleAnalytics = {
  install(
    Vue,
    { trackingId, router }: { trackingId: string; router: VueRouter }
  ) {
    if (!trackingId) {
      Vue.prototype.$track = () => {}
      return
    }

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`
    document.head.appendChild(script)

    const gtag = (...args: any[]) => {
      window.dataLayer
        ? window.dataLayer.push(...args)
        : (window.dataLayer = [...args])
    }
    gtag('js', new Date())
    gtag('config', trackingId)

    Vue.prototype.$track = (action: string, params?: object) =>
      gtag('event', action, params)

    router.afterEach((to) =>
      gtag('config', trackingId, { page_path: to.fullPath })
    )
  }
}

export default GoogleAnalytics
