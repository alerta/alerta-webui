<template>
  <v-navigation-drawer
    :model-value="sidesheet"
    disable-resize-watcher
    absolute
    :scrim="false"
    width="300"
    location="end"
    temporary
  >
    <v-card rounded="0">
      <v-toolbar
        :color="isDark ? '#616161' : '#eeeeee'"
        card
        density="default"
      >
        <v-toolbar-title>
          {{ $t('Filters') }}
        </v-toolbar-title>
        <v-spacer />
        <v-toolbar-items />
        <v-menu
          location="bottom"
          end
          offset
        >
          <template #activator="{props}">
            <v-btn
              v-bind="props"
              icon
              @click="close"
            >
              <v-icon>close</v-icon>
            </v-btn>
          </template>
        </v-menu>
      </v-toolbar>

      <v-container
        fluid
        grid-list-xl
      >
        <v-row
          align-center
          wrap
        >
          <v-col
            xs="12"
            sm="12"
            class="pb-0"
          >
            <v-text-field
              v-model="filterText"
              :label="$t('Search')"
              prepend-inner-icon="search"
              variant="outlined"
              density="default"
              clearable
              :hint="$t('FilterDescription')"
              persistent-hint
            />
          </v-col>

          <v-col
            xs="12"
            sm="12"
            class="pb-0"
          >
            <v-autocomplete
              v-model="filterEnvironment"
              :items="allowedEnvironments"
              :menu-props="{ maxHeight: '400' }"
              :placeholder="$t('AllEnvironments')"
              :label="$t('Environment')"
              multiple
              variant="outlined"
              density="default"
              :hint="$t('EnvironmentDescription')"
              persistent-hint
            />
          </v-col>

          <v-col
            xs="12"
            sm="12"
            class="pb-0"
          >
            <v-select
              v-model="filterSeverity"
              :items="severityList"              
              :label="$t('Severity')"
              multiple
              variant="outlined"
              density="default"
              :hint="$t('SeverityDescription')"
              persistent-hint
            />
          </v-col>

          <v-col
            xs="12"
            sm="12"
            class="pb-0"
          >
            <v-select
              v-model="filterStatus"
              :items="statusList"
              :placeholder="$t('AllStatuses')"
              :label="$t('Status')"
              multiple
              variant="outlined"
              density="default"
              :hint="$t('StatusDescription')"
              persistent-hint
            />
          </v-col>

          <v-col
            v-if="$config.customer_views"
            xs="12"
            sm="12"
            class="pb-0"
          >
            <v-select
              v-model="filterCustomer"
              :items="currentCustomers"
              :menu-props="{ maxHeight: '400' }"
              :placeholder="$t('AllCustomers')"
              :label="$t('Customer')"
              multiple
              variant="outlined"
              density="default"
              :hint="$t('CustomerDescription')"
              persistent-hint
            />
          </v-col>

          <v-col
            xs="12"
            sm="12"
            class="pb-0"
          >
            <v-autocomplete
              v-model="filterService"
              :items="currentServices"
              :menu-props="{ maxHeight: '400' }"
              :placeholder="$t('AllServices')"
              :label="$t('Service')"
              multiple
              variant="outlined"
              density="default"
              :hint="$t('ServiceDescription')"
              persistent-hint
            />
          </v-col>

          <v-col
            xs="12"
            sm="12"
            class="pb-0"
          >
            <v-select
              v-model="filterGroup"
              :items="currentGroups"
              :menu-props="{ maxHeight: '400' }"
              :label="$t('Group')"
              multiple
              variant="outlined"
              density="default"
              :hint="$t('GroupDescription')"
              persistent-hint
            />
          </v-col>

          <v-col
            xs="12"
            sm="12"

            class="pb-0"
          >
            <span class="text-body-2">{{ $t('DateTime') }}</span>
            <v-select
              v-model="filterDateRange"
              :items="dateRanges"
              name="dateRange"
              :label="$t('DateTime')"
              variant="solo"
              prepend-inner-icon="schedule"
              item-title="text"
              item-value="range"
              hide-details
            />
          </v-col>

          <v-col
            v-show="showDateRange"
            xs="8"
            sm="8"
            class="pb-0 pr-0"
          >
            <v-text-field
              v-model="period.startDate"
              :label="$t('StartDate')"
              prepend-inner-icon="event"
              variant="outlined"
              hide-details
              @click:prepend-inner="menu1 = !menu1"
            />
          </v-col>

          <v-col
            v-show="showDateRange"
            xs="4"
            sm="4"
            class="pb-0 pl-1"
          >
            <v-text-field
              v-model="period.startTime"
              :label="$t('Time')"
              variant="outlined"
              hide-details
            />
          </v-col>

          <v-col
            class="pa-0"
          >
            <v-menu
              ref="menu1"
              v-model="menu1"
              :close-on-content-click="false"
              :offset="40"
              lazy
              transition="scale-transition"
              full-width
              max-width="290px"
              min-width="290px"
            >
              <template #activator="{props}">
                <div v-bind="props" />
              </template>
              <!--TODO: Wait until v-date-picker is readded to Vuetify 3?-->
              <!-- <v-date-picker
                v-model="period.startDate"
                no-title
                @update:model-value="menu1 = false"
              /> -->
            </v-menu>
          </v-col>
          <v-col
            v-show="showDateRange"
            xs="8"
            sm="8"
            class="pb-0 pr-0"
          >
            <v-text-field
              v-model="period.endDate"
              :label="$t('EndDate')"
              prepend-inner-icon="event"
              variant="outlined"
              hide-details
              @click:prepend-inner="menu2 = !menu2"
            />
          </v-col>

          <v-col
            v-show="showDateRange"
            xs="4"
            sm="4"
            class="pb-0 pl-1"
          >
            <v-text-field
              v-model="period.endTime"
              :label="$t('Time')"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col
            class="pa-0"
          >
            <v-menu
              ref="menu2"
              v-model="menu2"
              :close-on-content-click="false"
              :offset="40"
              lazy
              transition="scale-transition"
              full-width
              max-width="290px"
              min-width="290px"
            >
              <template #activator="{props}">
                <div v-bind="props" />
              </template>
              <!--TODO: Wait until v-date-picker is readded to Vuetify 3?-->
              <!-- <v-date-picker
                v-model="period.endDate"
                no-title
                @update:model-value="menu2 = false"
              /> -->
            </v-menu>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
    <v-card flat>
      <v-col
        xs="12"
        sm="12"
      >
        <v-card-actions>
          <v-btn
            v-show="showDateRange"
            color="primary"
            @click="setDateRange"
          >
            {{ $t('Apply') }}
          </v-btn>
          <v-spacer />
          <v-btn
            color="blue-darken-1"
            variant="flat"
            @click="reset"
          >
            {{ $t('Reset') }}
          </v-btn>
        </v-card-actions>
      </v-col>
    </v-card>
  </v-navigation-drawer>
