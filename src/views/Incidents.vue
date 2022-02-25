<template>
  <div class="incidents">
    <v-dialog v-model="addIncidentDialog" max-width="600px">
      <v-card>
        <v-card-title>Create Incident</v-card-title>

        <v-card-text>
          <v-form>
            <v-text-field
              label="Title"
              outlined
              dense
              autofocus
              :rules="[(v) => !!v || $t('Required')]"
              v-model="newIncident.title"
            />
            <v-autocomplete
              :items="alerts"
              outlined
              multiple
              hide-selected
              clearable
              dense
              label="Alerts"
              item-value="id"
              item-text="resource"
              chips
              small-chips
              deletable-chips
              v-model="newIncident.alerts"
              hide-details
              class="mb-3"
            >
              <template v-slot:item="props">
                <v-list-item-content>
                  <v-list-item-title>
                    {{ props.item.resource }} ({{ props.item.event }})
                  </v-list-item-title>
                </v-list-item-content>
              </template>
            </v-autocomplete>

            <v-select
              label="Severity"
              outlined
              dense
              v-model="newIncident.severity"
              :items="severities"
              :menu-props="{ offsetY: true }"
            />
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" @click="addIncidentDialog = false">
            {{ $t('Cancel') }}
          </v-btn>
          <v-btn color="primary" @click="addIncident">
            {{ $t('OK') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-container :style="severityColors">
      <header class="mb-3 d-flex justify-space-between">
        <v-btn color="primary" @click="addIncidentDialog = true">
          Add Incident
        </v-btn>

        <v-btn
          text
          icon
          :class="{ 'filter-active': isActive }"
          @click="sidesheet = !sidesheet"
        >
          <v-icon>mdi-filter-variant</v-icon>
        </v-btn>
      </header>
      <v-row>
        <v-col v-for="incident in incidents" :key="incident.id">
          <v-card class="relative">
            <v-card-title>
              {{ incident.title }}
            </v-card-title>
            <v-card-subtitle>
              <div class="d-flex gap-1 align-center">
                <span>{{ incident.alerts.length }} {{ $t('Alerts') }}</span>
                <span class="label">
                  {{ incident.status | capitalize }}
                </span>
                <span
                  :class="`label severity-${incident.severity.toLowerCase()}`"
                >
                  {{ incident.severity | capitalize }}
                </span>
              </div>
            </v-card-subtitle>
            <v-divider />

            <div class="actions">
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-on="on"
                    :disabled="
                      !isAcked(incident.status) && !isClosed(incident.status)
                    "
                    icon
                    class="btn--plain px-1 mx-0"
                    @click="takeAction(incident.id, 'open')"
                  >
                    <v-icon size="20px">mdi-refresh</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('Open') }}</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-show="!isAcked(incident.status)"
                    v-on="on"
                    :disabled="!isOpen(incident.status)"
                    icon
                    class="btn--plain px-1 mx-0"
                    @click="ackIncident(incident.id)"
                  >
                    <v-icon size="20px">mdi-check</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('Ack') }}</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-show="isAcked(incident.status)"
                    v-on="on"
                    icon
                    class="btn--plain px-1 mx-0"
                    @click="takeAction(incident.id, 'unack')"
                  >
                    <v-icon size="20px">mdi-undo</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('Unack') }}</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-btn
                    v-on="on"
                    :disabled="incident.status == 'closed'"
                    icon
                    class="btn--plain px-1 mx-0"
                    @click="takeAction(incident.id, 'close')"
                  >
                    <v-icon size="20px">mdi-close-circle-outline</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('Close') }}</span>
              </v-tooltip>
            </div>
            <v-card-text>
              <v-sheet
                v-if="incident.note"
                class="px-4 py-2 mb-2"
                :color="
                  $vuetify.theme.dark ? 'grey darken-2' : 'grey lighten-3'
                "
                rounded
              >
                <pre class="note">{{ incident.note }}</pre>
              </v-sheet>

              <v-textarea
                v-if="creatingNote === incident.id"
                v-model="newNote"
                autofocus
                :rules="[(v) => !!v || $t('NoteRequired')]"
                placeholder="Add a note"
                rows="2"
                auto-grow
                outlined
              />
            </v-card-text>
            <v-card-actions class="px-4">
              <div>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-avatar v-on="on">
                      <img
                        v-if="incident.owner.avatar"
                        :src="incident.owner.avatar"
                        @error="error = true"
                      />
                      <v-icon v-else size="38" color="grey lighten-2">
                        mdi-account-circle
                      </v-icon>
                    </v-avatar>
                  </template>
                  <span>{{ incident.owner.name }}</span>
                </v-tooltip>
              </div>

              <div class="d-flex gap-1">
                <v-chip v-for="tag in incident.tags" :key="tag">
                  {{ tag }}
                </v-chip>
              </div>
              <v-spacer></v-spacer>

              <v-btn
                color="neutral"
                outlined
                @click="creatingNote = incident.id"
                v-if="creatingNote !== incident.id"
              >
                <v-icon left>mdi-note-plus</v-icon>
                {{ $t('AddNote') }}
              </v-btn>
              <template v-else-if="creatingNote === incident.id">
                <v-btn @click="creatingNote = null" color="error">Cancel</v-btn>
                <v-btn @click="addNote" color="success">Create</v-btn>
              </template>
              <v-btn
                color="primary"
                link
                :to="{ name: 'incident', params: { id: incident.id } }"
                :disabled="creatingNote === incident.id"
              >
                Details
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

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

    <incident-list-filter :value="sidesheet" @close="sidesheet = false" />
  </div>
