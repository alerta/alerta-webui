<template>
  <div>
    <v-data-table
      v-model="selected"
      :headers="customHeaders"
      :items="alerts"
      item-key="id"
      :pagination.sync="pagination"
      :total-items="pagination.totalItems"
      :rows-per-page-items="pagination.rowsPerPageItems"
      :loading="isSearching"
      class="alert-table"
      :class="[ displayDensity ]"
      :style="columnWidths"
      sort-icon="arrow_drop_down"
      select-all
    >
      <template
        slot="items"
        slot-scope="props"
      >
        <tr
          :style="{ 'background-color': severityColor(props.item.severity) }"
          class="hover-lighten"
          @click="selectItem(props.item)"
        >
          <td
            class="text-no-wrap"
            :style="fontStyle"
          >
            <v-checkbox
              v-if="selectableRows"
              v-model="props.selected"
              primary
              hide-details
              color="gray"
              class="select-box"
              :ripple="false"
              :size="fontSize"
              @click.stop
            />
            <v-icon
              v-else-if="props.item.trendIndication == 'moreSevere'"
              :class="['trend-arrow', textColor(props.item.severity)]"
              :size="fontSize"
              @click.stop="multiselect = true; props.selected = true"
            >
              arrow_upward
            </v-icon>
            <v-icon
              v-else-if="props.item.trendIndication == 'lessSevere'"
              :class="['trend-arrow', textColor(props.item.severity)]"
              :size="fontSize"
              @click.stop="multiselect = true; props.selected = true"
            >
              arrow_downward
            </v-icon>
            <v-icon
              v-else
              :class="['trend-arrow', textColor(props.item.severity)]"
              :size="fontSize"
              @click.stop="multiselect = true; props.selected = true"
            >
              remove
            </v-icon>
          </td>
          <td
            v-for="col in $config.columns"
            :key="col"
            :class="['text-no-wrap', textColor(props.item.severity)]"
            :style="fontStyle"
          >
            <span
              v-if="col == 'id'"
            >
              {{ props.item.id | shortId }}
            </span>
            <span
              v-if="col == 'resource'"
            >
              {{ props.item.resource }}
            </span>
            <span
              v-if="col == 'event'"
            >
              {{ props.item.event }}
            </span>
            <span
              v-if="col == 'environment'"
            >
              {{ props.item.environment }}
            </span>
            <span
              v-if="col == 'severity'"
            >
              <span
                :class="['label', 'label-' + props.item.severity.toLowerCase()]"
                :style="fontStyle"
              >
                {{ props.item.severity | capitalize }}
              </span>
            </span>
            <span
              v-if="col == 'correlate'"
            >
              {{ props.item.correlate.join(', ') }}
            </span>
            <span
              v-if="col == 'status'"
            >
              <span
                class="label"
                :style="fontStyle"
              >
                {{ props.item.status | capitalize }}

              </span>
              <span
                v-if="showNotesIcon"
              >
                <span
                  v-if="lastNote(props.item)"
                  class="pl-2"
                >
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        v-bind="attrs"
                        small
                        v-on="on"
                      >text_snippet</v-icon>
                    </template>
                    <span>{{ lastNote(props.item) }}</span>
                  </v-tooltip>
                </span>
              </span>
            </span>
            <span
              v-if="col == 'service'"
            >
              {{ props.item.service.join(', ') }}
            </span>
            <span
              v-if="col == 'group'"
            >
              {{ props.item.group }}
            </span>
            <span
              v-if="col == 'value'"
            >
              <div class="fixed-table">
                <div class="text-truncate">
                  <span v-html="props.item.value" />
                </div>
              </div>
            </span>
            <span
              v-if="col == 'text'"
            >
              <div class="fixed-table">
                <div class="text-truncate">
                  <span v-html="props.item.text" />
                </div>
              </div>
            </span>
            <span
              v-if="col == 'tags'"
            >
              <span
                v-for="tag in props.item.tags"
                :key="tag"
              ><span
                class="label"
                :style="fontStyle"
              >{{ tag }}</span>&nbsp;</span>
            </span>
            <span
              v-if="props.item.attributes.hasOwnProperty(col)"
            >
              <span v-html="props.item.attributes[col]" />
            </span>
            <span
              v-if="col == 'origin'"
            >
              {{ props.item.origin }}
            </span>
            <span
              v-if="col == 'type'"
            >
              <span
                class="label"
                :style="fontStyle"
              >
                {{ props.item.type | splitCaps }}
              </span>
            </span>
            <span
              v-if="col == 'createTime'"
            >
              <date-time
                :value="props.item.createTime"
                format="mediumDate"
              />
            </span>
            <span
              v-if="col == 'timeout'"
            >
              {{ props.item.timeout | hhmmss }}
            </span>
            <span
              v-if="col == 'timeoutLeft'"
              class="text-xs-right"
            >
              {{ timeoutLeft(props.item) | hhmmss }}
            </span>
            <!-- rawData not supported -->
            <span
              v-if="col == 'customer' && $config.customer_views"
            >
              {{ props.item.customer }}
            </span>
            <span
              v-if="col == 'duplicateCount'"
            >
              {{ props.item.duplicateCount }}
            </span>
            <span
              v-if="col == 'repeat'"
            >
              <span
                class="label"
                :style="fontStyle"
              >
                {{ props.item.repeat | capitalize }}
              </span>
            </span>
            <span
              v-if="col == 'previousSeverity'"
            >
              <span
                :class="['label', 'label-' + props.item.previousSeverity.toLowerCase()]"
                :style="fontStyle"
              >
                {{ props.item.previousSeverity | capitalize }}
              </span>
            </span>
            <!-- trendIndication not supported -->
            <span
              v-if="col == 'receiveTime'"
            >
              <date-time
                :value="props.item.receiveTime"
                format="mediumDate"
              />
            </span>
            <span
              v-if="col == 'duration'"
              class="text-xs-right"
            >
              {{ duration(props.item) | hhmmss }}
            </span>
            <span
              v-if="col == 'lastReceiveId'"
            >
              {{ props.item.lastReceiveId | shortId }}
            </span>
            <span
              v-if="col == 'lastReceiveTime'"
            >
              <date-time
                :value="props.item.lastReceiveTime"
                format="mediumDate"
              />
            </span>
            <!-- only history supported is most recent note -->
            <span
              v-if="col == 'note'"
            >
              {{ lastNote(props.item) }}
            </span>
          </td>
          <td
            :class="['text-no-wrap', textColor(props.item.severity)]"
          >
            <div
              class="action-buttons"
              :style="{ 'background-color': severityColor(props.item.severity) }"
            >
              ...&nbsp;
              <v-btn
                v-if="isAcked(props.item.status) || isClosed(props.item.status)"
                flat
                icon
                small
                class="btn--plain pa-0 ma-0"
                @click.stop="takeAction(props.item.id, 'open')"
              >
                <v-icon
                  :size="fontSize"
                >
                  refresh
                </v-icon>
              </v-btn>

              <v-btn
                v-if="!isWatched(props.item.tags)"
                flat
                icon
                small
                class="btn--plain pa-0 ma-0"
                @click.stop="watchAlert(props.item.id)"
              >
                <v-icon
                  :size="fontSize"
                >
                  visibility
                </v-icon>
              </v-btn>
              <v-btn
                v-if="isWatched(props.item.tags)"
                flat
                icon
                small
                class="btn--plain pa-0 ma-0"
                @click.stop="unwatchAlert(props.item.id)"
              >
                <v-icon
                  :size="fontSize"
                >
                  visibility_off
                </v-icon>
              </v-btn>

              <v-btn
                v-if="isOpen(props.item.status)"
                flat
                icon
                small
                class="btn--plain pa-0 ma-0"
                @click.stop="ackAlert(props.item.id)"
              >
                <v-icon
                  :size="fontSize"
                >
                  check
                </v-icon>
              </v-btn>
              <v-btn
                v-if="isAcked(props.item.status)"
                flat
                icon
                small
                class="btn--plain pa-0 ma-0"
                @click.stop="takeAction(props.item.id, 'unack')"
              >
                <v-icon
                  :size="fontSize"
                >
                  undo
                </v-icon>
              </v-btn>

              <v-btn
                v-if="isOpen(props.item.status) || isAcked(props.item.status)"
                flat
                icon
                small
                class="btn--plain pa-0 ma-0"
                @click.stop="shelveAlert(props.item.id)"
              >
                <v-icon
                  :size="fontSize"
                >
                  schedule
                </v-icon>
              </v-btn>
              <v-btn
                v-if="isShelved(props.item.status)"
                flat
                icon
                small
                class="btn--plain pa-0 ma-0"
                @click.stop="takeAction(props.item.id, 'unshelve')"
              >
                <v-icon
                  :size="fontSize"
                >
                  restore
                </v-icon>
              </v-btn>

              <v-btn
                v-if="!isClosed(props.item.status)"
                flat
                icon
                small
                class="btn--plain pa-0 ma-0"
                @click.stop="takeAction(props.item.id, 'close')"
              >
                <v-icon
                  :size="fontSize"
                >
                  highlight_off
                </v-icon>
              </v-btn>
              <v-btn
                flat
                icon
                small
                class="btn--plain pa-0 ma-0"
                @click.stop="deleteAlert(props.item.id)"
              >
                <v-icon
                  :size="fontSize"
                >
                  delete
                </v-icon>
              </v-btn>
              <!-- <v-btn
                flat
                icon
                small
                class="btn--plain pa-0 ma-0"
                @click.stop="clipboardCopy(JSON.stringify(props.item, null, 4))"
              >
                <v-icon
                  :size="fontSize"
                >
                  content_copy
                </v-icon>
              </v-btn> -->

              <v-menu
                bottom
                left
              >
                <v-btn
                  slot="activator"
                  flat
                  icon
                  small
                  class="btn--plain pa-0 ma-0"
                >
                  <v-icon small>
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
                    @click.stop="takeAction(props.item.id, action)"
                  >
                    <v-list-tile-title>{{ action | splitCaps }}</v-list-tile-title>
                  </v-list-tile>
                </v-list>
              </v-menu>
            </div>
          </td>
        </tr>
      </template>
      <template slot="no-data">
        <div class="text-xs-center">
          <span v-if="isLoading">{{ $t('Loading') }}...</span>
          <span v-if="!isLoading">{{ $t('NoDataAvailable') }}</span>
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import get from 'lodash/get'
import DateTime from './lib/DateTime'
import moment from 'moment'
import i18n from '@/plugins/i18n'

