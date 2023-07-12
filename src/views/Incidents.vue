<template>
  <div>
    <v-dialog v-model="newNoteDialog" max-width="600px">
      <v-card>
        <v-card-title class="break-normal" v-if="newNoteIncident">
          Add note for "{{ newNoteIncident.title }}"
        </v-card-title>

        <v-card-text>
          <v-form>
            <v-textarea
              outlined
              dense
              autofocus
              :rules="[(v) => !!v || $t('Required')]"
              v-model="newNote"
            />
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" @click="newNoteDialog = false">
            {{ $t('Cancel') }}
          </v-btn>
          <v-btn color="primary" @click="createNewNote">
            {{ $t('OK') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="editTagsDialog" max-width="600px">
      <v-card>
        <v-card-title class="break-normal" v-if="editTagsIncident">
          Edit tags for "{{ editTagsIncident.title }}"
        </v-card-title>

        <v-card-text>
          <v-combobox
            outlined
            dense
            autofocus
            multiple
            chips
            deletable-chips
            v-model="editTags"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" @click="editTagsDialog = false">
            {{ $t('Cancel') }}
          </v-btn>
          <v-btn color="primary" @click="editIncidentTags">
            {{ $t('OK') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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

            <v-autocomplete
              label="Owner"
              v-model="newIncident.ownerId"
              :items="users"
              item-text="name"
              item-value="id"
              hide-details
              outlined
              dense
              class="flex-grow-0"
              :loading="$store.state.users.loading"
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

    <div class="d-flex flex-column px-4">
      <div class="d-flex justify-space-between mb-3">
        <v-btn color="primary" @click="addIncidentDialog = true">
          Add Incident
        </v-btn>

        <div class="d-flex align-center gap-2">
          <v-autocomplete
            label="Incident Owner"
            v-model="incidentOwner"
            :items="users"
            item-text="name"
            item-value="id"
            hide-details
            clearable
            solo
            dense
            multiple
            class="flex-grow-0"
            :loading="$store.state.users.loading"
            @focus="getUsers"
          />
          <v-btn
            text
            icon
            :class="{ 'filter-active': isActive }"
            @click="sidesheet = !sidesheet"
          >
            <v-icon>mdi-filter-variant</v-icon>
          </v-btn>
        </div>
      </div>

      <incident-list
        :incidents="incidents"
        @createNote="handleCreateNote"
        @editTags="handleEditTags"
        @getIncidents="getIncidents"
      />
    </div>

    <incident-list-filter :isOpen="sidesheet" @close="sidesheet = false" />
  </div>
</template>

<script lang="ts">
import utils from '@/common/utils'
import IncidentList from '@/components/IncidentList.vue'
import IncidentListFilter from '@/components/IncidentListFilter.vue'
import { i18n } from '@/plugins'
import { IIncidents } from '@/store/interfaces'
import { ExportToCsv } from 'export-to-csv'
import { cloneDeep } from 'lodash'
import Vue from 'vue'
import { DataTableHeader } from 'vuetify/types'

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
    IncidentListFilter,
    IncidentList
  },
  data: () => ({
    currentTab: null as string | null,
    sidesheet: false,
    timer: null as number | null,
    addIncidentDialog: false,
    newIncident: {},
    newNote: null as string | null,
    newNoteIncident: null as IIncidents['incidents'][number] | null,
    newNoteDialog: false,
    editTags: null as string[] | null,
    editTagsIncident: null as IIncidents['incidents'][number] | null,
    editTagsDialog: false,
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
    ],
    headers: [
      {
        text: 'Status',
        value: 'status',
        sortable: false
      },
      {
        text: 'Severity',
        value: 'severity',
        sortable: false
      },
      {
        text: 'Receive Time',
        value: 'lastReceiveTime'
      },
      {
        text: 'Duration',
        value: 'createTime'
      },
      {
        text: 'Last Updated',
        value: 'updateTime'
      },
      {
        text: 'Title',
        value: 'title',
        sortable: false
      },
      {
        text: 'Alerts',
        value: 'alerts',
        sortable: false
      },
      {
        text: 'Assignee',
        value: 'owner',
        sortable: false
      },
      {
        text: 'Actions',
        value: 'actions',
        sortable: false
      }
    ] as DataTableHeader[]
  }),
  mounted() {
    this.$store.dispatch('incidents/setFilter', { status: ['open', 'ack'] })
  },
  computed: {
    filter() {
      return this.$store.state.incidents.filter
    },
    audioURL() {
      return (
        // @ts-ignore
        this.$config.audio.new || this.$store.getters.getPreference('audioURL')
      )
    },
    users() {
      return this.$store.state.users.users
    },
    incidentOwner: {
      get() {
        return this.$store.state.incidents.filter.owner
      },
      set(v) {
        this.$store.dispatch('incidents/setFilter', {
          owner: v
        })
      }
    },
    alerts() {
      return this.$store.state.alerts.alerts
    },
    defaultTab() {
      return this.filter.environment
        ? `tab-${this.filter.environment}`
        : 'tab-ALL'
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
    pagination() {
      return this.$store.state.incidents.pagination
    },
    incidents() {
      if (!this.filter?.text) return this.$store.getters['incidents/incidents']

      return this.$store.getters['incidents/incidents'].filter((incident) =>
        Object.keys(incident).some(
          (k) =>
            incident[k] &&
            incident[k]
              .toString()
              .toLowerCase()
              .includes(this.filter.text.toLowerCase())
        )
      )
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
      return this.filter.environment
        ? this.incidents.filter(
            (incident) => incident.environment === this.filter.environment
          )
        : this.incidents
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
    }
  },
  watch: {
    currentTab() {
      this.setPage(1)
    },
    addIncidentDialog(val) {
      if (val) this.getUsers()
      if (val && !this.alerts?.length) this.$store.dispatch('alerts/getAlerts')
    },
    pagination: {
      async handler() {
        const hash = this.$store.getters['incidents/getHash']
        if (hash !== this.$route.hash) await this.$router.replace(hash)

        this.getIncidents()
        this.getEnvironments()
      },
      deep: true
    },
    filter: {
      async handler() {
        const hash = this.$store.getters['incidents/getHash']
        hash != this.$route.hash && (await this.$router.replace(hash))
        this.currentTab = this.defaultTab

        this.cancelTimer()
        this.refreshIncidents()
      },
      deep: true
    },
    refresh(val) {
      if (!val) return
      this.getIncidents()
      this.getEnvironments()
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

    this.cancelTimer()
    this.refreshIncidents()
    this.newIncident = {
      ownerId: this.$store.getters['auth/getId']
    }
  },
  beforeDestroy() {
    this.cancelTimer()
  },
  methods: {
    handleEditTags(incident: Exclude<typeof this.editTagsIncident, null>) {
      this.editTagsIncident = incident
      this.editTags = cloneDeep(incident.tags)
      this.editTagsDialog = true
    },
    editIncidentTags() {
      if (!this.editTagsIncident) return
      if (this.editTags === this.editTagsIncident.tags) {
        this.editTagsIncident = null
        this.editTags = null
        this.editTagsDialog = false
        return
      }

      this.editTagsDialog = false
      this.$store
        .dispatch('incidents/updateIncident', {
          id: this.editTagsIncident.id,
          tags: this.editTags
        })
        .then(() => {
          this.$store.dispatch('notifications/success', 'Changed tags')
          this.editTagsIncident = null
          this.editTags = null
          this.getIncidents()
        })
    },
    handleCreateNote(incident: Exclude<typeof this.newNoteIncident, null>) {
      this.newNoteIncident = incident
      this.newNoteDialog = true
    },
    createNewNote() {
      if (!this.newNote?.trim() || !this.newNoteIncident)
        return this.$store.dispatch('notifications/custom', {
          type: 'error',
          text: i18n.t('NoteRequired').toString(),
          action: 'CLOSE',
          timeout: 5000
        })

      this.newNoteDialog = false
      this.$store
        .dispatch('incidents/addNote', [
          this.newNoteIncident.id,
          this.newNote.trim()
        ])
        .then(() => {
          this.$store.dispatch('notifications/success', 'Note created')
          this.newNote = null
          this.newNoteIncident = null
          this.getIncidents()
        })
    },
    getUsers() {
      if (!this.$store.state.users.users?.length)
        this.$store.dispatch('users/getUsers')
    },
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
    getIncidents() {
      return this.$store.dispatch('incidents/getIncidents')
    },
    getEnvironments() {
      this.$store.dispatch('incidents/getEnvironments')
    },
    setEnv(env) {
      this.$store.dispatch('incidents/setFilter', {
        environment: env === 'ALL' ? null : env
      })
    },
    refreshIncidents() {
      this.getEnvironments()
      this.getIncidents().then(() => {
        if (this.timer) clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.refreshIncidents()
        }, this.refreshInterval)
      })
    },
    addIncident() {
      this.$store
        .dispatch('incidents/createIncident', this.newIncident)
        .then(() => {
          this.addIncidentDialog = false
          this.$store.dispatch('notifications/success', 'Incident created')
          this.newIncident = {
            ownerId: this.$store.getters['auth/getId']
          }
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

<style lang="scss">
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

.gap-2 {
  gap: 0.5rem;
}

.break-normal {
  word-break: normal;
}

.v-input--selection-controls {
  margin: 0;
  padding: 0;
}
</style>
