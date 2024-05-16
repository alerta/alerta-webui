<template>
  <div class="alerts">
    <v-tabs
      v-model="currentTab"
      class="px-1"
      grow
    >
      <v-tab
        v-for="env in environments"
        :key="env"
        :href="'#tab-' + env"
        @click="setEnv(env)"
      >
        {{ env }}&nbsp;({{ environmentCounts[env] || 0 }})
      </v-tab>
  
      <v-spacer />

      <v-tabs-items
        v-model="currentTab"
      >
        <v-tab-item
          v-for="env in environments"
          :key="env"
          :value="'tab-' + env"
          :transition="false"
          :reverse-transition="false"
        >
          <keep-alive max="1">
            <history-list
              v-if="env == filter.environment || env == 'ALL'"
              :history="historyByEnvironment"
            />
          </keep-alive>
        </v-tab-item>
      </v-tabs-items>
    </v-tabs>
  </div>
</template>

<script>
import HistoryList from '@/components/HistoryList.vue'

import moment from 'moment'
import { ExportToCsv } from 'export-to-csv'
import utils from '@/common/utils'
import i18n from '@/plugins/i18n'

export default {
  components: {
    HistoryList
  },
  props: {
    query: {
      type: Object,
      required: false,
      default: () => {}
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
  data: () => ({
    currentTab: null,
    sidesheet: false,
    timer: null
  }),
  computed: {
    defaultTab() {
      return this.filter.environment ? `tab-${this.filter.environment}` : 'tab-ALL'
    },
    filter() {
      return this.$store.state.alerts.historyFilter
    },
    history() {
      if (this.filter) {
        return this.$store.getters['alerts/history']
          .filter(alert =>
            this.filter.text
              ? Object.keys(alert).some(k => alert[k] && alert[k].toString().toLowerCase().includes(this.filter.text.toLowerCase()))
              : true
          )
      } else {
        return this.$store.getters['alerts/history']
      }
    },
    showAllowedEnvs() {
      return this.$store.getters.getPreference('showAllowedEnvs')
    },
    environments() {
      return ['ALL'].concat(this.$store.getters['alerts/environments'](this.showAllowedEnvs))
    },
    environmentCounts() {
      return this.$store.getters['alerts/counts']
    },
    historyByEnvironment() {
      return this.history.filter(history =>
        this.filter.environment
          ? history.environment === this.filter.environment
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
    isLoggedIn() {
      return this.$store.getters['auth/isLoggedIn']
    },
    pagination() {
      return this.$store.state.alerts.historyPagination
    }
  },
  watch: {
    currentTab(val) {
      this.setPage(1)
    },
    pagination: {
      handler(newVal, oldVal) {
        history.pushState(null, null, this.$store.getters['alerts/getHash'])
        if (oldVal.page != newVal.page ||
          oldVal.rowsPerPage != newVal.rowsPerPage ||
          oldVal.sortBy != newVal.sortBy ||
          oldVal.descending != newVal.descending
        ) {
          this.getHistory()
          this.getEnvironments()
        }
      }
    },
    refresh(val) {
      val || this.getHistory() && this.getEnvironments()
    },
    showPanel(val) {
      history.pushState(null, null, this.$store.getters['alerts/getHash'])
    }
  },
  created() {
    this.setSearch(this.query)
    if (this.hash) {
      let hashMap = utils.fromHash(this.hash)
      this.setFilter(hashMap)
      this.setSort(hashMap)
      this.setPanel(hashMap)
    }
    this.currentTab = this.defaultTab
    this.cancelTimer()
    this.refreshHistory()
  },
  beforeDestroy() {
    this.cancelTimer()
  },
  methods: {
    setFilter(filter) {
      this.$store.dispatch('alerts/setHistoryFilter', {
        environment: filter.environment,
      })
    },
    setSort(sort) {
      this.$store.dispatch('alerts/setHistoryPagination', {
        descending: sort.sd == '1',
        sortBy: sort.sb
      })
    },
    setPage(page) {
      this.$store.dispatch('alerts/setHistoryPagination', {page: page})
    },
    setPanel(panel) {
      this.$store.dispatch('alerts/setPanel', panel.asi == '1')
    },
    getHistory() {
      return this.$store.dispatch('alerts/getAlertHistory')
    },
    setSearch(query) {
      this.$store.dispatch('alerts/updateQuery', query)
    },
    getEnvironments() {
      this.$store.dispatch('alerts/getEnvironments')
    },
    playSound() {
      !this.isMute && this.$refs.audio.play()
    },
    setEnv(env) {
      this.$store.dispatch('alerts/setHistoryFilter', {
        environment: env === 'ALL' ? null : env
      })
    },
    refreshHistory() {
      this.getEnvironments()
      this.getHistory()
        .then(() => {
          this.timer = setTimeout(() => this.refreshHistory(), this.refreshInterval)
        })
    },
    cancelTimer() {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    },
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
