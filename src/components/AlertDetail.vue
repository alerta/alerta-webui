<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
    scrollable
  >
    <v-card tile>
      <v-toolbar>
        <v-toolbar-side-icon>
          <v-icon @click="close">
            close
          </v-icon>
        </v-toolbar-side-icon>
        <v-toolbar-title>Alert details</v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-btn
            flat
            icon
            @click="sheet = true"
          >
            <v-icon>more_vert</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card>
        <v-tabs
          v-model="active"
          color="secondary"
          grow
        >
          <v-tab ripple>
            Details
          </v-tab>
          <v-tab-item
            :transition="false"
            :reverse-transition="false"
          >
            <v-card>
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
                <div class="flex xs12">
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
                        <v-chip small>
                          {{ item.previousSeverity }}
                        </v-chip>&nbsp;&rarr;&nbsp;
                        <v-chip small>
                          {{ item.severity }}
                        </v-chip>
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
                        {{ item.status }}
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
                        {{ item.trendIndication }}
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
                        {{ item.type }}
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
                        {{ item.repeat }}
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
                    class="text-xs-right hidden-sm-and-down"
                    nowrap
                  >
                    <date-time
                      :value="props.item.updateTime"
                      format="mediumDate"
                    />
                  </td>
                  <td
                    class="text-xs-left hidden-md-and-up"
                    nowrap
                  >
                    <date-time
                      :value="props.item.updateTime"
                      format="shortTime"
                    />
                  </td>
                  <td class="text-xs-right hidden-sm-and-down">
                    <v-chip small>
                      {{ props.item.severity | capitalize }}
                    </v-chip>
                  </td>
                  <td class="text-xs-right hidden-sm-and-down">
                    <v-chip small>
                      {{ props.item.status | capitalize }}
                    </v-chip>
                  </td>
                  <td class="text-xs-left">
                    <v-chip small>
                      {{ props.item.type || 'unknown' | capitalize }}
                    </v-chip>
                  </td>
                  <td class="text-xs-right hidden-sm-and-down">
                    {{ props.item.event }}
                  </td>
                  <td class="text-xs-right hidden-sm-and-down">
                    {{ props.item.value }}
                  </td>
                  <td class="text-xs-left">
                    {{ props.item.text }}
                  </td>
                </template>
              </v-data-table>
            </div>
          </v-tab-item>
        </v-tabs>
      </v-card>

      <v-card-actions class="hidden-sm-and-down">
        <v-btn
          color="green"
          class="white--text"
          @click="takeAction('open')"
        >
          <v-icon>refresh</v-icon>&nbsp;Open
        </v-btn>

        <v-btn
          v-show="!isWatched"
          color="white"
          class="black--text"
          @click="watchAlert"
        >
          <v-icon>visibility</v-icon>&nbsp;Watch
        </v-btn>

        <v-btn
          v-show="isWatched"
          color="white"
          class="black--text"
          @click="unwatchAlert"
        >
          <v-icon>visibility_off</v-icon>&nbsp;Unwatch
        </v-btn>

        <v-btn
          v-show="!isShelved"
          color="blue"
          class="white--text"
          :disabled="isClosed"
          @click="shelveAlert()"
        >
          <v-icon>schedule</v-icon>&nbsp;Shelve
        </v-btn>

        <v-btn
          v-show="isShelved"
          color="blue"
          class="white--text"
          @click="takeAction('unshelve')"
        >
          <v-icon>schedule</v-icon>&nbsp;Unshelve
        </v-btn>

        <v-btn
          v-show="!isAcked"
          color="blue darken-2"
          class="white--text"
          :disabled="isShelved || isClosed"
          @click="takeAction('ack')"
        >
          <v-icon>check_circle_outline</v-icon>&nbsp;Ack
        </v-btn>

        <v-btn
          v-show="isAcked"
          color="blue darken-2"
          class="white--text"
          @click="takeAction('unack')"
        >
          <v-icon>check_circle_outline</v-icon>&nbsp;Unack
        </v-btn>

        <v-btn
          color="orange"
          class="white--text"
          :disabled="isClosed"
          @click="takeAction('close')"
        >
          <v-icon>highlight_off</v-icon>&nbsp;Close
        </v-btn>

        <v-btn
          color="red"
          class="white--text"
          @click="deleteAlert"
        >
          <v-icon>delete_forever</v-icon>&nbsp;Delete
        </v-btn>

        <v-spacer />

        <v-btn
          color="white"
          @click="addNote"
        >
          <v-icon>note_add</v-icon>&nbsp;Add&nbsp;note
        </v-btn>
      </v-card-actions>

      <v-card-text>
        <div>
          <v-text-field
            v-model="text"
            label="Operator comment"
            hint="optional"
            persistent-hint
          />
        </div>
      </v-card-text>
    </v-card>

    <v-bottom-sheet v-model="sheet">
      <v-list>
        <v-subheader>Actions</v-subheader>

        <v-list-tile
          v-show="isAcked || isClosed"
          @click="takeAction('open')"
        >
          <v-list-tile-avatar>
            <v-avatar
              size="32px"
              tile
            >
              <v-icon color="green">
                refresh
              </v-icon>
            </v-avatar>
          </v-list-tile-avatar>
          <v-list-tile-title>Open</v-list-tile-title>
        </v-list-tile>

        <v-list-tile
          v-show="!isWatched"
          @click="watchAlert"
        >
          <v-list-tile-avatar>
            <v-avatar
              size="32px"
              tile
            >
              <v-icon color="black">
                visibility
              </v-icon>
            </v-avatar>
          </v-list-tile-avatar>
          <v-list-tile-title>Watch</v-list-tile-title>
        </v-list-tile>

        <v-list-tile
          v-show="isWatched"
          @click="unwatchAlert"
        >
          <v-list-tile-avatar>
            <v-avatar
              size="32px"
              tile
            >
              <v-icon color="black">
                visibility_off
              </v-icon>
            </v-avatar>
          </v-list-tile-avatar>
          <v-list-tile-title>Unwatch</v-list-tile-title>
        </v-list-tile>

        <v-list-tile
          v-show="item.status == 'open'"
          @click="takeAction('ack')"
        >
          <v-list-tile-avatar>
            <v-avatar
              size="32px"
              tile
            >
              <v-icon color="blue darken-2">
                check_circle_outline
              </v-icon>
            </v-avatar>
          </v-list-tile-avatar>
          <v-list-tile-title>Ack</v-list-tile-title>
        </v-list-tile>

        <v-list-tile
          v-show="isAcked"
          @click="takeAction('unack')"
        >
          <v-list-tile-avatar>
            <v-avatar
              size="32px"
              tile
            >
              <v-icon color="blue darken-2">
                check_circle_outline
              </v-icon>
            </v-avatar>
          </v-list-tile-avatar>
          <v-list-tile-title>Unack</v-list-tile-title>
        </v-list-tile>

        <v-list-tile
          v-show="!isShelved"
          @click="shelveAlert()"
        >
          <v-list-tile-avatar>
            <v-avatar
              size="32px"
              tile
            >
              <v-icon color="blue">
                schedule
              </v-icon>
            </v-avatar>
          </v-list-tile-avatar>
          <v-list-tile-title>Shelve</v-list-tile-title>
        </v-list-tile>

        <v-list-tile
          v-show="isShelved"
          @click="takeAction('unshelve')"
        >
          <v-list-tile-avatar>
            <v-avatar
              size="32px"
              tile
            >
              <v-icon color="blue">
                schedule
              </v-icon>
            </v-avatar>
          </v-list-tile-avatar>
          <v-list-tile-title>Unshelve</v-list-tile-title>
        </v-list-tile>

        <v-list-tile
          v-show="!isClosed"
          @click="takeAction('close')"
        >
          <v-list-tile-avatar>
            <v-avatar
              size="32px"
              tile
            >
              <v-icon color="orange">
                highlight_off
              </v-icon>
            </v-avatar>
          </v-list-tile-avatar>
          <v-list-tile-title>Close</v-list-tile-title>
        </v-list-tile>

        <v-list-tile @click="deleteAlert">
          <v-list-tile-avatar>
            <v-avatar
              size="32px"
              tile
            >
              <v-icon color="red">
                delete_forever
              </v-icon>
            </v-avatar>
          </v-list-tile-avatar>
          <v-list-tile-title>Delete</v-list-tile-title>
        </v-list-tile>

        <v-list-tile @click="addNote">
          <v-list-tile-avatar>
            <v-avatar
              size="32px"
              tile
            >
              <v-icon color="black">
                add
              </v-icon>
            </v-avatar>
          </v-list-tile-avatar>
          <v-list-tile-title>Add Note</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-bottom-sheet>
  </v-dialog>
