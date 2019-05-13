<template>
  <div>
    <v-data-table
      v-model="selected"
      :headers="customHeaders"
      :items="alerts"
      :pagination.sync="pagination"
      :rows-per-page-items="pagination.rowsPerPageItems"
      class="alert-table"
      :search="search"
      must-sort
      :custom-sort="customSort"
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
          @mouseover="showIcons = props.item.id"
          @mouseout="showIcons = null"
          @click="selectItem(props.item)"
        >
          <td
            class="text-no-wrap"
          >
            <v-checkbox
              v-if="selectableRows"
              v-model="props.selected"
              primary
              hide-details
              color="gray"
              class="select-box"
              :ripple="false"
              @click.stop
            />
            <v-icon
              v-else-if="props.item.trendIndication == 'moreSevere'"
              class="trend-arrow"
              @click.stop="multiselect = true; props.selected = true"
            >
              arrow_upward
            </v-icon>
            <v-icon
              v-else-if="props.item.trendIndication == 'lessSevere'"
              class="trend-arrow"
              @click.stop="multiselect = true; props.selected = true"
            >
              arrow_downward
            </v-icon>
            <v-icon
              v-else
              class="trend-arrow"
              @click.stop="multiselect = true; props.selected = true"
            >
              remove
            </v-icon>
          </td>
          <td
            v-for="col in $config.columns"
            :key="col"
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
              <span :class="['label', 'label-' + props.item.severity.toLowerCase()]">
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
              <span class="label">
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
              v-if="col == 'value'"
              class="text-no-wrap"
            >
              {{ props.item.value }}
            </span>
            <span
              v-if="col == 'text'"
              class="text-no-wrap"
            >
              <span v-html="props.item.text"></span>
            </span>
            <span
              v-if="col == 'tags'"
            >
              <span
                v-for="tag in props.item.tags"
                :key="tag"
              ><span class="label">{{ tag }}</span>&nbsp;</span>
            </span>
            <span
              v-if="props.item.attributes.hasOwnProperty(col)"
            >
              {{ props.item.attributes[col] }}
            </span>
            <span
              v-if="col == 'origin'"
            >
              {{ props.item.origin }}
            </span>
            <span
              v-if="col == 'type'"
            >
              <span class="label">
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
              {{ props.item.timeout }}
            </span>
            <span
              v-if="col == 'timeoutLeft'"
              class="text-xs-right text-no-wrap"
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
              <span class="label">
                {{ props.item.repeat | capitalize }}
              </span>
            </span>
            <span
              v-if="col == 'previousSeverity'"
            >
              <span :class="['label', 'label-' + props.item.previousSeverity.toLowerCase()]">
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
            <!-- history not supported -->
          </td>
          <td
            :colspan="(showIcons === props.item.id && !selectableRows) ? '1' : '2'"
          >
            <div class="fixed-table">
              <div class="text-truncate">
                <span v-html="props.item.text"></span>
              </div>
            </div>
          </td>

          <td
            v-show="showIcons === props.item.id && !selectableRows"
            class="text-no-wrap"
          >
            <div
              style="display:inline-block;"
            >
              <v-btn
                v-show="isAcked(props.item.status) || isClosed(props.item.status)"
                flat
                icon
                small
                class="btn--plain px-1 mx-0"
                @click.stop="takeAction(props.item.id, 'open')"
              >
                <v-icon
                  size="20px"
                >
                  refresh
                </v-icon>
              </v-btn>

              <v-btn
                v-show="!isWatched(props.item.tags)"
                flat
                icon
                small
                class="btn--plain px-1 mx-0"
                @click.stop="watchAlert(props.item.id)"
              >
                <v-icon
                  size="20px"
                >
                  visibility
                </v-icon>
              </v-btn>
              <v-btn
                v-show="isWatched(props.item.tags)"
                flat
                icon
                small
                class="btn--plain px-1 mx-0"
                @click.stop="unwatchAlert(props.item.id)"
              >
                <v-icon
                  size="20px"
                >
                  visibility_off
                </v-icon>
              </v-btn>

              <v-btn
                v-show="isOpen(props.item.status)"
                flat
                icon
                small
                class="btn--plain px-1 mx-0"
                @click.stop="takeAction(props.item.id, 'ack')"
              >
                <v-icon
                  size="20px"
                >
                  check
                </v-icon>
              </v-btn>
              <v-btn
                v-show="isAcked(props.item.status)"
                flat
                icon
                small
                class="btn--plain px-1 mx-0"
                @click.stop="takeAction(props.item.id, 'unack')"
              >
                <v-icon
                  size="20px"
                >
                  undo
                </v-icon>
              </v-btn>

              <v-btn
                v-show="isOpen(props.item.status) || isAcked(props.item.status)"
                flat
                icon
                small
                class="btn--plain px-1 mx-0"
                @click.stop="shelveAlert(props.item.id)"
              >
                <v-icon
                  size="20px"
                >
                  schedule
                </v-icon>
              </v-btn>
              <v-btn
                v-show="isShelved(props.item.status)"
                flat
                icon
                small
                class="btn--plain px-1 mx-0"
                @click.stop="takeAction(props.item.id, 'unshelve')"
              >
                <v-icon
                  size="20px"
                >
                  restore
                </v-icon>
              </v-btn>

              <v-btn
                v-show="!isClosed(props.item.status)"
                flat
                icon
                small
                class="btn--plain px-1 mx-0"
                @click.stop="takeAction(props.item.id, 'close')"
              >
                <v-icon
                  size="20px"
                >
                  highlight_off
                </v-icon>
              </v-btn>
              <v-btn
                flat
                icon
                small
                class="btn--plain px-1 mx-0"
                @click.stop="deleteAlert(props.item.id)"
              >
                <v-icon
                  size="20px"
                >
                  delete
                </v-icon>
              </v-btn>

              <v-menu
                bottom
                left
              >
                <v-btn
                  slot="activator"
                  flat
                  icon
                  small
                  class="btn--plain px-1 mx-0"
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
    </v-data-table>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import get from 'lodash/get'
