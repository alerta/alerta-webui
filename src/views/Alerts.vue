<template>
  <div class="alerts">
    <audio
      v-if="playSound && !isMute"
      :src="$config.audio.new"
      autoplay
    />

    <alert-list-filter
      :value="sidesheet"
      :filter="filter"
      @set-text="setText"
      @set-status="setStatus"
      @set-service="setService"
      @set-date="setDateRange"
      @close="sidesheet = false"
    />

    <v-tabs class="px-2" grow>
      <v-tabs-slider />
      <v-tab
        v-for="env in environments"
        :key="env.environment"
        :href="'#tab-' + env.environment"
        @click="setEnv(env.environment)"
      >
        <v-badge color="grey">
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
        :class="{ active: isActive }"
        @click="sidesheet = !sidesheet"
      >
        <v-icon>filter_list</v-icon>
      </v-btn>
      <span class="pr-2" />

      <v-tabs-items>
        <v-tab-item
          v-for="env in environments"
          :key="env.environment"
          :value="'tab-' + env.environment"
          :transition="false"
          :reverse-transition="false"
        >
          <alert-list :alerts="alertsByEnvironment" />
        </v-tab-item>
      </v-tabs-items>
    </v-tabs>
  </div>
</template>

<script>
import AlertList from '@/components/AlertList.vue'
import AlertListFilter from '@/components/AlertListFilter.vue'
import moment from 'moment'

export default {
  components: {
    AlertList,
    AlertListFilter
  },
  props: {
    query: {
      type: String,
      required: false,
      default: null
    }
  },
  data: () => ({
    currentTab: 'ALL',
    sidesheet: false,
    filter: {
      text: null,
      environment: null,
      service: null,
      status: ['open', 'ack'],
      dateRange: [null, null]
    },
    playSound: false
  }),
  computed: {
    isActive() {
      return this.filter.text || this.filter.service || this.filter.dateRange[0] || this.filter.dateRange[1]
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
            this.filter.service
              ? alert.service.some(x => this.filter.service.includes(x))
              : true
          )
          .filter(alert =>
            this.filter.status
              ? this.filter.status.includes(alert.status)
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
    alerts(current, old) {
      if (
        old &&
        current.length > old.length &&
        this.filter.status &&
        this.filter.status.includes('open')
      ) {
        this.playSound = true
      } else {
        this.playSound = false
      }
    },
    refresh(val) {
      val || this.getAlerts()
    }
  },
  created() {
    this.setSearch(this.query)
    this.getEnvironments()
    this.getAlerts()
    if (this.autoRefresh) {
      this.timer = setInterval(() => this.getAlerts(), this.refreshInterval)
    }
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    setSearch(query) {
      this.$store.dispatch('alerts/updateQuery', { q: query })
    },
    getAlerts() {
      this.$store.dispatch('alerts/getAlerts')
    },
    getEnvironments() {
      this.$store.dispatch('alerts/getEnvironments')
    },
    setEnv(env) {
      this.filter = Object.assign({}, this.filter, {
        environment: env === 'ALL' ? null : env
      })
    },
    setText(t) {
      this.filter = Object.assign({}, this.filter, {
        text: t
      })
    },
    setStatus(st) {
      this.filter = Object.assign({}, this.filter, {
        status: st.length > 0 ? st : null
      })
    },
    setService(svc) {
      this.filter = Object.assign({}, this.filter, {
        service: svc.length > 0 ? svc : null
      })
    },
    setDateRange(range) {
      this.filter = Object.assign({}, this.filter, {
        dateRange: range
      })
    }
  }
}
</script>

<style>
.active::after {
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
