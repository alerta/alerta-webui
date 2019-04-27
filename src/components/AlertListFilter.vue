<template>
  <v-navigation-drawer
    :value="sidesheet"
    clipped
    disable-resize-watcher
    absolute
    hide-overlay
    width="300"
    right
  >
    <v-card tile>
      <v-toolbar
        :color="isDark ? '#616161' : '#eeeeee'"
        card
        dense
      >
        <v-toolbar-title>
          Filters
        </v-toolbar-title>
        <v-spacer />
        <v-toolbar-items />
        <v-menu
          bottom
          right
          offset-y
        >
          <v-btn
            slot="activator"
            icon
            @click="close"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-menu>
      </v-toolbar>

      <v-container
        fluid
        grid-list-xl
      >
        <v-layout
          align-center
          wrap
        >
          <v-flex
            xs12
          >
            <v-text-field
              v-model="filterText"
              label="Search"
              prepend-inner-icon="search"
              outline
              dense
              clearable
              hint="Filter results by text search"
              persistent-hint
            />
          </v-flex>

          <v-flex
            xs12
          >
            <v-select
              v-model="filterStatus"
              :items="statusList"
              small-chips
              placeholder="All statuses"
              label="Status"
              multiple
              outline
              dense
              hint="Choose one or more status"
              persistent-hint
            />
          </v-flex>

          <v-flex
            v-if="$config.customer_views"
            xs12
          >
            <v-select
              v-model="filterCustomer"
              :items="currentCustomers"
              :menu-props="{ maxHeight: '400' }"
              placeholder="All customers"
              label="Customer"
              multiple
              outline
              dense
              hint="Choose one or more customer"
              persistent-hint
            />
          </v-flex>

          <v-flex
            xs12
          >
            <v-select
              v-model="filterService"
              :items="currentServices"
              :menu-props="{ maxHeight: '400' }"
              placeholder="All services"
              label="Service"
              multiple
              outline
              dense
              hint="Choose one or more service"
              persistent-hint
            />
          </v-flex>

          <v-flex
            xs12
          >
            <v-select
              v-model="filterGroup"
              :items="currentGroups"
              :menu-props="{ maxHeight: '400' }"
              placeholder="All groups"
              label="Group"
              multiple
              outline
              dense
              hint="Choose one or more group"
              persistent-hint
            />
          </v-flex>

          <v-flex
            xs12
          >
            <v-select
              v-model="filterDateRange"
              :items="dateRanges"
              name="dateRange"
              label="Date/Time"
              outline
              item-text="text"
              item-value="range"
            />
          </v-flex>
        </v-layout>
      </v-container>
    </v-card>
    <v-card flat>
      <v-flex
        xs12
      >
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="blue darken-1"
            flat
            @click="reset"
          >
            Reset
          </v-btn>
        </v-card-actions>
      </v-flex>
    </v-card>
  </v-navigation-drawer>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data: vm => ({
    sidesheet: vm.value,
    active: null,
    pagination: {
      rowsPerPage: 10,
      sortBy: 'updateTime'
    },
    headers: [
      { text: 'Alert ID', value: 'id' },
      { text: 'Update Time', value: 'updateTime' },
      { text: 'Severity', value: 'severity' },
      { text: 'Status', value: 'status' },
      { text: 'Type', value: 'type' },
      { text: 'Event', value: 'event' },
      { text: 'Value', value: 'value' },
      { text: 'Text', value: 'text' }
    ],
    dateRanges: [
      { text: 'Latest', range: [null, null] },
      { text: '1 hour', range: [3600, null] },
      { text: '6 hours', range: [3600 * 6, null] },
      { text: '12 hours', range: [3600 * 12, null] }
    ]
  }),
  computed: {
    isDark() {
      return this.$store.getters.getPreference('isDark')
    },
    history() {
      return this.item.history.map((h, index) => ({ index: index, ...h }))
    },
    shelveTimeout() {
      return this.$store.getters.getPreference('shelveTimeout')
    },
    isWatched() {
      const tag = `watch:${this.username}`
      return this.item.tags.indexOf(tag) > -1
    },
    statusList() {
      // FIXME - remove defaultStatusMap from v7.0 onwards
      let defaultStatusMap = {
        'open': 'A',
        'assign': 'B',
        'ack': 'C',
        'shelved': 'D',
        'blackout': 'E',
        'closed': 'F',
        'expired': 'G',
        'unknown': 'H'
      }
      let statusMap = this.$config.alarm_model.status || defaultStatusMap
      return Object.keys(statusMap).sort((a, b) => {
        return statusMap[a].localeCompare(statusMap[b])
      })
    },
    currentCustomers() {
      return this.$store.getters['customers/customers']
    },
    currentServices() {
      return this.$store.getters['alerts/services']
    },
    currentGroups() {
      return this.$store.getters['alerts/groups']
    },
    filterText: {
      get() {
        return this.$store.state.alerts.filter.text
      },
      set(value) {
        this.$store.dispatch('alerts/setFilter', {
          text: value
        })
      }
    },
    filterStatus: {
      get() {
        return this.$store.state.alerts.filter.status
      },
      set(value) {
        this.$store.dispatch('alerts/setFilter', {
          status: value.length > 0 ? value : null
        }).then(() => this.$store.dispatch('alerts/getAlerts'))
      }
    },
    filterCustomer: {
      get() {
        return this.$store.state.alerts.filter.customer
      },
      set(value) {
        this.$store.dispatch('alerts/setFilter', {
          customer: value.length > 0 ? value : null
        }).then(() => this.$store.dispatch('alerts/getAlerts'))
      }
    },
    filterService: {
      get() {
        return this.$store.state.alerts.filter.service
      },
      set(value) {
        this.$store.dispatch('alerts/setFilter', {
          service: value.length > 0 ? value : null
        }).then(() => this.$store.dispatch('alerts/getAlerts'))
      }
    },
    filterGroup: {
      get() {
        return this.$store.state.alerts.filter.group
      },
      set(value) {
        this.$store.dispatch('alerts/setFilter', {
          group: value.length > 0 ? value : null
        }).then(() => this.$store.dispatch('alerts/getAlerts'))
      }
    },
    filterDateRange: {
      get() {
        return this.$store.state.alerts.filter.dateRange
      },
      set(value) {
        this.$store.dispatch('alerts/setFilter', {
          dateRange: value
        }).then(() => this.$store.dispatch('alerts/getAlerts'))
      }
    },
    username() {
      return this.$store.getters['auth/getUsername']
    }
  },
  watch: {
    value(val) {
      this.sidesheet = val
    }
  },
  created() {
    this.getCustomers()
    this.getServices()
    this.getGroups()
  },
  methods: {
    getCustomers() {
      this.$store.dispatch('customers/getCustomers')
    },
    getServices() {
      this.$store.dispatch('alerts/getServices')
    },
    getGroups() {
      this.$store.dispatch('alerts/getGroups')
    },
    reset() {
      this.$store.dispatch('alerts/resetFilter')
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style></style>
