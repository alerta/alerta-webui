<template>
  <div>
    <v-data-table
      :headers="customHeaders"
      :items="history"
      item-key="id"
      :pagination.sync="pagination"
      :total-items="pagination.totalItems"
      :rows-per-page-items="pagination.rowsPerPageItems"
      class="alert-table"
      :class="[ displayDensity ]"
      :style="columnWidths"
      :disable-initial-sort="true"
      sort-icon="arrow_drop_down"
    >
      <template
        slot="items"
        slot-scope="props"
      >
        <tr
          :style="{ 'background-color': severityColor(props.item.severity, props.item.status) }"
          class="hover-lighten"
        >
          <td
            v-for="col in customDataMap"
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
              v-if="col == 'status'"
            >
              <span
                class="label"
                :style="fontStyle"
              >
                {{ props.item.status | capitalize }}

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
              v-if="col == 'updateTime'"
            >
              <date-time
                :value="props.item.updateTime"
                format="mediumDate"
              />
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
            <!-- trendIndication not supported -->
            <!-- only history supported is most recent note -->
          </td>
        </tr>
      </template>
      <template slot="no-data">
        <div class="text-xs-center">
          <span>{{ $t('NoDataAvailable') }}</span>
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
    history: {
      type: Array,
      default: () => []
    }
  },
  data: vm => ({
    search: '',
    alertHeaders: [
      'correlate',
      'createTime',
      'timeoutLeft',
      'duplicateCount',
      'repeat',
      'previousSeverity',
      'trendIndication',
      'receiveTime',
      'duration',
      'lastReceiveId',
      'lastReceiveTime',
      'note'
    ],
    allowedHeaders: [
      'attributes',
      'customer',
      'environment',
      'event',
      'group',
      'href',
      'id',
      'origin',
      'resource',
      'service',
      'severity',
      'status',
      'tags',
      'text',
      'timeout',
      'type',
      'updateTime',
      'user',
      'value'
    ],
    headersMap: {
      id: { text: i18n.t('AlertId'), value: 'id', sortable: false  },
      resource: { text: i18n.t('Resource'), value: 'resource', sortable: false  },
      event: { text: i18n.t('Event'), value: 'event', sortable: false  },
      environment: { text: i18n.t('Environment'), value: 'environment', sortable: false  },
      severity: { text: i18n.t('Severity'), value: 'severity', sortable: false  },
      status: { text: i18n.t('Status'), value: 'status', sortable: false  },
      service: { text: i18n.t('Service'), value: 'service', sortable: false  },
      group: { text: i18n.t('Group'), value: 'group', sortable: false  },
      value: { text: i18n.t('Value'), value: 'value', class: 'value-header', sortable: false  },
      text: { text: i18n.t('Description'), value: 'text', class: 'text-header', sortable: false  },
      updateTime: { text: i18n.t('UpdateTime'), value: 'updateTime', sortable: false  },
      tags: { text: i18n.t('Tags'), value: 'tags', sortable: false  },
      attributes: { text: i18n.t('Attribute'), value: 'attributes', sortable: false  },
      origin: { text: i18n.t('Origin'), value: 'origin', sortable: false  },
      type: { text: i18n.t('Type'), value: 'type', sortable: false  },
      timeout: { text: i18n.t('Timeout'), value: 'timeout', sortable: false  },
      timeoutLeft: { text: i18n.t('TimeoutLeft'), value: 'timeoutLeft', sortable: false  },
      customer: { text: i18n.t('Customer'), value: 'customer', sortable: false  },
    },
    details: false,
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
    rowsPerPage() {
      return this.$store.getters.getPreference('rowsPerPage')
    },
    pagination: {
      get() {
        return this.$store.state.alerts.historyPagination
      },
      set(value) {
        this.$store.dispatch('alerts/setHistoryPagination', value)
      }
    },
    customHeaders() {
      return(this.customDataMap.map(c =>
      {
        return this.headersMap[c] || { text: this.$options.filters.capitalize(c), value: 'attributes.' + c }}))
      return this.allowedHeaders.map(c =>
        this.headersMap[c] || { text: this.$options.filters.capitalize(c), value: 'attributes.' + c }
      )
    },
    customDataMap() {
      return ['updateTime',...this.$config.columns.filter(c => !this.alertHeaders.includes(c))]
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
      let lastModified = item.updateTime
      let expireTime = moment(lastModified).add(item.timeout, 'seconds')
      return expireTime.isAfter() ? expireTime.diff(moment(), 'seconds') : moment.duration()
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
    severityColor(severity, status) {
      const config = this.$store.getters.getConfig('colors')
      return (config.status || {})[status] || config.severity[severity] || 'white'
    },
    isOpen(status) {
      return status == 'open' || status == 'unack' || status == 'NORM' || status == 'UNACK' || status == 'RTNUN'
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
