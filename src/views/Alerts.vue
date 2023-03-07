<template>
  <div class="alerts">
    <audio
      ref="audio"
      :src="audioURL"
    />

    <v-dialog
      v-model="densityDialog"
      max-width="340px"
    >
      <v-form ref="form">
        <v-card>
          <v-card-title class="justify-center">
            <span class="title">
              {{ $t('ChooseDisplayDensity') }}
            </span>
          </v-card-title>
          <v-card-actions class="justify-center">
            <v-btn
              value="comfortable"
              :class="{ primary: displayDensity == 'comfortable' }"
              @click="displayDensity = 'comfortable'"
            >
              {{ $t('Comfortable') }}
            </v-btn>
            <v-btn
              value="compact"
              :class="{ primary: displayDensity == 'compact' }"
              @click="displayDensity = 'compact'"
            >
              {{ $t('Compact') }}
            </v-btn>
          </v-card-actions>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="blue darken-1"
              flat
              @click="ok"
            >
              {{ $t('OK') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-expand-transition>
      <div
        v-if="showPanel"
        class="px-1"
      >
        <v-layout wrap>
          <v-flex
            v-for="(indicator, index) in indicators"
            :key="index"
            xs12
            sm6
            md3
          >
            <alert-indicator
              :title="indicator.text"
              :query="indicator.query"
            />
          </v-flex>
        </v-layout>
        <v-divider />
      </div>
    </v-expand-transition>

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
      <v-btn
        flat
        icon
        :class="{ 'filter-active': isActive }"
        @click="sidesheet = !sidesheet"
      >
        <v-icon>filter_list</v-icon>
      </v-btn>

      <v-menu
        bottom
        left
      >
        <v-btn
          slot="activator"
          flat
          icon
        >
          <v-icon>more_vert</v-icon>
        </v-btn>

        <v-list>
          <v-list-tile
            :disabled="!indicators.length"
            @click="showPanel = !showPanel"
          >
            <v-list-tile-title>
              {{ showPanel ? $t('Hide') : $t('Show') }} {{ $t('Panel') }}
            </v-list-tile-title>
          </v-list-tile>
          <v-list-tile
            @click="densityDialog = true"
          >
            {{ $t('DisplayDensity') }}
          </v-list-tile>
          <v-list-tile
            @click="toCsv(alertsByEnvironment)"
          >
            {{ $t('DownloadAsCsv') }}
          </v-list-tile>
        </v-list>
      </v-menu>

      <span class="pr-2" />

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
            <alert-list
              v-if="env == filter.environment || env == 'ALL'"
              :alerts="alertsByEnvironment"
              @set-alert="setAlert"
            />
          </keep-alive>
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

import moment from 'moment'
import { ExportToCsv } from 'export-to-csv'
import utils from '@/common/utils'
import i18n from '@/plugins/i18n'

export default {
  components: {
    AlertList,
    AlertIndicator: () => import('@/components/AlertIndicator.vue'),
    AlertListFilter: () => import('@/components/AlertListFilter.vue')
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
    densityDialog: false,
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
      return this.filter.environment ? `tab-${this.filter.environment}` : 'tab-ALL'
    },
    filter() {
      return this.$store.state.alerts.filter
    },
    isActive() {
      return this.filter.text || this.filter.status || this.filter.customer || this.filter.service || this.filter.group || this.filter.dateRange[0] || this.filter.dateRange[1]
    },
    indicators() {
      return this.$config.indicators ? this.$config.indicators.queries  : []
    },
    alerts() {
      if (this.filter) {
        return this.$store.getters['alerts/alerts']
          .filter(alert =>
            this.filter.text
              ? Object.keys(alert).some(k => alert[k] && alert[k].toString().toLowerCase().includes(this.filter.text.toLowerCase()))
              : true
          )
      } else {
        return this.$store.getters['alerts/alerts']
      }
    },
    isNewOpenAlerts() {
      return this.alerts
        .filter(alert => this.filter.environment ? this.filter.environment == alert.environment : true)
        .filter(alert => alert.status == 'open')
        .reduce((acc, alert) => acc || !alert.repeat, false)
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
    isLoggedIn() {
      return this.$store.getters['auth/isLoggedIn']
    },
    isMute() {
      return this.$store.getters.getPreference('isMute')
    },
    showPanel: {
      get() {
        return this.$store.state.alerts.showPanel
      },
      set(value) {
        this.$store.dispatch('alerts/toggle', ['showPanel', value])
      }
    },
    displayDensity: {
      get() {
        return (
          this.$store.getters.getPreference('displayDensity') ||
          this.$store.state.alerts.displayDensity
        )
      },
      set(value) {
        if (this.isLoggedIn) {
          this.$store.dispatch('setUserPrefs', {displayDensity: value})
        } else {
          this.$store.dispatch('alerts/set', ['displayDensity', value])
        }
      }
    },
    pagination() {
      return this.$store.state.alerts.pagination
    }
  },
  watch: {
    currentTab(val) {
      this.setPage(1)
    },
    filter: {
      async handler(val) {
        await this.$router.push(this.$store.getters['alerts/getHash'])
        history.replaceState({...history.state}, null)
        this.currentTab = this.defaultTab
        this.cancelTimer()
        this.refreshAlerts()
      },
      deep: true
    },
    pagination: { 
      async handler(newVal, oldVal) {
        await this.$router.push(this.$store.getters['alerts/getHash'])
        history.replaceState({...history.state}, null)
        if (oldVal.page != newVal.page ||
          oldVal.rowsPerPage != newVal.rowsPerPage ||
          oldVal.sortBy != newVal.sortBy ||
          oldVal.descending != newVal.descending
        ) {
          this.getAlerts()
          this.getEnvironments()
        }
      }
    },
    refresh(val) {
      val || this.getAlerts() && this.getEnvironments()
    },
    async showPanel(val) {
      await this.$router.push(this.$store.getters['alerts/getHash'])
      history.replaceState({...history.state}, null)
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
    this.setKiosk(this.isKiosk)
    this.cancelTimer()
    this.refreshAlerts()
  },
  beforeDestroy() {
    this.cancelTimer()
  },
  methods: {
    setSearch(query) {
      this.$store.dispatch('alerts/updateQuery', query)
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
    setPage(page) {
      this.$store.dispatch('alerts/setPagination', {page: page})
    },
    setPanel(panel) {
      this.$store.dispatch('alerts/setPanel', panel.asi == '1')
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
    playSound() {
      !this.isMute && this.$refs.audio.play()
    },
    setEnv(env) {
      this.$store.dispatch('alerts/setFilter', {
        environment: env === 'ALL' ? null : env
      })
    },
    setAlert(item) {
      this.$router.push({ path: `/alert/${item.id}` })
    },
    refreshAlerts() {
      this.getEnvironments()
      this.getAlerts()
        .then(() => {
          this.isNewOpenAlerts && this.playSound()
          this.timer = setTimeout(() => this.refreshAlerts(), this.refreshInterval)
        })
    },
    cancelTimer() {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    },
    ok() {
      this.densityDialog = false
    },
    toCsv(data) {
      const options = {
        fieldSeparator: ',',
        filename: `Alerts_${this.filter.environment || 'ALL'}`,
        quoteStrings: '"',
        decimalSeparator: 'locale',
        showLabels: true,
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
      }
      let attrs = {}
      data.map(d => Object.keys(d.attributes).forEach((attr) => attrs['attributes.'+attr] = d.attributes[attr]))

      const csvExporter = new ExportToCsv(options)
      csvExporter.generateCsv(data.map(({ correlate, service, tags, attributes, rawData, history, ...item }) => ({
        correlate: correlate.join(','),
        service: service.join(','),
        tags: tags.join(','),
        ...attrs,
        ...item,
        rawData: rawData ? rawData.toString() : ''
      })))
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