</template>

<script>
import moment from 'moment'
import i18n from '@/plugins/i18n'

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
    showDateRange: false,
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
    dateRanges() {
      return [
        { text: i18n.global.t('Latest'), range: [null, null] },
        { text: i18n.global.t('Hour'), range: [-3600, null] },
        { text: i18n.global.t('SixHours'), range: [-3600 * 6, null] },
        { text: i18n.global.t('TwelveHours'), range: [-3600 * 12, null] },
        //TODO: These don't seem to work in Vuetify 3
        //{ divider: true },
        { text: i18n.global.t('SelectRange'), range: [0, 0] },
      ]
    },
    isDark() {
      return this.$store.getters.getPreference('isDark')
    },
    history() {
      return this.item.history.map((h, index) => ({ index: index, ...h }))
    },
    allowedEnvironments() {
      return this.$config.environments
    },
    severityList() {
      let severityMap = this.$config.alarm_model.severity
      return Object.keys(severityMap).sort((a, b) => {
        return severityMap[a] - severityMap[b]
      })
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
        return this.$store.state.reports.filter.text
      },
      set(value) {
        this.$store.dispatch('reports/setFilter', {
          text: value
        })
      }
    },
    filterEnvironment: {
      get() {
        return this.$store.state.reports.filter.environment
      },
      set(value) {
        this.$store.dispatch('reports/setFilter', {
          environment: value.length > 0 ? value : null
        })
      }
    },
    filterSeverity: {
      get() {
        return this.$store.state.reports.filter.severity
      },
      set(value) {
        this.$store.dispatch('reports/setFilter', {
          severity: value.length > 0 ? value : null
        })
      }
    },
    filterStatus: {
      get() {
        return this.$store.state.reports.filter.status
      },
      set(value) {
        this.$store.dispatch('reports/setFilter', {
          status: value.length > 0 ? value : null
        })
      }
    },
    filterCustomer: {
      get() {
        return this.$store.state.reports.filter.customer
      },
      set(value) {
        this.$store.dispatch('reports/setFilter', {
          customer: value.length > 0 ? value : null
        })
      }
    },
    filterService: {
      get() {
        return this.$store.state.reports.filter.service
      },
      set(value) {
        this.$store.dispatch('reports/setFilter', {
          service: value.length > 0 ? value : null
        })
      }
    },
    filterGroup: {
      get() {
        return this.$store.state.reports.filter.group
      },
      set(value) {
        this.$store.dispatch('reports/setFilter', {
          group: value.length > 0 ? value : null
        })
      }
    },
    filterDateRange: {
      get() {
        return this.$store.state.reports.filter.dateRange[0] > 0
          ? [0, 0]
          : this.$store.state.reports.filter.dateRange
      },
      set(value) {
        if (value[0] === 0) {
          this.period = this.getDateRange(
            this.$store.state.reports.filter.dateRange[0]
              ? this.$store.state.reports.filter.dateRange[0]
              : moment().unix() - 7 * 24 * 3600,  // 7 days ago
            this.$store.state.reports.filter.dateRange[1]
              ? this.$store.state.reports.filter.dateRange[1]
              : moment().unix()
          )
          this.showDateRange = true
        } else {
          this.showDateRange = false
          this.$store.dispatch('reports/setFilter', {
            dateRange: value
          })
        }
      }
    }
  },
  watch: {
    value(val) {
      this.sidesheet = val
    }
  },
  created() {
    this.getEnvironments()
    if (this.$config.customer_views) {
      this.getCustomers()
    }
    this.getServices()
    this.getGroups()

    if (this.filterDateRange[0] === 0) {
      this.period = this.getDateRange(
        this.$store.state.reports.filter.dateRange[0],
        this.$store.state.reports.filter.dateRange[1]
      )
      this.showDateRange = true
    }
  },
  methods: {
    getEnvironments() {
      this.$store.dispatch('alerts/getEnvironments')
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
    getDateRange(from, to) {
      let t1 = moment.unix(from).utc()
      let t2 = moment.unix(to).utc()
      return {
        startDate: t1.format('YYYY-MM-DD'),
        startTime: t1.format('HH:mm'),
        endDate: t2.format('YYYY-MM-DD'),
        endTime: t2.format('HH:mm')
      }
    },
    toEpoch(date, time) {
      return new Date(date + ' ' + time).getTime() / 1000
    },
    setDateRange() {
      this.$store.dispatch('reports/setFilter', {
        dateRange: [
          this.toEpoch(
            this.period.startDate,
            this.period.startTime
          ),
          this.toEpoch(
            this.period.endDate,
            this.period.endTime
          )
        ]
      })
    },
    reset() {
      this.showDateRange = false
      this.$store.dispatch('reports/resetFilter')
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style></style>
