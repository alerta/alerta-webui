<template>
  <div class="incident-container">
    <v-data-table-header
      class="incident-header"
      :headers="headers"
      :options="pagination"
      sort-icon="mdi-chevron-down"
      @sort="handleSort"
    />
    <v-data-iterator
      :options.sync="pagination"
      :server-items-length="pagination.totalItems"
      :items="incidents"
      disable-sort
      :footer-props="{
        showCurrentPage: true,
        ...pagination
      }"
      class="d-flex flex-column gap-2"
    >
      <template v-slot:default="{ items }">
        <v-sheet
          v-for="incident in items"
          :key="incident.id"
          class="incident-row"
          :color="rowColour"
          tabindex="0"
          @click="open(incident.id)"
        >
          <span class="label">{{ incident.status | capitalize }}</span>
          <span :class="`label label-${incident.severity.toLowerCase()}`">
            {{ incident.severity | capitalize }}
          </span>
          <date-format
            v-if="incident.lastReceiveTime"
            :value="incident.lastReceiveTime"
            class="w-max"
          />
          <span v-else class="grey--text">No alerts</span>
          <span>{{ incident.createTime | hhmmss }}</span>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <span v-on="on" class="w-max">
                {{ incident.updateTime | timeago }}
              </span>
            </template>
            <span>{{ incident.updateTime | date }}</span>
          </v-tooltip>
          <span>{{ incident.title }}</span>
          <span class="ellipsize">
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
                  :disabled="
                    !isAcked(incident.status) && !isClosed(incident.status)
                  "
                  icon
                  plain
                  @click.stop="takeAction(incident.id, 'open')"
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
                  @click.stop="ackIncident(incident.id)"
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
                  @click.stop="takeAction(incident.id, 'unack')"
                >
                  <v-icon size="20px">mdi-undo</v-icon>
                </v-btn>
              </template>
              <span>{{ $t('Unack') }}</span>
            </v-tooltip>

            <close-incident-confirm
              :incident="incident"
              :callback="getIncidents"
            >
              <template v-slot:activator="{ on: dialogAction }">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      @click="dialogAction.click"
                      :disabled="isClosed(incident.status)"
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
            <div class="d-flex gap-2" v-if="incident.note">
              <span>{{ incident.note.user }}:</span>

              <span class="text-left">
                {{ incident.note.text.trim() }}
              </span>

              <span class="grey--text">
                ({{ incident.note.createTime | timeago('narrow') }})
              </span>
            </div>
            <div v-else></div>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  @on="on"
                  icon
                  plain
                  elevation="1"
                  small
                  @click.stop="$emit('createNote', incident)"
                >
                  <v-icon small>mdi-note-plus</v-icon>
                </v-btn>
              </template>
              <span>Add Note</span>
            </v-tooltip>
          </div>
          <div class="tags flex-grow-1">
            Tags:

            <v-chip small v-for="tag in incident.tags" :key="tag">
              {{ tag }}
            </v-chip>
          </div>
        </v-sheet>
      </template>
    </v-data-iterator>
  </div>
</template>

<script lang="ts">
import { IIncidents } from '@/store/interfaces'
import CloseIncidentConfirm from '@/components/CloseIncidentConfirm.vue'
import DateFormat from '@/components/lib/DateTime.vue'
import { debounce } from 'lodash'
import Vue, { PropType } from 'vue'
import { DataTableHeader } from 'vuetify'

export default Vue.extend({
  props: {
    incidents: [] as PropType<IIncidents['incidents']>
  },
  components: {
    CloseIncidentConfirm,
    DateFormat
  },
  data() {
    return {
      rowColour: `grey ${this.$vuetify.theme.dark ? 'darken-3' : 'lighten-3'}`,
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
          value: 'lastReceiveTime',
          sortable: true
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
          sortable: false,
          align: 'center'
        }
      ] as DataTableHeader[]
    }
  },
  computed: {
    users() {
      return this.$store.state.users.users
    },
    pagination: {
      get() {
        return this.$store.state.incidents.pagination
      },
      set(value) {
        this.$store.dispatch('incidents/setPagination', value)
      }
    },
    ackTimeout() {
      return this.$store.getters.getPreference('ackTimeout')
    }
  },
  methods: {
    handleSort(val: string) {
      if (this.pagination.sortBy.includes(val)) {
        this.pagination = {
          ...this.pagination,
          sortDesc: [!this.pagination.sortDesc[0]]
        }
      } else {
        this.pagination = {
          ...this.pagination,
          sortBy: [val],
          sortDesc: [true]
        }
      }
    },
    getIncidents() {
      this.$emit('getIncidents')
    },
    getUsers() {
      if (!this.$store.state.users.users?.length)
        this.$store.dispatch('users/getUsers')
    },
    open(id: string) {
      this.$router.push({ name: 'incident', params: { id } })
    },
    isOpen(status: string) {
      return status == 'open' || status == 'NORM'
    },
    isAcked(status: string) {
      return status == 'ack' || status == 'ACKED'
    },
    isShelved(status: string) {
      return status == 'shelved' || status == 'SHLVD'
    },
    isClosed(status: string) {
      return status == 'closed'
    },
    takeAction: debounce(
      function (id: string, action: string, text?: string) {
        // @ts-ignore
        this.$store
          // @ts-ignore
          .dispatch('incidents/takeAction', [id, action, text])
          // @ts-ignore
          .then(this.getIncidents)
      },
      200,
      { leading: true, trailing: false }
    ),
    ackIncident(id: string) {
      this.$store
        .dispatch('incidents/takeAction', [id, 'ack', null, this.ackTimeout])
        .then(this.getIncidents)
    },
    getEnvironments() {
      this.$store.dispatch('incidents/getEnvironments')
    },
    setEnv(env: string) {
      this.$store.dispatch('incidents/setFilter', {
        environment: env === 'ALL' ? null : env
      })
    }
  }
})
</script>

<style lang="scss">
.incident-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.incident-row,
.incident-header > tr {
  display: grid;
  align-items: center;

  grid-template-columns: 0.75fr 0.75fr 2fr 1.25fr 1.75fr max(36rem, 35vw) 1fr 1.5fr 2fr;
  gap: 0.5rem;
  padding-inline: 1rem;
}

.w-max {
  width: max-content;
}

.incident-row {
  width: 100%;
  padding-block: 0.5rem;
  border-radius: 0.5rem;
  transition: outline 0.2s ease-in-out;
  outline-color: transparent;

  cursor: pointer;

  &:focus {
    outline: 2px solid var(--v-primary-base);
  }

  .label {
    width: max-content;
  }
}

.ellipsize {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-left {
  text-align: left;
}

.gap-2 {
  gap: 0.5rem;
}

.actions {
  display: flex;
  align-items: center;
  justify-content: center;

  flex-wrap: wrap;
  grid-row-end: span 2;
  cursor: default;
}

.note {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  grid-column-end: span 5;
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