</template>

<script>
import DateTime from './DateTime'

export default {
  components: {
    DateTime
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
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
        { text: 'Text', value: 'text' }
      ],
      text: null
    }
  },
  computed: {
    item() {
      return this.$store.state.alerts.alert
    },
    history() {
      return this.item.history
        ? this.item.history.map((h, index) => ({ index: index, ...h }))
        : []
    },
    shelveTimeout() {
      return this.$store.getters.getPreference('shelveTimeout')
    },
    isWatched() {
      return this.item.tags
        ? this.item.tags.indexOf(`watch:${this.username}`) > -1
        : false
    },
    isAcked() {
      return this.item.status == 'ack' || this.item.status == 'ACKED'
    },
    isShelved() {
      return this.item.status == 'shelved' || this.item.status == 'SHLVD'
    },
    isClosed() {
      return this.item.status == 'closed'
    },
    username() {
      return this.$store.getters['auth/getPayload'].name
    },
    headersByScreenSize() {
      return this.headers.filter(
        h => !h.hide || !this.$vuetify.breakpoint[h.hide]
      )
    }
  },
  created() {
    this.getAlert(this.id)
  },
  methods: {
    getAlert(id) {
      this.$store.dispatch('alerts/getAlert', id)
    },
    takeAction(action) {
      this.$store
        .dispatch('alerts/takeAction', [this.item.id, action, this.text])
        .then(() => this.getAlert(this.item.id))
      this.sheet = false
    },
    shelveAlert() {
      this.$store
        .dispatch('alerts/takeAction', [
          this.item.id,
          'shelve',
          this.text,
          this.shelveTimeout
        ])
        .then(() => this.getAlert(this.item.id))
      this.sheet = false
    },
    watchAlert() {
      let user = this.$store.getters['auth/getPayload'].name
      this.$store
        .dispatch('alerts/tagAlert', [
          this.item.id,
          { tags: [`watch:${user}`] }
        ])
        .then(() => this.getAlert(this.item.id))
      this.sheet = false
    },
    unwatchAlert() {
      let user = this.$store.getters['auth/getPayload'].name
      this.$store
        .dispatch('alerts/untagAlert', [
          this.item.id,
          { tags: [`watch:${user}`] }
        ])
        .then(() => this.getAlert(this.item.id))
      this.sheet = false
    },
    addNote() {
      this.$store
        .dispatch('alerts/addNote', [this.item.id, this.text])
        .then(() => this.getAlert(this.item.id))
    },
    deleteAlert() {
      confirm('Are you sure you want to delete this item?') &&
        this.$store.dispatch('alerts/deleteAlert', this.item.id)
      this.sheet = false
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style></style>
