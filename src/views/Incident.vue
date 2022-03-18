<template>
  <v-card v-if="incident">
    <v-toolbar dense>
      <v-btn
        icon
        link
        :to="{ name: $route.query['from-alerts'] ? 'alerts' : 'incidents' }"
        exact
      >
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
            @click="ackIncident(id)"
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

      <close-incident-confirm :incident="incident" :callback="getIncident">
        <template v-slot:activator="{ on: dialogAction }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                @click="dialogAction.click"
                :disabled="isClosed(incident.status)"
                icon
                plain
              >
                <v-icon size="20px">mdi-close-circle-outline</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('Close') }}</span>
          </v-tooltip>
        </template>
      </close-incident-confirm>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            icon
            v-has-perms="'write:alerts'"
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

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            v-if="creatingNote"
            v-on="on"
            icon
            plain
            @click="creatingNote = false"
          >
            <v-icon size="20px">mdi-note-off</v-icon>
          </v-btn>
          <v-btn v-else v-on="on" icon plain @click="creatingNote = true">
            <v-icon size="20px">mdi-note-plus</v-icon>
          </v-btn>
        </template>
        <span v-if="creatingNote">{{ $t('Cancel') }}</span>
        <span v-else>{{ $t('AddNote') }}</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            icon
            plain
            @click="reassign"
            v-has-perms="'write:alerts'"
          >
            <v-icon size="20px">mdi-account-box</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('Reassign') }}</span>
      </v-tooltip>

      <v-btn @click="toggleUpdating" outlined small>
        <template v-if="updating">
          <v-icon size="20px" left>mdi-cancel</v-icon>
          {{ $t('Cancel') }}
        </template>
        <template v-else>
          <v-icon size="20px" left>mdi-pencil</v-icon>
          Edit
        </template>
      </v-btn>
    </v-toolbar>

    <v-dialog v-model="assignDialog" max-width="500">
      <v-card>
        <v-card-title>{{ $t('Reassign') }}</v-card-title>
        <v-card-subtitle>
          Currently assigned to: {{ incident.owner.name }}
        </v-card-subtitle>

        <v-form @submit.prevent="reassign" v-model="formValidity">
          <v-card-text>
            <v-autocomplete
              item-text="name"
              item-value="id"
              :items="users"
              label="User"
              outlined
              :loading="$store.state.users.isLoading"
              v-model="incident.owner_id"
              :rules="[(v) => !!v || 'User is required']"
            />
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" type="submit" :disabled="!formValidity">
              Assign
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-alert
      v-for="note in notes"
      :key="note.id"
      :value="true"
      dismissible
      type="info"
      class="ma-1"
      dense
      @input="deleteNote(id, note.id)"
    >
      <strong>{{ note.user || 'Anonymous' }}</strong>
      {{ $t('addedNoteOn') }}
      <span v-if="note.updateTime" class="caption">
        <strong>
          <format-date :value="note.updateTime" format="mediumDate" />
        </strong>
        ({{ note.updateTime | timeago }})<br />
      </span>
      <span v-else class="caption">
        <strong>
          <format-date :value="note.createTime" format="mediumDate" />
        </strong>
        ({{ note.createTime | timeago }})<br />
      </span>
      <pre class="note body-1">{{ note.text }}</pre>
    </v-alert>

    <v-card-title class="d-flex items-center justify-space-between">
      <template v-if="!updating">
        <span>
          {{ incident.title }}
        </span>
        <div>
          <span class="subtitle-1 mr-2">{{ incident.owner.name }}</span>
          <v-avatar size="30">
            <img
              v-if="incident.owner.avatar"
              :src="incident.owner.avatar"
              @error="error = true"
            />
            <v-icon v-else size="28" color="grey lighten-2">
              mdi-account-circle
            </v-icon>
          </v-avatar>
        </div>
      </template>
      <v-text-field
        class="mb-2"
        autofocus
        dense
        hide-details
        v-else
        outlined
        v-model="incident.title"
      />
    </v-card-title>
    <v-card-subtitle class="d-flex gap-2" :style="severityColors">
      <span class="label">
        {{ incident.status | capitalize }}
      </span>

      <span :class="`label label-${incident.severity.toLowerCase()}`">
        {{ incident.severity | capitalize }}
      </span>
    </v-card-subtitle>

    <v-card-text>
      <v-select
        v-if="updating"
        v-model="incident.severity"
        :items="severities"
        dense
        outlined
        label="Severity"
      />

      <v-textarea
        v-if="creatingNote"
        placeholder="Add a note"
        rows="2"
        auto-grow
        outlined
        append-outer-icon="mdi-plus-circle"
        v-model="newNote"
        @click:append-outer="addNote"
        autofocus
        :rules="[(v) => !!v || $t('NoteRequired')]"
      />

      <div class="d-flex flex-column pb-3">
        <div>
          <strong>Created at:</strong>
          <format-date :value="incident.createTime" format="mediumDate" />
        </div>
        <div>
          <strong>Updated at:</strong>
          <format-date :value="incident.updateTime" format="mediumDate" />
        </div>
        <div>
          <strong>Duration since update:</strong>
          <span class="px-1">{{ incident.updateTime | hhmmss }}</span>
        </div>
      </div>

      <v-combobox
        chips
        :clearable="updating"
        deletable-chips
        multiple
        small-chips
        label="Tags"
        outlined
        dense
        v-model="incident.tags"
        append-icon=""
        :readonly="!updating"
        hide-details="auto"
        hint="Edit incident to change tags"
      />
    </v-card-text>
    <v-divider />
    <v-card-actions class="justify-end">
      <v-btn color="primary" @click="handleSave" v-if="updating">
        <v-icon left>mdi-content-save</v-icon>
        Save
      </v-btn>
    </v-card-actions>

    <alert-list :alerts="alerts" :columns="alertColumns" @set-alert="openAlert">
      <template v-slot:[`footer.prepend`]>
        <v-flex class="pr-4 py-3 align-center">
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                :disabled="!selected.length"
                @click="bulkRemove()"
                color="error"
                small
              >
                <v-icon left>mdi-close-circle-outline</v-icon>
                {{ $t('Remove') }}
              </v-btn>
            </template>
            <span>Remove alerts from incident</span>
          </v-tooltip>
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
import { IAlert, IIncident } from '@/common/interfaces'
import AlertList from '@/components/AlertList.vue'
import CloseIncidentConfirm from '@/components/CloseIncidentConfirm.vue'
import FormatDate from '@/components/lib/DateTime.vue'
import i18n from '@/plugins/i18n'
import { IIncidents } from '@/store/interfaces'
import { cloneDeep, omit, pickBy } from 'lodash'
import Vue from 'vue'