export default {
  components: {
    DateTime
  },
  props: {
    alerts: {
      type: Array,
      default: () => []
    }
  },
  data: vm => ({
    search: '',
    headersMap: {
      id: { text: i18n.t('AlertId'), value: 'id' },
      resource: { text: i18n.t('Resource'), value: 'resource' },
      event: { text: i18n.t('Event'), value: 'event' },
      environment: { text: i18n.t('Environment'), value: 'environment' },
      severity: { text: i18n.t('Severity'), value: 'severity' },
      correlate: { text: i18n.t('Correlate'), value: 'correlate' },
      status: { text: i18n.t('Status'), value: 'status' },
      service: { text: i18n.t('Service'), value: 'service' },
      group: { text: i18n.t('Group'), value: 'group' },
      value: { text: i18n.t('Value'), value: 'value', class: 'value-header' },
      text: { text: i18n.t('Description'), value: 'text', class: 'text-header' },
      tags: { text: i18n.t('Tags'), value: 'tags' },
      attributes: { text: i18n.t('Attribute'), value: 'attributes' },
      origin: { text: i18n.t('Origin'), value: 'origin' },
      type: { text: i18n.t('Type'), value: 'type' },
      createTime: { text: i18n.t('CreateTime'), value: 'createTime' },
      timeout: { text: i18n.t('Timeout'), value: 'timeout' },
      timeoutLeft: { text: i18n.t('TimeoutLeft'), value: 'timeoutLeft' },
      customer: { text: i18n.t('Customer'), value: 'customer' },
      duplicateCount: { text: i18n.t('Dupl'), value: 'duplicateCount' },
      repeat: { text: i18n.t('Repeat'), value: 'repeat' },
      previousSeverity: { text: i18n.t('PrevSeverity'), value: 'previousSeverity' },
      trendIndication: { text: i18n.t('TrendIndication'), value: 'trendIndication' },
      receiveTime: { text: i18n.t('ReceiveTime'), value: 'receiveTime' },
      duration: { text: i18n.t('Duration'), value: 'duration' },
      lastReceiveId: { text: i18n.t('LastReceiveId'), value: 'lastReceiveId' },
      lastReceiveTime: { text: i18n.t('LastReceiveTime'), value: 'lastReceiveTime' },
      note: { text: i18n.t('LastNote'), value: 'note', sortable: false }
    },
    details: false,
    selectedId: null,
    multiselect: false,
    timer: null,
    shiftDown: false
  }),
  computed: {
    displayDensity() {
      return (
        this.$store.getters.getPreference('displayDensity') ||
        this.$store.state.alerts.displayDensity
      )
    },
    fontStyle() {
      const font = this.$store.getters.getPreference('font')
      return {
        'font-family': font['font-family'],
        'font-size': font['font-size'],
        'font-weight': font['font-weight']
      }
    },
    fontSize() {
      return this.$store.getters.getPreference('font')['font-size']
    },
    columnWidths() {
      return {
        '--value-width': this.valueWidth() + 'px',
        '--text-width': this.textWidth() + 'px'
      }
    },
    isLoading() {
      return this.$store.state.alerts.isLoading
    },
    isSearching() {
      return this.$store.state.alerts.isSearching ? 'primary' : false
    },
    showNotesIcon() {
      return this.$store.getters.getPreference('showNotesIcon')
    },
    rowsPerPage() {
      return this.$store.getters.getPreference('rowsPerPage')
    },
    pagination: {
      get() {
        return this.$store.state.alerts.pagination
      },
      set(value) {
        this.$store.dispatch('alerts/setPagination', value)
      }
    },
    actions() {
      return this.$config.actions
    },
    customHeaders() {
      return this.$config.columns.map(c =>
        this.headersMap[c] || { text: this.$options.filters.capitalize(c), value: 'attributes.' + c }
      )
    },
    selectedItem() {
      return this.alerts.filter(a => a.id == this.selectedId)[0]
    },
    selectableRows() {
      return this.selected.length > 0
    },
    selected: {
      get() {
        return this.$store.state.alerts.selected
      },
      set(values) {
        const alerts = this.$store.state.alerts.alerts
        if (this.shiftDown) {
          // check if there is a gap between selected and previously
          let indexes = []
          for (let i = 0; i < values.length; i++) {
            const alertIndex = alerts.findIndex((x => x.id === values[i].id))
            indexes.push(alertIndex)
            if (i > 0) {
              if (Math.abs(alertIndex - indexes[i - 1]) > 1) {
                const lowIndex = Math.min(alertIndex, indexes[i - 1])
                const highIndex = Math.max(alertIndex, indexes[i - 1])
                // fill in all the missing alerts
                for (let j = lowIndex + 1; j < highIndex; j++) {
                  // check if alert is already in the list
                  if (!values.find(alert => alert.id === alerts[j].id)) {
                    values.push(alerts[j])
                  }
                }
              }
            }
          }
        }
        this.$store.dispatch('alerts/updateSelected', values)
      }
    },
    ackTimeout() {
      return this.$store.getters.getPreference('ackTimeout')
    },
    shelveTimeout() {
      return this.$store.getters.getPreference('shelveTimeout')
    },
    username() {
      return this.$store.getters['auth/getUsername']
    }
  },
  watch: {
    rowsPerPage(val) {
      this.pagination = Object.assign({}, this.pagination, {rowsPerPage: val})
    }
  },
  created() {
    this.initHotkeys()
  },
  methods: {
    initHotkeys() {
      window.addEventListener('keydown', this.processHotkey)
      window.addEventListener('keyup', this.removeHotkey)
    },
    processHotkey(event) {
      event.code === 'ShiftLeft' || event.code === 'ShiftRight' ? this.shiftDown = true : 0
    },
    removeHotkey(event) {
      event.code === 'ShiftLeft' || event.code === 'ShiftRight' ? this.shiftDown = false : 0
    },
    duration(item) {
      return moment.duration(moment().diff(moment(item.receiveTime)))
    },
    timeoutLeft(item) {
      let ackedOrShelved = this.isShelved(item.status) || this.isAcked(item.status)
      let lastModified = ackedOrShelved && item.updateTime ? item.updateTime : item.lastReceiveTime
      let expireTime = moment(lastModified).add(item.timeout, 'seconds')
      return expireTime.isAfter() ? expireTime.diff(moment(), 'seconds') : moment.duration()
    },
    lastNote(item) {
      const note = item.history.filter(h => h.type == 'note' || h.type == 'dismiss').pop()
      return note && note.type == 'note' ? note.text : ''
    },
    valueWidth() {
      return this.$store.getters.getPreference('valueWidth')
    },
    textWidth() {
      return this.$store.getters.getPreference('textWidth')
    },
    textColor(severity) {
      if (this.severityColor(severity) === 'black' || this.severityColor(severity) === '#000000') {
        return 'white--text'
      }
      return this.$store.getters.getConfig('colors').text
        ? `${this.$store.getters.getConfig('colors').text}--text`
        : ''
    },
    severityColor(severity) {
      return this.$store.getters.getConfig('colors').severity[severity] || 'white'
    },
    selectItem(item) {
      if (!this.selected.length) {
        this.$emit('set-alert', item)
      }
    },
    isOpen(status) {
      return status == 'open' || status == 'NORM' || status == 'UNACK' || status == 'RTNUN'
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
    takeAction: debounce(function(id, action) {
      this.$store
        .dispatch('alerts/takeAction', [id, action, ''])
        .then(() => this.$store.dispatch('alerts/getAlerts'))
    }, 200, {leading: true, trailing: false}),
    ackAlert: debounce(function(id) {
      this.$store
        .dispatch('alerts/takeAction', [id, 'ack', '', this.ackTimeout])
        .then(() => this.$store.dispatch('alerts/getAlerts'))
    }, 200, {leading: true, trailing: false}),
    shelveAlert: debounce(function(id) {
      this.$store
        .dispatch('alerts/takeAction', [id, 'shelve', '', this.shelveTimeout])
        .then(() => this.$store.dispatch('alerts/getAlerts'))
    }, 200, {leading: true, trailing: false}),
    watchAlert: debounce(function(id) {
      this.$store
        .dispatch('alerts/watchAlert', id)
        .then(() => this.$store.dispatch('alerts/getAlerts'))
    }, 200, {leading: true, trailing: false}),
    unwatchAlert: debounce(function(id) {
      this.$store
        .dispatch('alerts/unwatchAlert', id)
        .then(() => this.$store.dispatch('alerts/getAlerts'))
    }, 200, {leading: true, trailing: false}),
    deleteAlert: debounce(function(id) {
      confirm(i18n.t('ConfirmDelete')) &&
        this.$store.dispatch('alerts/deleteAlert', id)
          .then(() => this.$store.dispatch('alerts/getAlerts'))
    }, 200, {leading: true, trailing: false}),
    clipboardCopy(text) {
      let textarea = document.createElement('textarea')
      textarea.textContent = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
  }
}
</script>

<style>
.alert-table .v-table th, td {
  padding: 0px 5px !important;
}

.value-header {
  width: var(--value-width);
  min-width: var(--value-width);
}

.text-header {
  width: var(--text-width);
  min-width: var(--text-width);
}

.comfortable table.v-table tbody td, table.v-table tbody th {
  height: 42px !important;
}

.compact table.v-table tbody td, table.v-table tbody th {
  height: 34px !important;
}

.alert-table .v-table tbody td {
  border-top: 1px solid rgb(221, 221, 221);
}

.fixed-table {
  display: table;
  table-layout: fixed;
  width: 100%;
}

i.trend-arrow {
  width: 24px !important;
}

div.select-box {
  width: 24px !important;
}

.label {
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

.hover-lighten:hover {
  filter: brightness(0.87);
}

.btn--plain {
  height: auto;
  width: auto;
  margin: 0;
  padding: 8px;
  min-width: 0;
  font-size: 24px;
}
.btn--plain {
  padding: 0;
  opacity: 0.6;
}
.btn--plain:before {
  background-color: transparent !important;
  transition: none !important;
}
.btn--plain:hover {
  opacity: 1;
}

div.action-buttons {
  position: absolute;
  opacity: 0;
  right: 0;
  top: 0.5em;
  height: 2em;
}

tr:hover div.action-buttons {
  opacity: 1;
}
</style>
