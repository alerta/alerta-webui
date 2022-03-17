<template>
  <v-card>
    <header class="d-flex justify-space-between">
      <v-card-title class="break-normal pb-0 pr-2">
        {{ incident.title }}
      </v-card-title>

      <div class="flex-shrink-0 mt-4 mr-4">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              v-on="on"
              :disabled="!isAcked() && !isClosed()"
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
              v-show="!isAcked()"
              v-on="on"
              :disabled="!isOpen()"
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
              v-show="isAcked()"
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

        <close-incident-confirm :incident="incident" :callback="getIncidents">
          <template v-slot:activator="{ on: dialogAction }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  @click="dialogAction.click"
                  :disabled="isClosed()"
                  icon
                  class="btn--plain px-1 mx-0"
                >
                  <v-icon size="20px">mdi-close-circle-outline</v-icon>
                </v-btn>
              </template>
              <span>{{ $t('Close') }}</span>
            </v-tooltip>
          </template>
        </close-incident-confirm>
      </div>
    </header>
    <v-card-subtitle class="pt-0">
      <div class="d-flex gap-1 align-center">
        <span>{{ incident.alerts.length }} {{ $t('Alerts') }}</span>
        <span class="label">
          {{ incident.status | capitalize }}
        </span>
        <span :class="`label label-${incident.severity.toLowerCase()}`">
          {{ incident.severity | capitalize }}
        </span>
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <span class="mx-1" v-on="on">
              <v-icon small>mdi-clock-outline</v-icon>
              {{ incident.updateTime | timeago }}
            </span>
          </template>
          <span>Last updated {{ parseTimestamp(incident.updateTime) }}</span>
        </v-tooltip>
      </div>
    </v-card-subtitle>
    <v-divider />

    <v-card-text>
      <v-sheet
        v-if="incident.note"
        class="px-4 py-2 mb-2"
        :color="$vuetify.theme.dark ? 'grey darken-2' : 'grey lighten-3'"
        rounded
      >
        <div class="mb-1 d-flex justify-space-between">
          <strong>
            <v-icon small>mdi-account-circle</v-icon>
            {{ incident.note.user }}
          </strong>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <strong v-on="on">
                <v-icon small>mdi-clock-outline</v-icon>
                {{ incident.note.createTime | timeago }}
              </strong>
            </template>
            <span>Created {{ parseTimestamp(incident.note.createTime) }}</span>
          </v-tooltip>
        </div>
        <pre class="note">{{ incident.note.text }}</pre>
      </v-sheet>

      <v-textarea
        v-if="creatingNote"
        v-model="note"
        autofocus
        :rules="[(v) => !!v || $t('NoteRequired')]"
        placeholder="Add a note"
        rows="2"
        auto-grow
        outlined
      />
    </v-card-text>
    <v-card-actions class="px-4 gap-2">
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
        @click="creatingNote = true"
        v-if="!creatingNote"
      >
        <v-icon left>mdi-note-plus</v-icon>
        {{ $t('AddNote') }}
      </v-btn>
      <template v-else-if="creatingNote">
        <v-btn @click="creatingNote = false" color="error">Cancel</v-btn>
        <v-btn @click="addNote" color="success">Create</v-btn>
      </template>
      <v-btn
        color="primary"
        link
        :to="{ name: 'incident', params: { id: incident.id } }"
        :disabled="creatingNote"
      >
        Details
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { IIncidents } from '@/store/interfaces'
import CloseIncidentConfirm from '@/components/CloseIncidentConfirm.vue'
import Vue, { PropType } from 'vue'
import { DateTime } from 'luxon'
import { debounce } from 'lodash'
import { i18n } from '@/plugins'

export default Vue.extend({
  props: {
    incident: {
      type: Object as PropType<IIncidents['incident']>,
      required: true
    }
  },
  components: {
    CloseIncidentConfirm
  },
  data: () => ({
    creatingNote: false,
    note: null
  }),
  computed: {
    ackTimeout() {
      return this.$store.getters.getPreference('ackTimeout')
    }
  },
  methods: {
    parseTimestamp(val: string) {
      return DateTime.fromISO(val).toLocaleString(DateTime.DATETIME_FULL)
    },
    getIncidents() {
      this.$emit('getIncidents')
    },
    isOpen() {
      return this.incident?.status == 'open' || this.incident?.status == 'NORM'
    },
    isAcked() {
      return this.incident?.status == 'ack' || this.incident?.status == 'ACKED'
    },
    isShelved() {
      return (
        this.incident?.status == 'shelved' || this.incident?.status == 'SHLVD'
      )
    },
    isClosed() {
      return this.incident?.status == 'closed'
    },
    takeAction: debounce(
      function (action: string, text?: string) {
        // @ts-ignore
        this.$store
          // @ts-ignore
          .dispatch('incidents/takeAction', [this.incident.id, action, text])
          // @ts-ignore
          .then(this.getIncidents)
      },
      200,
      { leading: true, trailing: false }
    ),
    ackIncident() {
      this.$store
        .dispatch('incidents/takeAction', [
          this.incident?.id,
          'ack',
          null,
          this.ackTimeout
        ])
        .then(this.getIncidents)
    },
    addNote() {
      if (!this.note)
        return this.$store.dispatch('notifications/custom', {
          type: 'error',
          text: i18n.t('NoteRequired').toString(),
          action: 'CLOSE',
          timeout: 5000
        })
      this.$store
        .dispatch('incidents/addNote', [this.incident?.id, this.note])
        .then(() => {
          this.$store.dispatch('notifications/success', 'Note created')
          this.note = null
          this.creatingNote = false
          this.getIncidents()
        })
    }
  }
})
</script>