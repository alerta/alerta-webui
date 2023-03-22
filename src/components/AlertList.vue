<template>
  <div>
    <!-- sort-icon might need to be moved to header slot -->
    <v-data-table
      v-model="selected"
      :headers="customHeaders"
      :items="alerts"
      item-key="id"
      v-model:pagination="pagination"
      :total-items="pagination.totalItems"
      :rows-per-page-items="pagination.rowsPerPageItems"
      :loading="isSearching"
      class="alert-table"
      :class="[ displayDensity ]"
      :style="columnWidths"
      sort-icon="arrow_drop_down" 
      item-props
      show-select
    >
      <template #item="{item}">
        <tr
          :style="{ 'background-color': severityColor(item.props.severity) }"
          class="hover-lighten"
          @click="selectItem(item.props)"
        >
          <!--TODO: Style is a temporary fix until background-color can be applied to <tr> elements-->
          <td
            class="text-no-wrap label-warning"
            :style="Object.assign({}, fontStyle, { 'background-color': severityColor(item.props.severity)})"
          >
            <!--TODO: item.selected doesn't exist. I don't know how to achieve this functionality in Vuetify 3-->
            <v-checkbox
              v-if="selectableRows"
              v-model="item.selected"
              :value="isSelected"
              primary
              hide-details
              color="gray"
              class="select-box"
              :ripple="false"
              :size="fontSize"
              @click.stop
            />
            <v-icon
              v-else-if="item.props.trendIndication == 'moreSevere'"
              :class="['trend-arrow', textColor(item.props.severity)]"
              :size="fontSize"
              @click.stop="multiselect = true; item.props.selected = true"
            >
              arrow_upward
            </v-icon>
            <v-icon
              v-else-if="item.props.trendIndication == 'lessSevere'"
              :class="['trend-arrow', textColor(item.props.severity)]"
              :size="fontSize"
              @click.stop="multiselect = true; item.props.selected = true"
            >
              arrow_downward
            </v-icon>
            <v-icon
              v-else
              :class="['trend-arrow', textColor(item.props.severity)]"
              :size="fontSize"
              @click.stop="multiselect = true; item.props.selected = true"
            >
              remove
            </v-icon>
          </td>
          <!--TODO: Style is a temporary fix until background-color can be applied to <tr> elements-->
          <td
            v-for="col in this.$config.columns"
            :key="col"
            :class="['text-no-wrap', textColor(item.props.severity)]"
            :style="Object.assign({}, fontStyle, { 'background-color': severityColor(item.props.severity)})"
          >
            <span
              v-if="col == 'id'"
            >
              {{ this.$filters.shortId(item.props.id) }}
            </span>
            <span
              v-if="col == 'resource'"
            >
              {{ item.props.resource }}
            </span>
            <span
              v-if="col == 'event'"
            >
              {{ item.props.event }}
            </span>
            <span
              v-if="col == 'environment'"
            >
              {{ item.props.environment }}
            </span>
            <span
              v-if="col == 'severity'"
            >
              <span
                :class="['label', 'label-' + item.props.severity.toLowerCase()]"
                :style="fontStyle"
              >
                {{ this.$filters.capitalize(item.props.severity) }}
              </span>
            </span>
            <span
              v-if="col == 'correlate'"
            >
              {{ item.props.correlate.join(', ') }}
            </span>
            <span
              v-if="col == 'status'"
            >
              <span
                class="label"
                :style="fontStyle"
              >
                {{ this.$filters.capitalize(item.props.status) }}

              </span>
              <span
                v-if="showNotesIcon"
              >
                <span
                  v-if="lastNote(item.props.id)"
                  class="pl-2"
                >
                  <v-tooltip location="bottom">
                    <template #activator="{props}">
                      <v-icon
                        v-bind="props"
                        size="small"
                      >text_snippet</v-icon>
                    </template>
                    <span>{{ lastNote(item.props.id) }}</span>
                  </v-tooltip>
                </span>
              </span>
            </span>
            <span
              v-if="col == 'service'"
            >
              {{ item.props.service.join(', ') }}
            </span>
            <span
              v-if="col == 'group'"
            >
              {{ item.props.group }}
            </span>
            <span
              v-if="col == 'value'"
            >
              <div class="fixed-table">
                <div class="text-truncate">
                  <span>{{ item.props.value }}</span>
                </div>
              </div>
            </span>
            <span
              v-if="col == 'text'"
            >
              <div class="fixed-table">
                <div class="text-truncate">
                  <span>{{ item.props.text }}</span>
                </div>
              </div>
            </span>
            <span
              v-if="col == 'tags'"
            >
              <span
                v-for="tag in item.props.tags"
                :key="tag"
              ><span
                class="label"
                :style="fontStyle"
              >{{ tag }}</span>&nbsp;</span>
            </span>
            <span
              v-if="item.props.attributes.hasOwnProperty(col)"
            >
              <span>{{ item.props.attributes[col] }}</span>
            </span>
            <span
              v-if="col == 'origin'"
            >
              {{ item.props.origin }}
            </span>
            <span
              v-if="col == 'type'"
            >
              <span
                class="label"
                :style="fontStyle"
              >
                {{ this.$filters.splitCaps(item.props.type) }}
              </span>
            </span>
            <span
              v-if="col == 'createTime'"
            >
              <date-time
                :value="item.props.createTime"
                format="mediumDate"
              />
            </span>
            <span
              v-if="col == 'timeout'"
            >
              {{ this.$filters.hhmmss(item.props.timeout) }}
            </span>
            <span
              v-if="col == 'timeoutLeft'"
              class="text-right"
            >
              {{ this.$filters.hhmmss(timeoutLeft(item.props.id)) }}
            </span>
            <!-- rawData not supported -->
            <span
              v-if="col == 'customer' && this.$config.customer_views"
            >
              {{ item.props.customer }}
            </span>
            <span
              v-if="col == 'duplicateCount'"
            >
              {{ item.props.duplicateCount }}
            </span>
            <span
              v-if="col == 'repeat'"
            >
              <span
                class="label"
                :style="fontStyle"
              >
                {{ this.$filters.capitalize(item.props.repeat) }}
              </span>
            </span>
            <span
              v-if="col == 'previousSeverity'"
            >
              <span
                :class="['label', 'label-' + item.props.previousSeverity.toLowerCase()]"
                :style="fontStyle"
              >
                {{ this.$filters.capitalize(item.props.previousSeverity) }}
              </span>
            </span>
            <!-- trendIndication not supported -->
            <span
              v-if="col == 'receiveTime'"
            >
              <date-time
                :value="item.props.receiveTime"
                format="mediumDate"
              />
            </span>
            <span
              v-if="col == 'duration'"
              class="text-right"
            >
              {{ this.$filters.hhmmss(duration(item.props.id)) }}
            </span>
            <span
              v-if="col == 'lastReceiveId'"
            >
              {{ this.$filters.shortId(item.props.lastReceiveId) }}
            </span>
            <span
              v-if="col == 'lastReceiveTime'"
            >
              <date-time
                :value="item.props.lastReceiveTime"
                format="mediumDate"
              />
            </span>
            <!-- only history supported is most recent note -->
            <span
              v-if="col == 'note'"
            >
              {{ lastNote(item.props.id) }}
            </span>
          </td>
          <td
            :class="['text-no-wrap', textColor(item.props.severity)]"
          >
            <div
              class="action-buttons"
              :style="{ 'background-color': severityColor(item.props.severity) }"
            >
              ...&nbsp;
              <v-btn
                v-if="isAcked(item.props.status) || isClosed(item.props.status)"
                variant="flat"
                icon
                size="small"
                class="btn--plain pa-0 ma-0"
                @click.stop="takeAction(item.props.id, 'open')"
              >
                <v-icon
                  :size="fontSize"
                >
                  refresh
                </v-icon>
              </v-btn>

              <v-btn
                v-if="!isWatched(item.props.tags)"
                variant="flat"
                icon
                size="small"
                class="btn--plain pa-0 ma-0"
                @click.stop="watchAlert(item.props.id)"
              >
                <v-icon
                  :size="fontSize"
                >
                  visibility
                </v-icon>
              </v-btn>
              <v-btn
                v-if="isWatched(item.props.tags)"
                variant="flat"
                icon
                size="small"
                class="btn--plain pa-0 ma-0"
                @click.stop="unwatchAlert(item.props.id)"
              >
                <v-icon
                  :size="fontSize"
                >
                  visibility_off
                </v-icon>
              </v-btn>

              <v-btn
                v-if="isOpen(item.props.status)"
                variant="flat"
                icon
                size="small"
                class="btn--plain pa-0 ma-0"
                @click.stop="ackAlert(item.props.id)"
              >
                <v-icon
                  :size="fontSize"
                >
                  check
                </v-icon>
              </v-btn>
              <v-btn
                v-if="isAcked(item.props.status)"
                variant="flat"
                icon
                size="small"
                class="btn--plain pa-0 ma-0"
                @click.stop="takeAction(item.props.id, 'unack')"
              >
                <v-icon
                  :size="fontSize"
                >
                  undo
                </v-icon>
              </v-btn>

              <v-btn
                v-if="isOpen(item.props.status) || isAcked(item.props.status)"
                variant="flat"
                icon
                size="small"
                class="btn--plain pa-0 ma-0"
                @click.stop="shelveAlert(item.props.id)"
              >
                <v-icon
                  :size="fontSize"
                >
                  schedule
                </v-icon>
              </v-btn>
              <v-btn
                v-if="isShelved(item.props.status)"
                variant="flat"
                icon
                size="small"
                class="btn--plain pa-0 ma-0"
                @click.stop="takeAction(item.props.id, 'unshelve')"
              >
                <v-icon
                  :size="fontSize"
                >
                  restore
                </v-icon>
              </v-btn>

              <v-btn
                v-if="!isClosed(item.props.status)"
                variant="flat"
                icon
                size="small"
                class="btn--plain pa-0 ma-0"
                @click.stop="takeAction(item.props.id, 'close')"
              >
                <v-icon
                  :size="fontSize"
                >
                  highlight_off
                </v-icon>
              </v-btn>
              <v-btn
                variant="flat"
                icon
                size="small"
                class="btn--plain pa-0 ma-0"
                @click.stop="deleteAlert(item.props.id)"
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
                @click.stop="clipboardCopy(JSON.stringify(item.props, null, 4))"
              >
                <v-icon
                  :size="fontSize"
                >
                  content_copy
                </v-icon>
              </v-btn> -->

              <v-menu
                location="left bottom"
              >
                <template #activator="{props}">
                  <v-btn
                    v-bind="props"
                    variant="flat"
                    icon
                    size="small"
                    class="btn--plain pa-0 ma-0"
                  >
                    <v-icon size="small">
                      more_vert
                    </v-icon>
                  </v-btn>
                </template>

                <v-list>
                  <v-list-subheader>Actions</v-list-subheader>
                  <v-divider />
                  <v-list-item
                    v-for="(action, i) in actions"
                    :key="i"
                    @click.stop="takeAction(item.props.id, action)"
                  >
                    <v-list-item-title>{{ this.$filters.splitCaps(action) }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </td>
        </tr>
      </template>
      <template #no-data>
        <div class="text-center">
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
      id: { title: i18n.global.t('AlertId'), value: 'id' },
      resource: { title: i18n.global.t('Resource'), value: 'resource' },
      event: { title: i18n.global.t('Event'), value: 'event' },
      environment: { title: i18n.global.t('Environment'), value: 'environment' },
      severity: { title: i18n.global.t('Severity'), value: 'severity' },
      correlate: { title: i18n.global.t('Correlate'), value: 'correlate' },
      status: { title: i18n.global.t('Status'), value: 'status' },
      service: { title: i18n.global.t('Service'), value: 'service' },
      group: { title: i18n.global.t('Group'), value: 'group' },
      value: { title: i18n.global.t('Value'), value: 'value', class: 'value-header' },
      title: { title: i18n.global.t('Description'), value: 'text', class: 'text-header' },
      tags: { title: i18n.global.t('Tags'), value: 'tags' },
      attributes: { title: i18n.global.t('Attribute'), value: 'attributes' },
      origin: { title: i18n.global.t('Origin'), value: 'origin' },
      type: { title: i18n.global.t('Type'), value: 'type' },
      createTime: { title: i18n.global.t('CreateTime'), value: 'createTime' },
      timeout: { title: i18n.global.t('Timeout'), value: 'timeout' },
      timeoutLeft: { title: i18n.global.t('TimeoutLeft'), value: 'timeoutLeft' },
      customer: { title: i18n.global.t('Customer'), value: 'customer' },
      duplicateCount: { title: i18n.global.t('Dupl'), value: 'duplicateCount' },
      repeat: { title: i18n.global.t('Repeat'), value: 'repeat' },
      previousSeverity: { title: i18n.global.t('PrevSeverity'), value: 'previousSeverity' },
      trendIndication: { title: i18n.global.t('TrendIndication'), value: 'trendIndication' },
      receiveTime: { title: i18n.global.t('ReceiveTime'), value: 'receiveTime' },
      duration: { title: i18n.global.t('Duration'), value: 'duration' },
      lastReceiveId: { title: i18n.global.t('LastReceiveId'), value: 'lastReceiveId' },
      lastReceiveTime: { title: i18n.global.t('LastReceiveTime'), value: 'lastReceiveTime' },
      note: { title: i18n.global.t('LastNote'), value: 'note', sortable: false }
    },
    details: false,
    selectedId: null,
    multiselect: false,
    timer: null
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
        'font-weight': font['font-weight'],
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
        this.headersMap[c] || { title: this.$filters.capitalize(c), value: 'attributes.' + c }
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
      set(value) {
        this.$store.dispatch('alerts/updateSelected', value)
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
  methods: {
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
      confirm(i18n.global.t('ConfirmDelete')) &&
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
