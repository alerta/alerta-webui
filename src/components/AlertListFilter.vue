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
            <span class="body-2">Date/Time</span>
            <v-select
              v-model="filterDateRange"
              :items="dateRanges"
              name="dateRange"
              label="Date/Time"
              solo
              flat
              prepend-inner-icon="schedule"
              item-value="range"
              hide-details
            />
          </v-flex>

          <v-flex
            v-if="selectRange"
            xs12
          >
            <v-menu
              v-model="menu1"
              :close-on-content-click="false"
              :nudge-right="40"
              lazy
              transition="scale-transition"
              offset-y
              full-width
              max-width="290px"
              min-width="290px"
            >
              <v-text-field
                slot="activator"
                v-model="startDateTime"
                label="Start Date & Time"
                prepend-inner-icon="event"
                outline
                hide-details
              />
              <v-date-picker
                v-model="period.startDate"
                no-title
                @input="menu1 = false"
              />
            </v-menu>
          </v-flex>
          <v-flex
            v-if="selectRange"
            xs12
          >
            <v-menu
              v-model="menu2"
              :close-on-content-click="false"
              :nudge-right="40"
              lazy
              transition="scale-transition"
              offset-y
              full-width
              max-width="290px"
              min-width="290px"
            >
              <v-text-field
                slot="activator"
                v-model="endDateTime"
                label="End Date & Time"
                prepend-inner-icon="event"
                outline
                hide-details
              />
              <v-date-picker
                v-model="period.endDate"
                no-title
                @input="menu2 = false"
              />
            </v-menu>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card>
    <v-card flat>
      <v-flex
        xs12
      >
        <v-card-actions>
          <v-btn
            v-if="selectRange"
            color="blue darken-1"
            @click="setDateRange"
          >
            Apply
          </v-btn>
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
import moment from 'moment'

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
      { text: '12 hours', range: [3600 * 12, null] },
      { divider: true },
      { text: 'Select Range', range: [-1, -1] },
    ],
    selectRange: false,
    menu1: false,
    menu2: false,
    period: {
      startDate: null,
      startTime: null,
      endDate: null,
      endTime: null
    },
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
        return typeof this.$store.state.alerts.filter.dateRange[0] == 'string'
          ? [-1, -1]
          : this.$store.state.alerts.filter.dateRange
      },
      set(value) {
        if (value[0] === -1) {
          this.selectRange = true
        } else {
          this.selectRange = false
          this.$store.dispatch('alerts/setFilter', {
            dateRange: value
          }).then(() => this.$store.dispatch('alerts/getAlerts'))
        }
      }
    },
    startDateTime() {
      return `${this.period.startDate} ${this.period.startTime}`
    },
    endDateTime() {
      return `${this.period.endDate} ${this.period.endTime}`
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
    this.period = this.defaultTimes()
  },
  methods: {
    defaultTimes() {
      let now = moment().utc()
      return {
        startDate: now.format('YYYY-MM-DD'),
        startTime: now.format('HH:mm'),
        endDate: now.format('YYYY-MM-DD'),
        endTime: now.format('HH:mm')
      }
    },
    getCustomers() {
      this.$store.dispatch('customers/getCustomers')
    },
    getServices() {
      this.$store.dispatch('alerts/getServices')
    },
    getGroups() {
      this.$store.dispatch('alerts/getGroups')
    },
    toISODate(date, time) {
      return new Date(date + ' ' + time).toISOString()
    },
    setDateRange() {
      this.$store.dispatch('alerts/setFilter', {
        dateRange: [
          this.toISODate(
            this.period.startDate,
            this.period.startTime
          ),
          this.toISODate(
            this.period.endDate,
            this.period.endTime
          )
        ]
      }).then(() => this.$store.dispatch('alerts/getAlerts'))
    },
    reset() {
      this.selectRange = false
      this.$store.dispatch('alerts/resetFilter')
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style></style>