</template>

<script>
import { ExportToCsv } from 'export-to-csv'
import utils from '@/common/utils'
import Vue from 'vue'
import debounce from 'lodash/debounce'
import IncidentsApi from '@/services/api/incident.service'
import IncidentListFilter from '@/components/IncidentListFilter.vue'

export default Vue.extend({
  props: {
    query: {
      type: Object,
      required: false,
      default: new URLSearchParams()
    },
    hash: {
      type: String,
      required: false,
      default: ''
    }
  },
  components: {
    IncidentListFilter
  },
  data: () => ({
    currentTab: null,
    densityDialog: false,
    selectedId: null,
    selectedincident: {},
    sidesheet: false,
    timer: null,
    creatingNote: null,
    newNote: null,
    addIncidentDialog: false,
    newIncident: {},
    severities: [
      'warning',
      'critical',
      'debug',
      'cleared',
      'indeterminate',
      'informational',
      'major',
      'minor',
      'normal',
      'ok',
      'security',
      'trace',
      'unknown'
    ]
  }),
  computed: {
    audioURL() {
      return (
        this.$config.audio.new || this.$store.getters.getPreference('audioURL')
      )
    },
    ackTimeout() {
      return this.$store.getters.getPreference('ackTimeout')
    },
    alerts() {
      return this.$store.state.alerts.alerts
    },
    defaultTab() {
      return this.filter.environment
        ? `tab-${this.filter.environment}`
        : 'tab-ALL'
    },
    filter() {
      return this.$store.state.incidents.filter
    },
    severityColors() {
      const colors = this.$store.getters.getConfig('colors')

      return {
        ...Object.entries(colors.severity).reduce(
          (acc, [severity, color]) => ({
            ...acc,
            [`--bg-${severity}`]: color,
            [`--text-${severity}`]: colors.text
          }),
          {}
        )
      }
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
    addIncidentDialog(val) {
      if (val && !this.alerts?.length) this.$store.dispatch('alerts/getAlerts')
    },
    filter: {
      async handler() {
        await this.router.push(this.$store.getters['incidents/getHash'])
        this.currentTab = this.defaultTab
        this.cancelTimer()
        this.refreshIncidents()
      },
      deep: true
    },
    pagination: {
      async handler(newVal, oldVal) {
        await this.router.push(this.$store.getters['incidents/getHash'])
        if (
          oldVal.page != newVal.page ||
          oldVal.incidentsPerPage != newVal.incidentsPerPage ||
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
    async showPanel() {
      await this.router.push(this.$store.getters['incidents/getHash'])
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
    addNote() {
      if (!this.newNote)
        return this.$store.dispatch('notifications/custom', {
          type: 'error',
          text: i18n.t('NoteRequired').toString(),
          action: 'CLOSE',
          timeout: 5000
        })
      IncidentsApi.addNote(this.creatingNote, this.newNote).then(() => {
        this.$store.dispatch('notifications/success', 'Note created')
        this.newNote = null
        this.creatingNote = null
        this.getIncidents()
      })
    },

    addIncident() {
      IncidentsApi.createIncident(this.newIncident).then(() => {
        this.addIncidentDialog = false
        this.$store.dispatch('notifications/success', 'Incident created')
        this.newIncident = {}
        this.getIncidents()
      })
    },
    cancelTimer() {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    },
    isOpen(status) {
      return status == 'open' || status == 'NORM'
    },
    isAcked(status) {
      return status == 'ack' || status == 'ACKED'
    },
    isShelved(status) {
      return status == 'shelved' || status == 'SHLVD'
    },
    isClosed(status) {
      return status == 'closed'
    },
    takeAction: debounce(
      function (id, action, text) {
        this.$store
          .dispatch('incidents/takeAction', [id, action, text])
          .then(() => this.getIncidents())
      },
      200,
      { leading: true, trailing: false }
    ),

    ackIncident(id, text) {
      this.$store
        .dispatch('incidents/takeAction', [id, 'ack', text, this.ackTimeout])
        .then(() => this.getIncidents())
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
        data.map(({ correlate, service, tags, rawData, ...incident }) => ({
          correlate: correlate.join(','),
          service: service.join(','),
          tags: tags.join(','),
          ...attrs,
          ...incident,
          rawData: rawData ? rawData.toString() : ''
        }))
      )
    }
  }
})
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

.gap-1 {
  gap: 0.25rem;
}

.actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.note {
  white-space: pre-wrap;
  white-space: -moz-pre-wrap;
  white-space: -pre-wrap;
  white-space: -o-pre-wrap;
  word-wrap: break-word;
}
</style>
