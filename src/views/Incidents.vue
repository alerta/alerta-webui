<template>
  <div class="incidents">
    <audio ref="audio" :src="audioURL" />

    <v-dialog v-model="densityDialog" max-width="340px">
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
            <v-btn color="blue darken-1" text @click="ok">
              {{ $t('OK') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-expand-transition>
      <div v-if="showPanel" class="px-1">
        <v-layout wrap>
          <v-flex
            v-for="(indicator, index) in indicators"
            :key="index"
            xs12
            sm6
            md3
          >
            <alert-indicator :title="indicator.text" :query="indicator.query" />
          </v-flex>
        </v-layout>
        <v-divider />
      </div>
    </v-expand-transition>

    <v-tabs v-model="currentTab" class="px-1" grow>
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
        text
        icon
        :class="{ 'filter-active': isActive }"
        @click="sidesheet = !sidesheet"
      >
        <v-icon>mdi-filter-variant</v-icon>
      </v-btn>

      <v-menu bottom left>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" text icon>
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item
            :disabled="!indicators.length"
            @click="showPanel = !showPanel"
          >
            <v-list-item-title>
              {{ showPanel ? $t('Hide') : $t('Show') }} {{ $t('Panel') }}
            </v-list-item-title>
          </v-list-item>
          <v-list-item @click="densityDialog = true">
            {{ $t('DisplayDensity') }}
          </v-list-item>
          <v-list-item @click="toCsv(incidentsByEnvironment)">
            {{ $t('DownloadAsCsv') }}
          </v-list-item>
        </v-list>
      </v-menu>

      <span class="pr-2" />

      <v-tabs-items v-model="currentTab">
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
              :incidents="incidentsByEnvironment"
              @set-alert="setIncident"
            />
          </keep-alive>
        </v-tab-item>
      </v-tabs-items>
    </v-tabs>

    <alert-list-filter :value="sidesheet" @close="sidesheet = false" />
  </div>
</template>

<script>
import AlertList from '@/components/AlertList.vue'
import AlertIndicator from '@/components/AlertIndicator.vue'
import AlertListFilter from '@/components/AlertListFilter.vue'

import { ExportToCsv } from 'export-to-csv'
import utils from '@/common/utils'

export default {
  components: {
    AlertList,
    AlertIndicator,
    AlertListFilter
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
      return (
        this.$config.audio.new || this.$store.getters.getPreference('audioURL')
      )
    },
    defaultTab() {
      return this.filter.environment
        ? `tab-${this.filter.environment}`
        : 'tab-ALL'
    },
    filter() {
      return this.$store.state.incidents.filter
    },
    isActive() {
      return (
        this.filter.text ||
        this.filter.status ||
        this.filter.customer ||
        this.filter.service ||
        this.filter.group ||
        this.filter.dateRange[0] ||
        this.filter.dateRange[1]
      )
    },
    indicators() {
      return this.$config.indicators ? this.$config.indicators.queries : []
    },
    incidents() {
      if (this.filter) {
        return this.$store.getters['incidents/incidents'].filter((incident) =>
          this.filter.text
            ? Object.keys(incident).some(
                (k) =>
                  incident[k] &&
                  incident[k]
                    .toString()
                    .toLowerCase()
                    .includes(this.filter.text.toLowerCase())
              )
            : true
        )
      } else {
        return this.$store.getters['incidents/incidents']
      }
    },
    isNewOpenIncidents() {
      return this.incidents
        .filter((incident) =>
          this.filter.environment
            ? this.filter.environment == incident.environment
            : true
        )
        .filter((incident) => incident.status == 'open')
        .reduce((acc, incident) => acc || !incident.repeat, false)
    },
    showAllowedEnvs() {
      return this.$store.getters.getPreference('showAllowedEnvs')
    },
    environments() {
      return [
        'ALL',
        ...this.$store.getters['incidents/environments'](this.showAllowedEnvs)
      ]
    },
    environmentCounts() {
      return this.$store.getters['incidents/counts']
    },
    incidentsByEnvironment() {
      return this.incidents.filter((incident) =>
        this.filter.environment
          ? incident.environment === this.filter.environment
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
      return true // FIXME: autoRefresh setting comes from server in incident response
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
        return this.$store.state.incidents.showPanel
      },
      set(value) {
        this.$store.dispatch('incidents/toggle', ['showPanel', value])
      }
    },
    displayDensity: {
      get() {
        return (
          this.$store.getters.getPreference('displayDensity') ||
          this.$store.state.incidents.displayDensity
        )
      },
      set(value) {
        if (this.isLoggedIn) {
          this.$store.dispatch('setUserPrefs', { displayDensity: value })
        } else {
          this.$store.dispatch('incidents/set', ['displayDensity', value])
        }
      }
    },
    pagination() {
      return this.$store.state.incidents.pagination
    }
  },
  watch: {
    currentTab() {
      this.setPage(1)
    },
    filter: {
      handler() {
        history.pushState(null, null, this.$store.getters['incidents/getHash'])
        this.currentTab = this.defaultTab
        this.cancelTimer()
        this.refreshIncidents()
      },
      deep: true
    },
    pagination: {
      handler(newVal, oldVal) {
        history.pushState(null, null, this.$store.getters['incidents/getHash'])
        if (
          oldVal.page != newVal.page ||
          oldVal.itemsPerPage != newVal.itemsPerPage ||
          oldVal.sortBy != newVal.sortBy ||
          oldVal.descending != newVal.descending
        ) {
          this.getIncidents()
          this.getEnvironments()
        }
      }
    },
    refresh(val) {
      val || (this.getIncidents() && this.getEnvironments())
    },
    showPanel() {
      history.pushState(null, null, this.$store.getters['incidents/getHash'])
    }
  },
  created() {
    this.setSearch(this.query)
    if (this.hash) {
      const hashMap = utils.fromHash(this.hash)
      this.setFilter(hashMap)
      this.setSort(hashMap)
      this.setPanel(hashMap)
    }
    this.currentTab = this.defaultTab
    this.setKiosk(this.isKiosk)
    this.cancelTimer()
    this.refreshIncidents()
  },
  beforeDestroy() {
    this.cancelTimer()
  },
  methods: {
    setSearch(query) {
      this.$store.dispatch('incidents/updateQuery', query)
    },
    setFilter(filter) {
      this.$store.dispatch('incidents/setFilter', {
        environment: filter.environment,
        text: filter.text,
        status: filter.status ? filter.status.split(',') : null,
        customer: filter.customer ? filter.customer.split(',') : null,
        service: filter.service ? filter.service.split(',') : null,
        group: filter.group ? filter.group.split(',') : null,
        dateRange: filter.dateRange
          ? filter.dateRange.split(',').map((n) => (n ? parseInt(n) : null))
          : [null, null]
      })
    },
    setSort(sort) {
      this.$store.dispatch('incidents/setPagination', {
        sortDesc: [sort.sd == '1'],
        sortBy: sort.sb === 'default' ? [] : [sort.sb]
      })
    },
    setPage(page) {
      this.$store.dispatch('incidents/setPagination', { page: page })
    },
    setPanel(panel) {
      this.$store.dispatch('incidents/setPanel', panel.asi == '1')
    },
    setKiosk(isKiosk) {
      this.$store.dispatch('incidents/updateKiosk', isKiosk)
    },
    getIncidents() {
      return this.$store.dispatch('incidents/getIncidents')
    },
    getEnvironments() {
      this.$store.dispatch('incidents/getEnvironments')
    },
    playSound() {
      !this.isMute && this.$refs.audio.play()
    },
    setEnv(env) {
      this.$store.dispatch('incidents/setFilter', {
        environment: env === 'ALL' ? null : env
      })
    },
    setIncident(item) {
      this.$router.push({ path: `/incidents/${item.id}` })
    },
    refreshIncidents() {
      this.getEnvironments()
      this.getIncidents().then(() => {
        this.isNewOpenIncidents && this.playSound()
        this.timer = setTimeout(
          () => this.refreshIncidents(),
          this.refreshInterval
        )
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
        filename: `Incidents_${this.filter.environment || 'ALL'}`,
        quoteStrings: '"',
        decimalSeparator: 'locale',
        showLabels: true,
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true
      }
      const attrs = {}
      data.map((d) =>
        Object.keys(d.attributes).forEach(
          (attr) => (attrs['attributes.' + attr] = d.attributes[attr])
        )
      )

      const csvExporter = new ExportToCsv(options)
      csvExporter.generateCsv(
        data.map(({ correlate, service, tags, rawData, ...item }) => ({
          correlate: correlate.join(','),
          service: service.join(','),
          tags: tags.join(','),
          ...attrs,
          ...item,
          rawData: rawData ? rawData.toString() : ''
        }))
      )
    }
  }
}
</script>

<style>
.filter-active::after {
  background-color: rgb(255, 82, 82);
  border-radius: 50%;
  box-sizing: border-box;
  content: ' ';
  height: 8px;
  position: absolute;
  right: 7px;
  top: 9px;
  width: 8px;
}
</style>
