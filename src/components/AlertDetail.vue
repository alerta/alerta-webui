<template>
  <v-card
    flat
  >
    <v-card
      tile
      flat
    >
      <v-toolbar
        dense
      >
        <v-btn
          icon
          @click="dialog = false"
        >
          <v-icon>arrow_back</v-icon>
        </v-btn>

        <!-- <v-tooltip bottom>
          <v-btn
            v-show="isAcked(item.status) || isClosed(item.status)"
            slot="activator"
            icon
            class="btn--plain"
            @click="takeAction(item.id, 'open')"
          >
            <v-icon
              size="20px"
            >
              refresh
            </v-icon>
          </v-btn>
          <span>Open</span>
        </v-tooltip> -->

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

            <v-list>
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
              <v-card-text>
                <div class="flex xs12">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="header font-weight-bold">
                        Alert ID
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div class="font-weight-regular">
                        {{ item.id }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="header font-weight-bold">
                        Last Receive Alert ID
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div class="font-weight-regular">
                        {{ item.lastReceiveId }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="header font-weight-bold">
                        Create Time
                      </div>
                    </div>
                    <div class="flex xs9 text-xs-left">
                      <div class="font-weight-regular">
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
                <div class="flex xs12">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="header font-weight-bold">
                        Receive Time
                      </div>
                    </div>
                    <div class="flex xs9 text-xs-left">
                      <div class="font-weight-regular">
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
                <div class="flex xs12">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="header font-weight-bold">
                        Last Receive Time
                      </div>
                    </div>
                    <div class="flex xs9 text-xs-left">
                      <div class="font-weight-regular">
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
                  class="flex xs12"
                >
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="header font-weight-bold">
                        Customer
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div class="font-weight-regular">
                        {{ item.customer }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="header font-weight-bold">
                        Service
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div class="font-weight-regular">
                        <v-chip
                          v-for="service in item.service"
                          :key="service"
                          outline
                          small
                        >
                          {{ service }}
                        </v-chip>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="header font-weight-bold">
                        Environment
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div class="font-weight-regular">
                        {{ item.environment }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="header font-weight-bold">
                        Resource
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div class="font-weight-regular">
                        {{ item.resource }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="header font-weight-bold">
                        Event
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div class="font-weight-regular">
                        {{ item.event }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="header font-weight-bold">
                        Correlate
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div class="font-weight-regular">
                        {{ item.correlate }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="header font-weight-bold">
                        Group
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div class="font-weight-regular">
                        {{ item.group }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="header font-weight-bold">
                        Severity
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div class="font-weight-regular">
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

                <div class="flex xs12">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="header font-weight-bold">
                        Status
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div class="font-weight-regular">
                        <span class="label">
                          {{ item.status | capitalize }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="header font-weight-bold">
                        Value
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div class="font-weight-regular">
                        {{ item.value }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="header font-weight-bold">
                        Text
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div class="font-weight-regular">
                        {{ item.text }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="header font-weight-bold">
                        Trend Indication
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div class="font-weight-regular">
                        <span class="label">
                          {{ item.trendIndication | splitCaps }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="header font-weight-bold">
                        Timeout
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div class="font-weight-regular">
                        {{ item.timeout }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="header font-weight-bold">
                        Type
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div class="font-weight-regular">
                        <span class="label">
                          {{ item.type | splitCaps }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="header font-weight-bold">
                        Duplicate Count
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div class="font-weight-regular">
                        {{ item.duplicateCount }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="header font-weight-bold">
                        Repeat
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div class="font-weight-regular">
                        <span class="label">
                          {{ item.repeat | capitalize }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="header font-weight-bold">
                        Origin
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div class="font-weight-regular">
                        {{ item.origin }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="header font-weight-bold">
                        Tags
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div class="font-weight-regular">
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
                <div class="flex xs12">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="header font-weight-bold">
                        Attributes
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div class="font-weight-regular">
                        {{ item.attributes }}
                      </div>
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
                hide-actions
              >
                <template
                  slot="items"
                  slot-scope="props"
                >
                  <td class="hidden-sm-and-down">
                    {{ props.item.id | shortId }}
                  </td>
                  <td
                    class="hidden-sm-and-down"
                    nowrap
                  >
                    <date-time
                      :value="props.item.updateTime"
                      format="mediumDate"
                    />
                  </td>
                  <td
                    class="hidden-md-and-up"
                    nowrap
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
            <div class="tab-item-wrapper">
              <v-container>
                <v-layout>
                  <v-flex>
                    <v-card
                      flat
                      color="grey lighten-3"
                    >
                      <pre>{{ item.rawData || 'no raw data' }}</pre>
                    </v-card>
                  </v-flex>
                </v-layout>
              </v-container>
            </div>
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
import DateTime from './DateTime'
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
    tiles1: [
      { img: 'keep.png', title: 'Keep' },
      { img: 'inbox.png', title: 'Inbox' },
      { img: 'hangouts.png', title: 'Hangouts' },
      { img: 'messenger.png', title: 'Messenger' },
      { img: 'google.png', title: 'Google+' }
    ],
    tiles: [],
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
    headersByScreenSize() {
      return this.headers.filter(
        h => !h.hide || !this.$vuetify.breakpoint[h.hide]
      )
    },
    shelveTimeout() {
      return this.$store.getters.getPreference('shelveTimeout')
    },
    username() {
      return this.$store.getters['auth/getPayload'].name
    }
  },
  watch: {
    dialog(val) {
      val || this.close()
    }
  },
  created() {
    this.getAlert(this.id)
  },
  methods: {
    getAlert() {
      this.$store.dispatch('alerts/getAlert', this.id)
    },
    isWatched(tags) {
      return tags ? tags.indexOf(`watch:${this.username}`) > -1 : false
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
    takeAction(id, action, text) {
      text = text || `${action} by ${this.username}`
      this.$store
        .dispatch('alerts/takeAction', [id, action, text])
        .then(() => this.getAlert(this.id))
    },
    shelveAlert(id, text) {
      text = text || `shelved by ${this.username}`
      this.$store
        .dispatch('alerts/takeAction', [id, 'shelve', text, this.shelveTimeout * 3600])
        .then(() => this.getAlert(this.id))
    },
    watchAlert(id) {
      this.$store
        .dispatch('alerts/tagAlert', [id, { tags: [`watch:${this.username}`] } ])
        .then(() => this.getAlert(this.id))
    },
    unwatchAlert(id) {
      this.$store
        .dispatch('alerts/untagAlert', [id, { tags: [`watch:${this.username}`] } ])
        .then(() => this.getAlert(this.id))
    },
    addNote(id, text) {
      this.$store
        .dispatch('alerts/addNote', [id, text])
        .then(() => {
          this.getAlert(this.id)
        })
    },
    deleteAlert(id) {
      confirm('Are you sure you want to delete this item?') &&
        this.$store.dispatch('alerts/deleteAlert', id)
    },
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