export default Vue.extend({
  components: {
    AlertList,
    FormatDate,
    CloseIncidentConfirm
  },
  data: () => ({
    copyIconText: i18n.t('Copy'),
    creatingNote: false,
    incident: undefined as Omit<IIncident, 'alerts'> | undefined,
    alerts: [] as IAlert[],
    newNote: '',
    notes: [] as IIncidents['notes'],
    updating: false,
    assignDialog: false,
    severities: [
      'security',
      'critical',
      'major',
      'minor',
      'warning',
      'informational',
      'debug',
      'trace',
      'indeterminate',
      'cleared',
      'normal',
      'ok',
      'unknown'
    ],
    formValidity: true,
    interval: null as number | null
  }),
  mounted() {
    this.getIncident()
      .then(() => {
        this.$store.dispatch('alerts/setPagination', {
          page: 1,
          totalItems: this.alerts.length
        })
      })
      .then(() => {
        this.$store
          .dispatch('incidents/getNotes', this.incident?.id)
          .then((notes) => (this.notes = notes))
      })
  },
  destroyed() {
    this.interval && clearInterval(this.interval)
  },
  computed: {
    id() {
      return this.$route.params.id
    },
    selected: {
      get() {
        return this.$store.state.alerts.selected
      },
      set(value: IAlert[]) {
        this.$store.dispatch('alerts/updateSelected', value)
      }
    },
    alertColumns() {
      // @ts-ignore
      return this.$config.columns
    },
    shelveTimeout() {
      return this.$store.getters.getPreference('shelveTimeout')
    },

    users() {
      return this.$store.state.users.users
    },

    actions() {
      // @ts-ignore
      return this.$config.actions
    },
    ackTimeout() {
      return this.$store.getters.getPreference('ackTimeout')
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
      return this.$store.dispatch('incidents/getIncident', this.id).then(() => {
        this.incident = omit(
          cloneDeep<IIncident>(this.$store.state.incidents.incident),
          ['alerts']
        )
        this.alerts = cloneDeep(this.$store.state.incidents.incident.alerts)
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
    reassign() {
      if (this.assignDialog) {
        if (!this.formValidity) return
        this.handleSave()
        this.$store.dispatch('notifications/success', 'Reassigned')
      }

      this.assignDialog = !this.assignDialog
      if (this.assignDialog) return this.$store.dispatch('users/getUsers')
    },
    ackIncident(id: string, text: string) {
      this.$store
        .dispatch('incidents/takeAction', [id, 'ack', text, this.ackTimeout])
        .then(() => this.getIncident())
    },
    shelveIncident() {
      this.takeAction('shelve', undefined, this.shelveTimeout).then(
        this.getIncident
      )
    },
    deleteNote(id: string, noteId: string) {
      this.$store.dispatch('incidents/deleteNote', [id, noteId])
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
    toggleUpdating() {
      if (!this.updating) {
        this.updating = true
        return
      }
      this.updating = false
      this.incident = omit(
        cloneDeep<IIncident>(this.$store.state.incidents.incident),
        ['alerts']
      )
    },
    handleSave() {
      if (!this.incident) return

      const incident: Partial<IIncident> = this.incident

      this.$store
        .dispatch('incidents/updateIncident', {
          id: this.incident.id,
          ...pickBy(incident, (v) => v !== undefined)
        })
        .then(({ incident }) => {
          this.updating = false

          this.$store.dispatch('incidents/set', ['incident', incident])
          this.incident = cloneDeep(incident)
        })
    },
    bulkRemove() {
      if (!this.incident || !this.selected.length) return

      const removed = this.selected.map((alert: IAlert) => alert.id)

      this.alerts.forEach((alert, index) => {
        if (removed.includes(alert.id)) this.alerts.splice(index, 1)
      })

      this.$store
        .dispatch('incidents/updateIncident', {
          id: this.incident.id,
          alerts: this.alerts.map((alert: IAlert) => alert.id)
        })
        .then(() => {
          this.selected = []
          this.$store.dispatch(
            'notifications/success',
            `Removed ${removed.length} alert${removed.length > 1 ? 's' : ''}`
          )
        })
        .catch(() => this.alerts.push(...this.selected))
    },
    addNote() {
      if (!this.newNote)
        return this.$store.dispatch('notifications/custom', {
          type: 'error',
          text: i18n.t('NoteRequired').toString(),
          action: 'CLOSE',
          timeout: 5000
        })
      this.$store
        .dispatch('incidents/addNote', [this.id, this.newNote])
        .then(() => {
          this.$store.dispatch('notifications/success', 'Note created')
          this.newNote = ''
          this.creatingNote = false
          this.getIncident()
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

.gap-4 {
  gap: 1rem;
}

.note {
  white-space: pre-wrap;
  white-space: -moz-pre-wrap;
  white-space: -pre-wrap;
  white-space: -o-pre-wrap;
  word-wrap: break-word;
}
</style>
