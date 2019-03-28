<template>
  <div class="alerts">
    <audio
      v-if="playSound && !isMute"
      :src="$config.audio.new"
      autoplay
    />

    <alert-detail
      v-show="dialog"
      v-if="selectedId"
      :id="selectedId"
      @close="close"
    />

    <v-tabs
      v-if="!dialog"
      v-model="currentTab"
      class="px-1"
      grow
    >
      <v-tabs-slider />
      <v-tab
        v-for="env in environments"
        :key="env.environment"
        :href="'#tab-' + env.environment"
        @click="setEnv(env.environment)"
      >
        <v-badge color="grey darken-1">
          <span slot="badge">
            {{
              environmentCounts[env.environment] || 0
            }}
          </span>
          {{ env.environment }}&nbsp;
        </v-badge>
      </v-tab>
      <v-spacer />
      <v-btn
        flat
        icon
        :class="{ 'filter-active': isActive }"
        @click="sidesheet = !sidesheet"
      >
        <v-icon>filter_list</v-icon>
      </v-btn>
      <v-btn
        flat
        icon
      >
        <v-icon>more_vert</v-icon>
      </v-btn>
      <span class="pr-2" />

      <v-tabs-items
        v-model="currentTab"
      >
        <v-tab-item
          v-for="env in environments"
          :key="env.environment"
          :value="'tab-' + env.environment"
          :transition="false"
          :reverse-transition="false"
        >
          <alert-list
            :alerts="alertsByEnvironment"
            @set-alert="setAlert"
          />
        </v-tab-item>
      </v-tabs-items>
    </v-tabs>

    <alert-list-filter
      :value="sidesheet"
      @close="sidesheet = false"
    />
  </div>
</template>

<script>
import AlertList from '@/components/AlertList.vue'
import AlertDetail from '@/components/AlertDetail.vue'
import AlertListFilter from '@/components/AlertListFilter.vue'
import moment from 'moment'

