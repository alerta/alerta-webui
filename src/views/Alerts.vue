<template>
  <div class="alerts">

    <audio
      ref="audio"
      :src="audioURL"
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
import moment from 'moment'

import AlertList from '@/components/AlertList.vue'
import AlertDetail from '@/components/AlertDetail.vue'
import AlertListFilter from '@/components/AlertListFilter.vue'
import utils from '@/common/utils'

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
    timer: null
  }),
  computed: {
    audioURL() {
      return this.$config.audio.new || this.$store.getters.getPreference('audioURL')
    },
    defaultTab() {
      return utils.fromHash(this.hash).environment ? `tab-${utils.fromHash(this.hash).environment}` : 'tab-ALL'
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
              ? Object.keys(alert).some(k => alert[k] && alert[k].toString().toLowerCase().includes(this.filter.text.toLowerCase()))
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
    isNewOpenAlerts() {
      return this.alerts.filter(x => x.status == 'open').reduce((a, v) => a || !v.repeat, false)
    },
    totalCount() {
      return this.$store.state.alerts.environments
        .map(e => e.count).reduce((a, b) => a + b, 0)
    },
    environments() {
      return [{ environment: 'ALL', count: this.totalCount }]
        .concat(this.$store.state.alerts.environments)
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
    },
    pagination() {
      return this.$store.state.alerts.pagination
    }
  },
  watch: {
    dialog(val) {
      val || this.close()
    },
    filter: {
      handler(val) {
        history.pushState(null, null, this.$store.getters['alerts/getHash'])
      },
      deep: true
    },
    pagination: {
      handler(val) {
        history.pushState(null, null, this.$store.getters['alerts/getHash'])
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
    if (this.hash) {
      let hashMap = utils.fromHash(this.hash)
      this.setFilter(hashMap)
      this.setSort(hashMap)
    }
    this.setKiosk(this.isKiosk)
    this.getEnvironments()
    this.cancelTimer()
    this.refreshAlerts()
  },
  beforeDestroy() {
    this.cancelTimer()
  },
  methods: {
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
    setSort(sort) {
      this.$store.dispatch('alerts/setPagination', {
        descending: sort.sd == '1',
        sortBy: sort.sb
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
    playSound() {
      !this.isMute && this.$refs.audio.play()
    },
    refreshAlerts() {
      this.getAlerts()
        .then(() => {
          this.isNewOpenAlerts && this.playSound()
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
      this.$router.push({ path: `/alert/${item.id}` })
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
