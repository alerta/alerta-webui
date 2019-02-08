<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="alerts"
      :rows-per-page-items="rowsPerPageItems"
      :pagination.sync="pagination"
      class="elevation-1 alert-table"
      :search="search"
      :loading="isLoading"
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
          @click="selectItem(props.item.id)"
        >
          <td style="white-space: nowrap">
            <v-icon
              v-if="props.item.trendIndication == 'moreSevere'"
              class="trend-arrow"
              small
            >
              arrow_upward
            </v-icon>
            <v-icon
              v-else-if="props.item.trendIndication == 'lessSevere'"
              class="trend-arrow"
              small
            >
              arrow_downward
            </v-icon>
            <v-icon
              v-else
              class="trend-arrow"
              small
            >
              remove
            </v-icon>&nbsp;
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
          <td>{{ props.item.environment }}</td>
          <td>{{ props.item.service.join(', ') }}</td>
          <td>{{ props.item.resource }}</td>
          <td>{{ props.item.event }}</td>
          <td>{{ props.item.group }}</td>
          <td>{{ props.item.value }}</td>
          <td class="text-truncate">
            {{ props.item.text }}
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
        { text: 'Severity', value: 'severity', width: '1%' },
        { text: 'Status', value: 'status', width: '1%' },
        { text: 'Last Recieve Time', value: 'lastReceiveTime', width: '1%' },
        { text: 'Environment', value: 'environment', width: '1%' },
        { text: 'Service', value: 'service', width: '1%' },
        { text: 'Resource', value: 'resource', width: '1%' },
        { text: 'Event', value: 'event', width: '1%' },
        { text: 'Group', value: 'group', width: '1%' },
        { text: 'Value', value: 'value', width: '1%' },
        { text: 'Description', value: 'text' }
      ],
      details: false,
      selectedId: null,
      timer: null
    }
  },
  computed: {
    isLoading() {
      return this.$store.state.alerts.isLoading
    },
    selectedItem() {
      return this.alerts.filter(a => a.id == this.selectedId)[0]
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
      return this.$store.getters.getConfig('colors').severity[severity]
    },
    selectItem(itemId) {
      this.$router.push({ name: 'alert', params: { id: itemId } })
    }
  }
}
</script>

<style>
.alert-table .v-table tbody tr td {
  border-top: 1px solid #ddd;
  margin: 0;
  font-size: 12px;
  line-height: 14px;
  font-weight: normal;
}
.alert-table .v-table tbody td {
  height: 34px;
}

.trend-arrow {
  font-weight: bold;
}

.label {
  font-size: 10.998px;
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
</style>
