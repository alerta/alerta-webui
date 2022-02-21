<template>
  <v-card v-if="incident">
    <v-toolbar dense>
      <v-btn icon link :to="{ name: 'incidents' }" exact>
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            :disabled="!isAcked(incident.status) && !isClosed(incident.status)"
            icon
            plain
            @click="takeAction('open')"
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
            plain
            @click="ackIncident()"
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
            plain
            @click="takeAction('unack')"
          >
            <v-icon size="20px">mdi-undo</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('Unack') }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            v-show="!isShelved(incident.status)"
            v-on="on"
            :disabled="!isOpen(incident.status) && !isAcked(incident.status)"
            icon
            plain
            @click="shelveIncident()"
          >
            <v-icon size="20px">mdi-clock-outline</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('Shelve') }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            v-show="isShelved(incident.status)"
            v-on="on"
            icon
            plain
            @click="takeAction('unshelve')"
          >
            <v-icon size="20px">mdi-restore</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('Unshelve') }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            :disabled="isClosed(incident.status)"
            icon
            plain
            @click="takeAction('close')"
          >
            <v-icon size="20px">mdi-close-circle-outline</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('Close') }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            icon
            v-has-perms="'admin:alerts'"
            plain
            @click="deleteIncident(incident.id)"
          >
            <v-icon size="20px">mdi-delete</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('Delete') }}</span>
      </v-tooltip>

      <v-tooltip :key="copyIconText" bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            icon
            plain
            @click="clipboardCopy(JSON.stringify(incident, null, 4))"
          >
            <v-icon size="20px">mdi-clipboard-multiple-outline</v-icon>
          </v-btn>
        </template>
        <span>{{ copyIconText }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-menu v-on="on" bottom left>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" icon plain>
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>

            <v-list subheader>
              <v-subheader>Actions</v-subheader>
              <v-divider />
              <v-list-item
                v-for="(action, i) in actions"
                :key="i"
                @click="takeAction(action)"
              >
                <v-list-item-title>{{ action | splitCaps }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
        <span>{{ $t('More') }}</span>
      </v-tooltip>

      <v-tooltip bottom v-if="creatingNote === false">
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon plain @click="creatingNote = true">
            <v-icon size="20px">mdi-note-plus</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('AddNote') }}</span>
      </v-tooltip>

      <v-tooltip bottom v-else>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon plain @click="creatingNote = false">
            <v-icon size="20px">mdi-note-off</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('Cancel') }}</span>
      </v-tooltip>
    </v-toolbar>

    <v-card-title>{{ incident.title }}</v-card-title>
    <v-card-subtitle class="d-flex gap-2" :style="severityColors">
      <span class="label">
        {{ incident.status | capitalize }}
      </span>
      <span :class="`label severity-${incident.severity.toLowerCase()}`">
        {{ incident.severity | capitalize }}
      </span>
    </v-card-subtitle>

    <v-card-text>
      <v-sheet
        class="px-4 py-2 mb-2"
        :color="$vuetify.theme.dark ? 'grey darken-2' : 'grey lighten-3'"
        rounded
      >
        <pre>{{ incident.note }}</pre>
      </v-sheet>

      <v-textarea
        v-if="creatingNote"
        placeholder="Add a note"
        rows="2"
        auto-grow
        outlined
      />

      <v-combobox
        chips
        clearable
        deletable-chips
        multiple
        small-chips
        label="Tags"
        outlined
        dense
        v-model="incident.tags"
      />
    </v-card-text>

    <alert-list
      :alerts="alerts"
      :columns="['severity', 'status', 'resource', 'service', 'description']"
      @set-alert="openAlert"
    >
      <template v-slot:footer.prepend>
        <v-flex class="pr-4 py-3 items-center">
          <v-btn
            :disabled="!selected.length"
            @click="bulkRemove()"
            color="error"
            small
          >
            <v-icon left>mdi-close-circle-outline</v-icon>
            {{ $t('Remove') }}
          </v-btn>
        </v-flex>
      </template>
    </alert-list>
  </v-card>
  <div v-else-if="incident === undefined">
    <v-progress-circular
      indeterminate
      color="primary"
      size="50"
    ></v-progress-circular>
  </div>
</template>


<script lang="ts">
import { IAlert } from '@/common/interfaces'
import AlertList from '@/components/AlertList.vue'
import i18n from '@/plugins/i18n'
import IncidentsApi from '@/services/api/incident.service'
import { IIncidents } from '@/store/interfaces'
import Vue from 'vue'

export default Vue.extend({
  components: {
    AlertList
  },
  data: () => ({
    copyIconText: i18n.t('Copy'),
    creatingNote: false,
    incident: undefined as IIncidents['incident'] | undefined,
    alerts: [] as IAlert[]
  }),
  mounted() {
    this.getIncident().then(() => {
      this.$store.dispatch('alerts/setPagination', {
        page: 1,
        itemsPerPage: 25,

        itemsPerPageOptions: [],
        totalItems: this.incident?.alerts.length
      })
    })
  },
  computed: {
    id() {
      return this.$route.params.id
    },
    selected() {
      return this.$store.state.alerts.selected
    },
    shelveTimeout() {
      return this.$store.getters.getPreference('shelveTimeout')
    },

    actions() {
      return this.$config.actions
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
    }
  },
  methods: {
    getIncident() {
      return IncidentsApi.getIncident(this.id).then(({ incident }: any) => {
        this.incident = incident
        this.alerts = incident.alerts
      })
    },
    isOpen(status: string) {
      return status === 'open' || status === 'NORM'
    },
    isAcked(status: string) {
      return status === 'ack' || status === 'ACKED'
    },
    isShelved(status: string) {
      return status === 'shelved' || status === 'SHLVD'
    },
    isClosed(status: string) {
      return status === 'closed'
    },
    async takeAction(action: string, ...args: (string | undefined)[]) {
      return this.$store
        .dispatch('incidents/takeAction', [this.id, action, ...args])
        .then(this.getIncident)
    },
    shelveIncident() {
      this.takeAction('shelve', undefined, this.shelveTimeout).then(
        this.getIncident
      )
    },
    deleteIncident() {
      confirm(i18n.t('ConfirmDelete').toString()) &&
        this.$store
          .dispatch('incidents/deleteIncident', this.id)
          .then(() => this.$router.push('/incidents'))
    },
    openAlert({ id }: IAlert) {
      this.$router.push({
        name: 'alert',
        params: { id },
        query: {
          'from-incident': this.id
        }
      })
    },
    addAlerts() {},
    bulkRemove() {
      if (!this.incident || !this.selected.length) return

      const removed = this.selected.map((alert: IAlert) => alert.id)
      // const removed = this.alerts.splice(0, this.selected.length)

      this.alerts.forEach((alert, index) => {
        if (removed.includes(alert.id)) this.alerts.splice(index, 1)
      })

      IncidentsApi.updateIncident(this.id, {
        alerts: this.alerts.map((alert: IAlert) => alert.id)
      })
        .then(() => (this.selected = []))
        .catch(() => {
          this.alerts.push(...this.selected)
        })
    },
    clipboardCopy(text: string) {
      if (!window.isSecureContext || !navigator.clipboard) return
      navigator.clipboard.writeText(text)
      this.copyIconText = i18n.t('Copied')
      setTimeout(() => {
        this.copyIconText = i18n.t('Copy')
      }, 2000)
    }
  }
})
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}

.alert-actions {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 0.75rem;
}
</style>