<template>
  <v-card
    class="alert-indicator"
    @click="selectAsi()"
  >
    <v-card-text
      class="pa-0"
      :style="{ 'background-color': severityColor(maxSeverity) }"
    >
      <div
        class="text-uppercase text-xs-center py-2"
      >
        {{ title }}
      </div>
    </v-card-text>

    <v-card-actions
      class="pa-0 mx-0"
      :style="{ 'background-color': isDark ? '' : '#F5F5F5' }"
    >
      <v-layout>
        <v-col>
          <div
            class="counts-container"
          >
            <v-layout
              v-if="counts"
              align-start
              justify-space-between
            >
              <div
                v-for="severity in $config.indicators.severity"
                :key="severity"
                class="count text-xs-center py-2"
                :style="{ 'background-color': severityColor(severity) }"
              >
                {{ counts[severity] || 0 }}
              </div>
            </v-layout>
          </div>
        </v-col>
      </v-layout>
    </v-card-actions>
  </v-card>
</template>

<script>
import AlertsApi from '../services/api/alert.service'

export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    query: {
      type: [ String, Array, Object ],  // URLSearchParams
      default: ''
    }
  },
  data: () => ({
    counts: null,
    openCounts: null,
    maxSeverity: null,
    timer: null
  }),
  computed: {
    isDark() {
      return this.$store.getters.getPreference('isDark')
    },
    refresh() {
      return this.$store.state.refresh
    },
    refreshInterval() {
      return (
        this.$store.getters.getPreference('refreshInterval') ||
        this.$store.getters.getConfig('refresh_interval')
      )
    }
  },
  watch: {
    refresh(val) {
      if (val) {
        this.getMostSevere()
        this.getCounts()
      }
    }
  },
  created() {
    this.cancelTimer()
    this.refreshCounts()
  },
  beforeUnmount() {
    this.cancelTimer()
  },
  methods: {
    selectAsi() {
      this.setSearch(new URLSearchParams(this.query))
      this.setFilter(new URLSearchParams(this.query))
      this.refreshList()
    },
    setSearch(query) {
      this.$store.dispatch('alerts/updateQuery', query)
    },
    setFilter(filter) {
      this.$store.dispatch('alerts/setFilter', {
        environment: filter.get('environment'),
        text: filter.get('text'),
        status: filter.has('status') ? filter.getAll('status') : null,
        customer: filter.has('customer') ? filter.getAll('customer') : null,
        service: filter.has('service') ? filter.getAll('service') : null,
        group: filter.has('group') ? filter.getAll('group') : null
      })
    },
    severityColor(severity) {
      return this.counts && this.counts[severity] > 0 ? this.$store.getters.getConfig('colors').severity[severity] : 'transparent'
    },
    getCounts() {
      return AlertsApi.getCounts(new URLSearchParams(this.query))
        .then(response => (this.counts = response.severityCounts))
    },
    getMostSevere() {
      let paramsWithOpenStatus = new URLSearchParams(this.query)
      paramsWithOpenStatus.append('status', 'open')

      AlertsApi.getCounts(paramsWithOpenStatus)
        .then(response => {
          this.maxSeverity = this.$config.alarm_model.defaults.normal_severity
          for (let sev of this.$config.indicators.severity) {
            if (response.severityCounts[sev] > 0) {
              this.maxSeverity = sev
              break
            }
          }
        })
    },
    refreshCounts() {
      this.getMostSevere()
      this.getCounts()
        .then(() => this.timer = setTimeout(() => this.refreshCounts(), this.refreshInterval))
    },
    refreshList() {
      this.$store.dispatch('set', ['refresh', true])
      setTimeout(() => {
        this.$store.dispatch('set', ['refresh', false])
      }, 300)
    },
    cancelTimer() {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    }
  }
}
</script>

<style scoped>
.alert-indicator .v-card__text div {
  height: 34px;
  font-weight: bold;
  font-family: 'Sintony', sans-serif;
  font-size: 14px;
  vertical-align: middle;
}
.alert-indicator .v-card__actions div {
  height: 34px;
  font-family: 'Sintony', sans-serif;
  font-size: 14px;
  vertical-align: middle;
}

.count {
  min-width: 16%;
}
</style>