import DateTime from './lib/DateTime'
import moment from 'moment'

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
  data: () => ({
    search: '',
    headersMap: {
      id: { text: 'Alert ID', value: 'id' },
      resource: { text: 'Resource', value: 'resource' },
      event: { text: 'Event', value: 'event' },
      environment: { text: 'Environment', value: 'environment' },
      severity: { text: 'Severity', value: 'severity' },
      correlate: { text: 'Correlate', value: 'correlate' },
      status: { text: 'Status', value: 'status' },
      service: { text: 'Service', value: 'service' },
      group: { text: 'Group', value: 'group' },
      value: { text: 'Value', value: 'value' },
      text: { text: 'Description', value: 'text' },
      tags: { text: 'Tags', value: 'tags' },
      attributes: { text: 'Attribute', value: 'attributes' },
      origin: { text: 'Origin', value: 'origin' },
      type: { text: 'Type', value: 'type' },
      createTime: { text: 'Create Time', value: 'createTime' },
      timeout: { text: 'Timeout', value: 'timeout' },
      timeoutLeft: { text: 'Timeout', value: 'timeoutLeft' },
      customer: { text: 'Customer', value: 'customer' },
      duplicateCount: { text: 'Dupl.', value: 'duplicateCount' },
      repeat: { text: 'Repeat', value: 'repeat' },
      previousSeverity: { text: 'Prev. Severity', value: 'previousSeverity' },
      trendIndication: { text: 'Trend Indication', value: 'trendIndication' },
      receiveTime: { text: 'Receive Time', value: 'receiveTime' },
      lastReceiveId: { text: 'Last Receive Id', value: 'lastReceiveId' },
      lastReceiveTime: { text: 'Last Receive Time', value: 'lastReceiveTime' },
    },
    details: false,
    selectedId: null,
    showIcons: null,
    multiselect: false,
    timer: null
  }),
  computed: {
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
      let headers = this.$config.columns
        .map(c => this.headersMap[c] || { text: this.$options.filters.capitalize(c), value: 'attributes.' + c })
      headers.push({ text: 'Description', value: 'text' })  // 'text' must be last column
      if (this.showIcons) {
        headers.push({ text: '', value: 'id' })
      }
      return headers
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
    shelveTimeout() {
      return this.$store.getters.getPreference('shelveTimeout')
    },
    username() {
      return this.$store.getters['auth/getUsername']
    }
  },
  methods: {
    timeoutLeft(item) {
      let lastModified = this.isShelved(item.status) && item.updateTime ? item.updateTime : item.lastReceiveTime
      let expireTime = moment(lastModified).add(item.timeout, 'seconds')
      return expireTime.isAfter() ? expireTime.diff(moment(), 'seconds') : moment.duration()
    },
    customSort(items, index, isDescending) {
      if (!index) return items

      const reverseSort = isDescending ? -1 : 1

      // sort by severity then lastReceiveTime (default)
      if (index == 'default') {
        return items.sort((a, b) => {
          if (a.severity == b.severity) {
            const sortBy = this.$config.sort_by.replace(/^\-/,'')
            const reverseTime = this.$config.sort_by.startsWith('-') ? -1 : 1
            return (b[sortBy] - a[sortBy]) * reverseTime
          }
          const severityCodeA = this.$config.severity[a.severity]
          const severityCodeB = this.$config.severity[b.severity]
          if (severityCodeA < severityCodeB) return reverseSort * 1
          if (severityCodeA > severityCodeB) return reverseSort * -1
          return 0
        })
      }

      // sort by severity code
      if (index == 'severity') {
        return items.sort((a, b) => {
          const severityCodeA = this.$config.severity[a.severity]
          const severityCodeB = this.$config.severity[b.severity]
          if (severityCodeA > severityCodeB) return reverseSort * 1
          if (severityCodeA < severityCodeB) return reverseSort * -1
          return 0
        })
      }

      // sort by timeout time remaining
      if (index == 'timeout') {
        return items.sort((a, b) => {
          const timeLeftA = this.timeoutLeft(a)
          const timeLeftB = this.timeoutLeft(b)
          if (timeLeftA > timeLeftB) return reverseSort * 1
          if (timeLeftA < timeLeftB) return reverseSort * -1
          return 0
        })
      }

      // use default sort
      return items.sort((a, b) => {
        const aValue = get(a, index)
        const bValue = get(b, index)
        if (aValue === bValue) {
          return 0
        } else if (aValue == null) {
          return 1
        } else if (bValue == null) {
          return -1
        } else if (typeof aValue == 'string') {
          return aValue.localeCompare(bValue) * reverseSort
        } else if (typeof aValue == 'number') {
          return (aValue - bValue) * reverseSort
        } else {
          return (
            aValue.join('').localeCompare(bValue.join('')) * reverseSort
          )
        }
      })
    },
    severityColor(severity) {
      return this.$store.getters.getConfig('colors').severity[severity]
    },
    selectItem(item) {
      this.$emit('set-alert', item)
    },
    isOpen(status) {
      return status == 'open' || status == 'NORM'
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
        .dispatch('alerts/takeAction', [id, action, 'operator action short-cut'])
    }, 200, {leading: true, trailing: false}),
    shelveAlert: debounce(function(id) {
      this.$store
        .dispatch('alerts/takeAction', [
          id,
          'shelve',
          'operator shelve short-cut',
          this.shelveTimeout * 3600
        ])
    }, 200, {leading: true, trailing: false}),
    watchAlert: debounce(function(id) {
      this.$store
        .dispatch('alerts/watchAlert', id)
    }, 200, {leading: true, trailing: false}),
    unwatchAlert: debounce(function(id) {
      this.$store
        .dispatch('alerts/unwatchAlert', id)
    }, 200, {leading: true, trailing: false}),
    deleteAlert: debounce(function(id) {
      confirm('Are you sure you want to delete this item?') &&
        this.$store.dispatch('alerts/deleteAlert', id)
    }, 200, {leading: true, trailing: false}),
  }
}
</script>

<style>
.alert-table .v-table th, td {
  padding: 0px 5px !important;
}

.alert-table .v-table tbody td {
  border-top: 1px solid rgb(221, 221, 221);
  height: 42px;
  font-family: 'Sintony', sans-serif;
  font-size: 14px;
}

.fixed-table {
  display: table;
  table-layout: fixed;
  width: 100%;
}

i.trend-arrow {
  font-size: 20px;
  width: 24px !important;
}

div.select-box {
  font-size: 20px;
  width: 24px !important;
}

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
</style>