export default {
  components: {
    AlertList,
    AlertDetail,
    AlertListFilter
  },
  props: {
    query: {
      type: String,
      required: false,
      default: null
    },
    isKiosk: {
      type: String,
      required: false,
      default: null
    },
    hash: {
      type: String,
      required: false,
      default: ''
    }
  },
  data: vm => ({
    currentTab: 'tab-ALL',
    dialog: false,
    selectedId: null,
    selectedItem: {},
    sidesheet: false,
    playSound: false,
    timer: null
  }),
  computed: {
    defaultTab() {
      return this.fromHash(this.hash).environment ? `tab-${this.fromHash(this.hash).environment}` : 'tab-ALL'
    },
    filter() {
      return this.$store.state.alerts.filter
    },
    isActive() {
      return this.filter.text || this.filter.status ||this.filter.customer || this.filter.service || this.filter.group || this.filter.dateRange[0] || this.filter.dateRange[1]
    },
    alerts() {
      if (this.filter) {
        return this.$store.getters['alerts/alerts']
          .filter(alert =>
            this.filter.text
              ? Object.keys(alert).some(k => alert[k] && alert[k].toString().toLowerCase().includes(this.filter.text))
              : true
          )
          .filter(alert =>
            this.filter.status
              ? this.filter.status.includes(alert.status)
              : true
          )
          .filter(alert =>
            this.filter.customer
              ? this.filter.customer.includes(alert.customer)
              : true
          )
          .filter(alert =>
            this.filter.service
              ? alert.service.some(x => this.filter.service.includes(x))
              : true
          )
          .filter(alert =>
            this.filter.group
              ? this.filter.group.includes(alert.group)
              : true
          )
          .filter(alert => {
            if (this.filter.dateRange) {
              const startTime = this.filter.dateRange[0]
                ? moment()
                  .utc()
                  .subtract(this.filter.dateRange[0], 'seconds')
                : null
              const endTime = this.filter.dateRange[1]
                ? moment()
                  .utc()
                  .subtract(this.filter.dateRange[1], 'seconds')
                : null

              const lastReceiveTime = moment(
                String(alert.lastReceiveTime)
              ).utc()
              const afterStart = startTime
                ? lastReceiveTime.isSameOrAfter(startTime)
                : true
              const beforeEnd = endTime
                ? lastReceiveTime.isBefore(endTime)
                : true

              return afterStart && beforeEnd
            } else {
              return true
            }
          })
      } else {
        return this.$store.getters['alerts/alerts']
      }
    },
    environments() {
      let e = this.$store.state.alerts.environments
      let totalCount = e.map(e => e.count).reduce((a, b) => a + b, 0)
      return [{ environment: 'ALL', count: totalCount }].concat(e)
    },
    environmentCounts() {
      return this.alerts.reduce((grp, a) => {
        grp[a.environment] = grp[a.environment] + 1 || 1
        grp['ALL'] = grp['ALL'] + 1 || 1
        return grp
      }, {})
    },
    alertsByEnvironment() {
      return this.alerts.filter(alert =>
        this.filter.environment
          ? alert.environment === this.filter.environment
          : true
      )
    },
    refreshInterval() {
      return (
        this.$store.getters.getPreference('refreshInterval') ||
        this.$store.getters.getConfig('refresh_interval')
      )
    },
    autoRefresh() {
      return true // FIXME: autoRefresh setting comes from server in alert response
    },
    refresh() {
      return this.$store.state.refresh
    },
    isMute() {
      return this.$store.getters.getPreference('isMute')
    }
  },
  watch: {
    dialog(val) {
      val || this.close()
    },
    alerts(current, old) {
      if (
        old &&
        current.length > old.length &&
        this.filter.status &&
        this.filter.status.includes('open')  // FIXME
      ) {
        this.playSound = true
      } else {
        this.playSound = false
      }
    },
    filter: {
      handler(val) {
        history.pushState(null, null, this.toHash(val))
      },
      deep: true
    },
    refresh(val) {
      val || this.getAlerts()
    }
  },
  created() {
    this.currentTab = this.defaultTab
    this.setSearch(this.query)
    this.setFilter(this.fromHash(this.hash))
    this.setKiosk(this.isKiosk)
    this.getEnvironments()
    this.cancelTimer()
    this.refreshAlerts()
  },
  beforeDestroy() {
    this.cancelTimer()
  },
  methods: {
    fromHash(h) {
      let hash = decodeURI(h).substring(1)
      return hash.split(';').map(x => x.split(':')).reduce((a, c) => Object.assign(a, {[c[0]]: c[1]}), {})
    },
    toHash(f) {
      return '#' + Object.entries(f).filter(x => x[1]).reduce((a,c) => a.concat(c[0] + ':' + c[1]), []).join(';')
    },
    setSearch(query) {
      this.$store.dispatch('alerts/updateQuery', { q: query })
    },
    setFilter(filter) {
      this.$store.dispatch('alerts/setFilter', {
        environment: filter.environment,
        text: filter.text,
        status: filter.status ? filter.status.split(',') : null,
        customer: filter.customer ? filter.customer.split(',') : null,
        service: filter.service ? filter.service.split(',') : null,
        group: filter.group ? filter.group.split(',') : null,
        dateRange: filter.dateRange ? filter.dateRange.split(',').map(n => n ? parseInt(n) : null) : [null, null]
      })
    },
    setKiosk(isKiosk) {
      this.$store.dispatch('alerts/updateKiosk', isKiosk)
    },
    getAlerts() {
      return this.$store.dispatch('alerts/getAlerts')
    },
    getEnvironments() {
      this.$store.dispatch('alerts/getEnvironments')
    },
    cancelTimer() {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    },
    refreshAlerts() {
      this.getAlerts()
        .then(() => {
          this.timer = setTimeout(() => this.refreshAlerts(), this.refreshInterval)
        })
    },
    setEnv(env) {
      this.$store.dispatch('alerts/setFilter', {
        environment: env === 'ALL' ? null : env
      })
    },
    setAlert(item) {
      this.selectedId = item.id
      this.selectedItem = Object.assign({}, item)
      this.dialog = true
    },
    close() {
      this.dialog = false
      setTimeout(() => {
        this.selectedItem = {}
        this.selectedId = null
      }, 300)
    }
  }
}
</script>

<style>
.filter-active::after {
  background-color: rgb(255, 82, 82);
  border-radius: 50%;
  box-sizing: border-box;
  content: " ";
  height: 8px;
  position: absolute;
  right: 7px;
  top: 9px;
  width: 8px;
}
</style>
