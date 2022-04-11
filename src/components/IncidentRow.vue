<template>
  <v-sheet class="incident-row" :color="color" tabindex="0" @click="open">
    <span class="label">{{ incident.status | capitalize }}</span>
    <span :class="`label label-${incident.severity.toLowerCase()}`">
      {{ incident.severity | capitalize }}
    </span>
    <!-- <div class="d-flex gap-2">
    </div> -->
    <date-format
      v-if="incident.lastReceiveTime"
      :value="incident.lastReceiveTime"
    />
    <span v-else class="grey--text">No alerts</span>
    <span>{{ incident.createTime | hhmmss }}</span>
    <span>{{ incident.updateTime | timeago }}</span>
    <span>{{ incident.title }}</span>
    <span>
      {{ $tc('AlertsCnt', incident.alerts.length) }}
    </span>
    <div class="d-flex align-center">
      <v-avatar size="30" class="mr-1">
        <img
          v-if="incident.owner.avatar"
          :src="incident.owner.avatar"
          @error="error = true"
        />
        <v-icon v-else size="28" color="grey lighten-2">
          mdi-account-circle
        </v-icon>
      </v-avatar>

      {{ incident.owner.name }}
    </div>

    <div class="actions" @click.stop>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            :disabled="!isAcked() && !isClosed()"
            icon
            plain
            @click.stop="takeAction('open')"
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
            @click.stop="ackIncident()"
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
            @click.stop="takeAction('unack')"
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
                plain
                class="px-1 mx-0"
              >
                <v-icon size="20px">mdi-close-circle-outline</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('Close') }}</span>
          </v-tooltip>
        </template>
      </close-incident-confirm>
    </div>

    <div class="note flex-grow-1">
      <div class="d-flex" v-if="incident.note">
        <span>{{ incident.note.user }}:</span>

        <span class="text-left">
          {{ incident.note.text.trim() }}
        </span>

        <span class="grey--text">
          ({{ incident.note.createTime | timeago }})
        </span>
      </div>
      <div v-else></div>
      <v-btn icon plain elevation="1" small @click.stop="$emit('createNote')">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </div>
    <div class="tags flex-grow-1">
      Tags:

      <v-chip small v-for="tag in incident.tags" :key="tag">
        {{ tag }}
      </v-chip>
    </div>
  </v-sheet>
</template>

<script lang="ts">
import { IIncidents } from '@/store/interfaces'
import CloseIncidentConfirm from '@/components/CloseIncidentConfirm.vue'
import DateFormat from '@/components/lib/DateTime.vue'
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
    CloseIncidentConfirm,
    DateFormat
  },
  data: () => ({
    creatingNote: false,
    note: null as string | null
  }),
  computed: {
    ackTimeout() {
      return this.$store.getters.getPreference('ackTimeout')
    },
    color() {
      return `grey ${this.$vuetify.theme.dark ? 'darken-3' : 'lighten-3'}`
    }
  },
  methods: {
    open() {
      if (!this.incident) return
      this.$router.push({
        name: 'incident',
        params: { id: this.incident.id }
      })
    },
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
        .dispatch('incidents/addNote', [this.incident?.id, this.note.trim()])
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

<style lang="scss">
.incident-row {
  width: 100%;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: outline 0.2s ease-in-out;
  outline-color: transparent;
  cursor: pointer;

  display: grid;
  grid-template-columns: 1fr 1fr 3fr 2fr 3fr 5fr 1fr 1.5fr 2fr;
  align-items: center;

  gap: 0.5rem;

  &:focus {
    outline: 2px solid var(--v-primary-base);
  }

  .label {
    width: max-content;
  }
}

.text-left {
  text-align: left;
}

.gap-2 {
  gap: 0.5rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  grid-row-end: span 2;
  cursor: default;
}

.note {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  grid-column-end: span 4;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  grid-column-end: span 3;
}
</style>