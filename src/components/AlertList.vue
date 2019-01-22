<template>
  <div>

    <alert-list-side-nav
      v-if="selectedItem"
      :value="sidenav"
      :item="selectedItem"
    />

    <audio v-if="playSound && !isMute" :src="$config.audio.new" autoplay></audio>

    <v-data-table
      :headers="headers"
      :items="alerts"
      :rows-per-page-items="rowsPerPageItems"
      :pagination.sync="pagination"
      class="elevation-1"
      :search="search"
      :loading="isLoading"
      must-sort
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
import AlertListSideNav from './AlertListSideNav'
import DateTime from './DateTime'

export default {
  components: {
    AlertListSideNav,
    DateTime
  },
  props: {
    filter: null
  },
  data() {
    return {
      page: 1,
      rowsPerPageItems: [10, 20, 30, 40],
      pagination: {
        sortBy: 'lastReceiveTime',
        descending: true,
        rowsPerPage: 20
      },
      // totalItems: number,
      search: '',
      sidenav: false,
      playSound: false,
      statusFilter: ['open', 'unknown'],
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
      selectedId: null,
      timer: null
    }
  },
  computed: {
    alerts() {
      if (this.filter) {
        return this.$store.getters['alerts/alerts'].filter(
          alert => alert.environment === this.filter.environment
        )
      } else {
        return this.$store.getters['alerts/alerts']
      }
    },
    isLoading() {
      return this.$store.state.keys.isLoading
    },
    selectedItem() {
      return this.alerts.filter(a => a.id == this.selectedId)[0]
    },
    isMute() {
      return this.$store.getters.getPreference('isMute')
    },
    refreshInterval() {
      return (
        this.$store.getters.getPreference('refreshInterval') ||
        this.$store.getters.getConfig('refresh_interval')
      )
    },
    autoRefresh() {
      return true // FIXME: autoRefresh setting comes from server in alert response
    },
    refresh() {
      return this.$store.state.refresh
    }
  },
  watch: {
    alerts(current, old) {
      if (
        old &&
        current.length > old.length &&
        this.statusFilter.includes('open')
      ) {
        this.playSound = true
      } else {
        this.playSound = false
      }
    },
    refresh(val) {
      val || this.getAlerts()
    }
  },
  created() {
    this.getAlerts()
    if (this.autoRefresh) {
      this.timer = setInterval(
        () => this.getAlerts(),
        1000 * this.refreshInterval
      )
    }
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    getAlerts() {
      this.$store.dispatch('alerts/getAlerts')
    },
    severityColor(severity) {
      return this.$store.getters.getConfig('colors').severity[severity]
    },
    selectItem(itemId) {
      this.selectedId = itemId
      this.sidenav = !this.sidenav
    }
  }
}
</script>

<style>
.container.grid-list-md .layout .flex {
  padding: 1px;
}
</style>
