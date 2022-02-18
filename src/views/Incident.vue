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
            class="btn--plain px-1 mx-0"
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
            class="btn--plain px-1 mx-0"
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
            class="btn--plain px-1 mx-0"
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
            class="btn--plain px-1 mx-0"
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
            class="btn--plain px-1 mx-0"
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
            class="btn--plain px-1 mx-0"
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
            class="btn--plain px-1 mx-0"
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
            class="btn--plain px-1 mx-0"
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
              <v-btn v-on="on" icon class="btn--plain px-1 mx-0">
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
    </v-toolbar>

    <v-card-title>{{ incident.title }}</v-card-title>
    <v-card-subtitle>{{ incident.status }}</v-card-subtitle>
    <span>
      {{ incident }}
    </span>
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
import i18n from '@/plugins/i18n'
import { IIncidents } from '@/store/interfaces'
import Vue from 'vue'

export default Vue.extend({
  data: () => ({
    copyIconText: i18n.t('Copy')
  }),
  mounted() {
    this.getIncident()
  },
  computed: {
    id() {
      return this.$route.params.id
    },
    shelveTimeout() {
      return this.$store.getters.getPreference('shelveTimeout')
    },
    incident(): IIncidents['incident'] | undefined {
      return this.$store.state.incidents.incident || undefined
    },
    actions() {
      return this.$config.actions
    }
  },
  methods: {
    getIncident(): Promise<IIncidents['incident']> {
      return this.$store.dispatch('incidents/getIncident', this.id)
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
    deleteIncident() {},
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