<template>
  <div>
    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="alerts"
      :rows-per-page-items="rowsPerPageItems"
      :pagination.sync="pagination"
      class="alert-table"
      :search="search"
      must-sort
      :custom-sort="customSort"
      sort-icon="arrow_drop_down"
    >
      <template
        slot="items"
        slot-scope="props"
      >
        <tr
          :style="{ 'background-color': severityColor(props.item.severity) }"
          @mouseover="showIcons = props.item.id"
          @mouseout="showIcons = null"
        >
          <td style="white-space: nowrap">
            <v-checkbox
              v-if="selectableRows"
              v-model="props.selected"
              primary
              hide-details
              color="gray"
              class="select-box"
              :ripple="false"
            />
            <v-icon
              v-else-if="props.item.trendIndication == 'moreSevere'"
              class="trend-arrow"
              @click="multiselect = true; props.selected = true"
            >
              arrow_upward
            </v-icon>
            <v-icon
              v-else-if="props.item.trendIndication == 'lessSevere'"
              class="trend-arrow"
              @click="multiselect = true; props.selected = true"
            >
              arrow_downward
            </v-icon>
            <v-icon
              v-else
              class="trend-arrow"
              @click="multiselect = true; props.selected = true"
            >
              remove
            </v-icon>
          </td>
          <td>
            <span :class="['label', 'label-' + props.item.severity]">
              {{ props.item.severity | capitalize }}
            </span>
          </td>
          <td>
            <span class="label">
              {{ props.item.status | capitalize }}
            </span>
          </td>
          <td>
            <date-time
              :value="props.item.lastReceiveTime"
              format="mediumDate"
            />
          </td>
          <td>{{ props.item.duplicateCount }}</td>
          <td>{{ props.item.environment }}</td>
          <td>{{ props.item.service.join(', ') }}</td>
          <td>{{ props.item.resource }}</td>
          <td>{{ props.item.event }}</td>
          <td>{{ props.item.group }}</td>
          <td class="text-no-wrap">
            {{ props.item.value }}
          </td>
          <td :colspan="(showIcons === props.item.id && !selectableRows) ? '1' : '2'">
            <div class="fixed-table">
              <div class="text-truncate">
                {{ props.item.text }}
              </div>
            </div>
          </td>
          <td
            v-show="showIcons === props.item.id && !selectableRows"
            style="white-space: nowrap"
          >
            <div
              style="display:inline-block;"
            >
              <v-btn
                v-show="props.item.status == 'ack' || props.item.status == 'closed'"
                flat
                icon
                small
                class="btn--plain px-1 mx-0"
                @click="takeAction(props.item.id, 'open')"
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
                @click="watchAlert(props.item.id)"
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
                @click="unwatchAlert(props.item.id)"
              >
                <v-icon
                  size="20px"
                >
                  visibility_off
                </v-icon>
              </v-btn>

              <v-btn
                v-show="props.item.status == 'open'"
                flat
                icon
                small
                class="btn--plain px-1 mx-0"
                @click="takeAction(props.item.id, 'ack')"
              >
                <v-icon
                  size="20px"
                >
                  check
                </v-icon>
              </v-btn>
              <v-btn
                v-show="props.item.status == 'ack'"
                flat
                icon
                small
                class="btn--plain px-1 mx-0"
                @click="takeAction(props.item.id, 'unack')"
              >
                <v-icon
                  size="20px"
                >
                  undo
                </v-icon>
              </v-btn>

              <v-btn
                v-show="props.item.status == 'open' || props.item.status == 'ack'"
                flat
                icon
                small
                class="btn--plain px-1 mx-0"
                @click="shelveAlert(props.item.id)"
              >
                <v-icon
                  size="20px"
                >
                  schedule
                </v-icon>
              </v-btn>
              <v-btn
                v-show="props.item.status == 'shelved'"
                flat
                icon
                small
                class="btn--plain px-1 mx-0"
                @click="takeAction(props.item.id, 'unshelve')"
              >
                <v-icon
                  size="20px"
                >
                  restore
                </v-icon>
              </v-btn>

              <v-btn
                v-show="props.item.status != 'closed'"
                flat
                icon
                small
                class="btn--plain px-1 mx-0"
                @click="takeAction(props.item.id, 'close')"
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
                @click="deleteAlert(props.item.id)"
              >
                <v-icon
                  size="20px"
                >
                  delete
                </v-icon>
              </v-btn>

              <v-btn
                flat
                icon
                small
                class="btn--plain px-1 mx-0"
              >
                <v-icon small>
                  more_vert
                </v-icon>
              </v-btn>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import DateTime from './DateTime'

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
  data() {
    return {
      page: 1,
      rowsPerPageItems: [10, 20, 30, 40],
      pagination: {
        sortBy: 'multi',
        descending: true,
        rowsPerPage: 20
      },
      // totalItems: number,
      search: '',
      headers: [
        { text: '', value: 'trendIndication', width: '1%', sortable: false },
        { text: 'Severity', value: 'severity', width: '5%' },
        { text: 'Status', value: 'status', width: '3%' },
        { text: 'Last Recieve Time', value: 'lastReceiveTime', width: '5%' },
        { text: 'Dupl.', value: 'duplicateCount', width: '3%' },
        { text: 'Environment', value: 'environment', width: '5%' },
        { text: 'Service', value: 'service', width: '10%' },
        { text: 'Resource', value: 'resource', width: '10%' },
        { text: 'Event', value: 'event', width: '10%' },
        { text: 'Group', value: 'group', width: '7%' },
        { text: 'Value', value: 'value', width: '5%' },
        { text: 'Description', value: 'text' },
        { text: '', value: '' },
      ],
      details: false,
      selectedId: null,
      showIcons: null,
      multiselect: false,
      timer: null
    }
  },
  computed: {
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
      return this.$store.getters['auth/getPayload'].name
    }
  },
  methods: {
    customSort(items, index, isDescending) {
      if (!index) return items

      const reverseSort = isDescending ? -1 : 1

      // sort by severity then lastReceiveTime
      if (index == 'multi') {
        return items.sort((a, b) => {
          if (a.severity == b.severity) {
            return b.lastReceiveTime - a.lastReceiveTime
          }
          const severityCodeA = this.$config.severity[a.severity.toLowerCase()]
          const severityCodeB = this.$config.severity[b.severity.toLowerCase()]
          if (severityCodeA < severityCodeB) return reverseSort * 1
          if (severityCodeA > severityCodeB) return reverseSort * -1
          return 0
        })
      }

      // sort by severity code
      if (index == 'severity') {
        return items.sort((a, b) => {
          const severityCodeA = this.$config.severity[a.severity.toLowerCase()]
          const severityCodeB = this.$config.severity[b.severity.toLowerCase()]
          if (severityCodeA > severityCodeB) return reverseSort * 1
          if (severityCodeA < severityCodeB) return reverseSort * -1
          return 0
        })
      }

      // use default sort
      return items.sort((a, b) => {
        if (typeof a[index] == 'string') {
          return a[index].localeCompare(b[index]) * reverseSort
        } else {
          return (
            a[index].join('').localeCompare(b[index].join('')) * reverseSort
          )
        }
      })
    },
    severityColor(severity) {
      return this.$store.getters.getConfig('colors').severity[severity.toLowerCase()]
    },
    selectItem(itemId) {
      this.$router.push({ name: 'alert', params: { id: itemId } })
    },
    takeAction(id, action) {
      this.$store
        .dispatch('alerts/takeAction', [id, action, 'operator action short-cut'])
    },
    shelveAlert(id) {
      this.$store
        .dispatch('alerts/takeAction', [
          id,
          'shelve',
          'operator shelve short-cut',
          this.shelveTimeout
        ])
    },
    isWatched(tags) {
      return tags ? tags.indexOf(`watch:${this.username}`) > -1 : false
    },
    watchAlert(id) {
      this.$store
        .dispatch('alerts/tagAlert', [id, { tags: [`watch:${this.username}`] } ])
    },
    unwatchAlert(id) {
      this.$store
        .dispatch('alerts/untagAlert', [id, { tags: [`watch:${this.username}`] } ])
    },
    deleteAlert(id) {
      confirm('Are you sure you want to delete this item?') &&
        this.$store.dispatch('alerts/deleteAlert', id)
    }
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

.no-wrap {
  white-space: nowrap;
  overflow: hidden;
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
