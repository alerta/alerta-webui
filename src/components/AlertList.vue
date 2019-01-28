<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="alerts"
      :rows-per-page-items="rowsPerPageItems"
      :pagination.sync="pagination"
      class="elevation-1"
      :search="search"
      :loading="isLoading"
      must-sort
      :custom-sort="customSort"
      sort-icon="arrow_drop_down"
    >
      <template slot="items" slot-scope="props">
        <tr
          :style="{'background-color': severityColor(props.item.severity)}"
          @click="selectItem(props.item.id)"
        >
          <td>
            <v-chip small>
              {{ props.item.severity }}
            </v-chip>
          </td>
          <td class="text-xs-right">
            <v-chip small>
              {{ props.item.status }}
            </v-chip>
          </td>
          <td>
            <date-time :value="props.item.lastReceiveTime" format="mediumDate"/>
          </td>
          <td>{{ props.item.environment }}</td>
          <td class="text-xs-right">{{ props.item.service.join(', ') }}</td>
          <td class="text-xs-right">{{ props.item.resource }}</td>
          <td class="text-xs-right">{{ props.item.event }}</td>
          <td class="text-xs-right">{{ props.item.group }}</td>
          <td class="text-xs-right">{{ props.item.value }}</td>
          <td class="text-xs-right text-truncate">{{ props.item.text }}</td>
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
        { text: 'Severity', value: 'severity' },
        { text: 'Status', value: 'status' },
        { text: 'Last Recieve Time', value: 'lastReceiveTime' },
        { text: 'Environment', value: 'environment' },
        { text: 'Service', value: 'service' },
        { text: 'Resource', value: 'resource' },
        { text: 'Event', value: 'event' },
        { text: 'Group', value: 'group' },
        { text: 'Value', value: 'value' },
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
.container.grid-list-md .layout .flex {
  padding: 1px;
}
</style>
