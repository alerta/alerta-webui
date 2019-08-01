<template>
  <v-card
    flat
  >
    <v-card
      tile
      flat
    >
      <v-toolbar
        :color="isDark ? '#616161' : '#eeeeee'"
        dense
      >
        <v-btn
          icon
          @click="dialog = false"
        >
          <v-icon>arrow_back</v-icon>
        </v-btn>

        <v-tooltip bottom>
          <v-btn
            slot="activator"
            :disabled="!isAcked(item.status) && !isClosed(item.status)"
            icon
            class="btn--plain px-1 mx-0"
            @click="takeAction(item.id, 'open')"
          >
            <v-icon
              size="20px"
            >
              refresh
            </v-icon>
          </v-btn>
          <span>Open</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            v-show="!isWatched(item.tags)"
            slot="activator"
            icon
            class="btn--plain px-1 mx-0"
            @click="watchAlert(item.id)"
          >
            <v-icon
              size="20px"
            >
              visibility
            </v-icon>
          </v-btn>
          <span>Watch</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            v-show="isWatched(item.tags)"
            slot="activator"
            icon
            class="btn--plain px-1 mx-0"
            @click="unwatchAlert(item.id)"
          >
            <v-icon
              size="20px"
            >
              visibility_off
            </v-icon>
          </v-btn>
          <span>Unwatch</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            v-show="!isAcked(item.status)"
            slot="activator"
            :disabled="!isOpen(item.status)"
            icon
            class="btn--plain px-1 mx-0"
            @click="takeAction(item.id, 'ack')"
          >
            <v-icon
              size="20px"
            >
              check
            </v-icon>
          </v-btn>
          <span>Ack</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            v-show="isAcked(item.status)"
            slot="activator"
            icon
            class="btn--plain px-1 mx-0"
            @click="takeAction(item.id, 'unack')"
          >
            <v-icon
              size="20px"
            >
              undo
            </v-icon>
          </v-btn>
          <span>Unack</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            v-show="!isShelved(item.status)"
            slot="activator"
            :disabled="!isOpen(item.status) && !isAcked(item.status)"
            icon
            class="btn--plain px-1 mx-0"
            @click="shelveAlert(item.id)"
          >
            <v-icon
              size="20px"
            >
              schedule
            </v-icon>
          </v-btn>
          <span>Shelve</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            v-show="isShelved(item.status)"
            slot="activator"
            icon
            class="btn--plain px-1 mx-0"
            @click="takeAction(item.id, 'unshelve')"
          >
            <v-icon
              size="20px"
            >
              restore
            </v-icon>
          </v-btn>
          <span>Unshelve</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            slot="activator"
            :disabled="isClosed(item.status)"
            icon
            class="btn--plain px-1 mx-0"
            @click="takeAction(item.id, 'close')"
          >
            <v-icon
              size="20px"
            >
              highlight_off
            </v-icon>
          </v-btn>
          <span>Close</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            slot="activator"
            icon
            class="btn--plain px-1 mx-0"
            @click="deleteAlert(item.id)"
          >
            <v-icon
              size="20px"
            >
              delete
            </v-icon>
          </v-btn>
          <span>Delete</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-menu
            slot="activator"
            bottom
            left
          >
            <v-btn
              slot="activator"
              icon
              class="btn--plain px-1 mx-0"
            >
              <v-icon>
                more_vert
              </v-icon>
            </v-btn>

            <v-list
              subheader
            >
              <v-subheader>Actions</v-subheader>
              <v-divider />
              <v-list-tile
                v-for="(action, i) in actions"
                :key="i"
                @click="takeAction(item.id, action)"
              >
                <v-list-tile-title>{{ action | splitCaps }}</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
          <span>More</span>
        </v-tooltip>
      </v-toolbar>

      <v-card
        flat
      >
        <v-tabs
          v-model="active"
          grow
        >
          <v-tab ripple>
            Details
          </v-tab>
          <v-tab-item
            :transition="false"
            :reverse-transition="false"
          >
            <v-card
              flat
            >
              <v-alert
                v-if="lastNote && lastNote.text"
                :value="lastNote"
                type="info"
                class="ma-1"
              >
                <b>Last Note</b> by <b>{{ lastNote.user || 'Anonymous' }}</b> ({{ lastNote.updateTime | timeago }})<br>
                {{ lastNote.text }}
              </v-alert>
              <v-card-text>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        Alert ID
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        {{ item.id }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        Last Receive Alert ID
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        {{ item.lastReceiveId }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        Create Time
                      </div>
                    </div>
                    <div class="flex xs9 text-xs-left">
                      <div>
                        <date-time
                          v-if="item.createTime"
                          :value="item.createTime"
                          format="longDate"
                        />
                        ({{ item.createTime | timeago }})
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        Receive Time
                      </div>
                    </div>
                    <div class="flex xs9 text-xs-left">
                      <div>
                        <date-time
                          v-if="item.receiveTime"
                          :value="item.receiveTime"
                          format="longDate"
                        />
                        ({{ item.receiveTime | timeago }})
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        Last Receive Time
                      </div>
                    </div>
                    <div class="flex xs9 text-xs-left">
                      <div>
                        <date-time
                          v-if="item.lastReceiveTime"
                          :value="item.lastReceiveTime"
                          format="longDate"
                        />
                        ({{ item.lastReceiveTime | timeago }})
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-if="$config.customer_views"
                  class="flex xs12 ma-1"
                >
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        Customer
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        {{ item.customer }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        Service
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div
                        v-if="item.service"
                      >
                        {{ item.service.join(', ') }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        Environment
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        {{ item.environment }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        Resource
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        {{ item.resource }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        Event
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        {{ item.event }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        Correlate
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        {{ item.correlate && item.correlate.join(', ') }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        Group
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        {{ item.group }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        Severity
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        <span :class="['label', 'label-' + item.previousSeverity]">
                          {{ item.previousSeverity | capitalize }}
                        </span>&nbsp;&rarr;&nbsp;
                        <span :class="['label', 'label-' + item.severity]">
                          {{ item.severity | capitalize }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        Status
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        <span class="label">
                          {{ item.status | capitalize }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        Value
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        {{ item.value }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        Text
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        <span v-html="item.text" />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        Trend Indication
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        <span class="label">
                          {{ item.trendIndication | splitCaps }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        Timeout
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        {{ item.timeout }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        Type
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        <span class="label">
                          {{ item.type | splitCaps }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        Duplicate Count
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        {{ item.duplicateCount }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        Repeat
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        <span class="label">
                          {{ item.repeat | capitalize }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        Origin
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        {{ item.origin }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        Tags
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        <v-chip
                          v-for="tag in item.tags"
                          :key="tag"
                          label
                          small
                        >
                          <v-icon left>
                            label
                          </v-icon>{{ tag }}
                        </v-chip>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-for="(value, attr) in item.attributes"
                  :key="attr"
                  class="flex xs12 ma-1"
                >
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ attr | splitCaps }}
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div
                        v-html="value"
                      />
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-tab-item>

          <v-tab ripple>
            History
          </v-tab>
          <v-tab-item
            :transition="false"
            :reverse-transition="false"
          >
            <div class="tab-item-wrapper">
              <v-data-table
                :headers="headersByScreenSize"
                :items="history"
                item-key="index"
                :pagination.sync="pagination"
              >
                <template
                  slot="items"
                  slot-scope="props"
                >
                  <td class="hidden-sm-and-down">
                    {{ props.item.id | shortId }}
                  </td>
                  <td
                    class="hidden-sm-and-down text-no-wrap"
                  >
                    <date-time
                      :value="props.item.updateTime"
                      format="mediumDate"
                    />
                  </td>
                  <td
                    class="hidden-md-and-up text-no-wrap"
                  >
                    <date-time
                      :value="props.item.updateTime"
                      format="shortTime"
                    />
                  </td>
                  <td class="hidden-sm-and-down">
                    <span :class="['label', 'label-' + props.item.severity]">
                      {{ props.item.severity | capitalize }}
                    </span>
                  </td>
                  <td class="hidden-sm-and-down">
                    <span class="label">
                      {{ props.item.status | capitalize }}
                    </span>
                  </td>
                  <td>
                    <span class="label">
                      {{ props.item.type || 'unknown' | splitCaps }}
                    </span>
                  </td>
                  <td class="hidden-sm-and-down">
                    {{ props.item.event }}
                  </td>
                  <td class="hidden-sm-and-down">
                    {{ props.item.value }}
                  </td>
                  <td>
                    {{ props.item.user }}
                  </td>
                  <td>
                    {{ props.item.text }}
                  </td>
                </template>
              </v-data-table>
            </div>
          </v-tab-item>

          <v-tab ripple>
            Data
          </v-tab>
          <v-tab-item
            :transition="false"
            :reverse-transition="false"
          >
            <v-card
              :color="isDark ? 'grey darken-1' : 'grey lighten-3'"
              class="mx-1"
              style="overflow-x: auto;"
              flat
            >
              <v-card-text>
                <pre>{{ item.rawData || 'no raw data' }}</pre>
              </v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs>
      </v-card>

      <alert-actions
        v-if="item.id"
        :id="item.id"
        :status="item.status"
        :is-watched="isWatched(item.tags)"
        @take-action="takeAction"
        @shelve-alert="shelveAlert"
        @watch-alert="watchAlert"
        @unwatch-alert="unwatchAlert"
        @add-note="addNote"
        @delete-alert="deleteAlert"
      />
    </v-card>
  </v-card>
</template>

<script>
import debounce from 'lodash/debounce'
import DateTime from './lib/DateTime'
import AlertActions from '@/components/AlertActions'

export default {
  components: {
    DateTime,
    AlertActions
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data: () => ({
    dialog: true,
    sheet: false,
    active: null,
    pagination: {
      rowsPerPage: 10,
      sortBy: 'updateTime'
    },
    headers: [
      { text: 'Alert ID', value: 'id', hide: 'smAndDown' },
      { text: 'Update Time', value: 'updateTime', hide: 'smAndDown' },
      { text: 'Updated', value: 'updateTime', hide: 'mdAndUp' },
      { text: 'Severity', value: 'severity', hide: 'smAndDown' },
      { text: 'Status', value: 'status', hide: 'smAndDown' },
      { text: 'Type', value: 'type' },
      { text: 'Event', value: 'event', hide: 'smAndDown' },
      { text: 'Value', value: 'value', hide: 'smAndDown' },
      { text: 'User', value: 'user' },
      { text: 'Text', value: 'text' }
    ]
  }),
  computed: {
    isDark() {
      return this.$store.getters.getPreference('isDark')
    },
    item() {
      return this.$store.state.alerts.alert
    },
    actions() {
      return this.$config.actions
    },
    history() {
      return this.item.history
        ? this.item.history.map((h, index) => ({ index: index, ...h }))
        : []
    },
    lastNote() {
      return this.history.filter(h => h.type == 'note').pop()
    },
    headersByScreenSize() {
      return this.headers.filter(
        h => !h.hide || !this.$vuetify.breakpoint[h.hide]
      )
    },
    shelveTimeout() {
      return this.$store.getters.getPreference('shelveTimeout')
    },
    username() {
      return this.$store.getters['auth/getUsername']
    },
    refresh() {
      return this.$store.state.refresh
    }
  },
  watch: {
    dialog(val) {
      val || this.close()
    },
    refresh(val) {
      val || this.getAlert(this.id)
    }
  },
  created() {
    this.getAlert(this.id)
  },
  methods: {
    getAlert() {
      this.$store.dispatch('alerts/getAlert', this.id)
    },
    isOpen(status) {
      return status == 'open' || status == 'NORM'
    },
    isWatched(tags) {
      const tag = `watch:${this.username}`
      return tags ? tags.indexOf(tag) > -1 : false
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
    takeAction: debounce(function(id, action, text) {
      text = text || `${action} by ${this.username}`
      this.$store
        .dispatch('alerts/takeAction', [id, action, text])
        .then(() => this.getAlert(this.id))
    }, 200, {leading: true, trailing: false}),
    shelveAlert: debounce(function(id, text) {
      text = text || `shelved by ${this.username}`
      this.$store
        .dispatch('alerts/takeAction', [id, 'shelve', text, this.shelveTimeout])
        .then(() => this.getAlert(this.id))
    }, 200, {leading: true, trailing: false}),
    watchAlert: debounce(function(id) {
      this.$store
        .dispatch('alerts/watchAlert', id)
        .then(() => this.getAlert(this.id))
    }, 200, {leading: true, trailing: false}),
    unwatchAlert: debounce(function(id) {
      this.$store
        .dispatch('alerts/unwatchAlert', id)
        .then(() => this.getAlert(this.id))
    }, 200, {leading: true, trailing: false}),
    addNote: debounce(function(id, text) {
      this.$store
        .dispatch('alerts/addNote', [id, text])
        .then(() => {
          this.getAlert(this.id)
        })
    }, 200, {leading: true, trailing: false}),
    deleteAlert: debounce(function(id) {
      confirm('Are you sure you want to delete this item?') &&
        this.$store.dispatch('alerts/deleteAlert', id)
          .then(() => this.$router.push({ name: 'alerts' }))
    }, 200, {leading: true, trailing: false}),
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style>
.label {
  font-size: 13px;
  font-weight: bold;
  line-height: 14px;
  color: #ffffff;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  white-space: nowrap;
  vertical-align: baseline;
  background-color: #999999;
}

.label {
  padding: 1px 4px 2px;
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  border-radius: 3px;
}

.label-critical {
  background-color: #b94a48;
}

.label-major {
  background-color: #f89406;
}

.label-minor {
  background-color: #ffd700;
}

.label-warning {
  background-color: #3a87ad;
}

.label-normal,
.label-cleared,
.label-ok,
.label-informational {
  background-color: #468847;
}

.label-inverse {
  background-color: #333333;
}
</style>
