<template>
  <v-navigation-drawer
    :value="isOpen"
    clipped
    disable-resize-watcher
    absolute
    hide-overlay
    width="300"
    right
    disable-route-watcher
    @input="!$event && close()"
  >
    <v-card tile>
      <v-app-bar flat dense>
        <v-toolbar-title>
          {{ $t('Filters') }}
        </v-toolbar-title>
        <v-spacer />
        <v-toolbar-items />
        <v-menu bottom right offset-y>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" icon @click="close">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </template>
        </v-menu>
      </v-app-bar>

      <v-container fluid grid-list-xl>
        <v-layout class="align-center" wrap>
          <v-flex xs12 class="pb-0">
            <v-text-field
              v-model="filterText"
              :label="$t('Search')"
              prepend-inner-icon="mdi-magnify"
              outlined
              dense
              clearable
              :hint="$t('FilterDescription')"
              persistent-hint
            />
          </v-flex>

          <v-flex xs12 class="pb-0">
            <v-select
              v-model="filterStatus"
              :items="statusList"
              small-chips
              :placeholder="$t('AllStatuses')"
              :label="$t('Status')"
              multiple
              outlined
              dense
              :hint="$t('StatusDescription')"
              persistent-hint
            />
          </v-flex>

          <v-flex v-if="$config.customer_views" xs12 class="pb-0">
            <v-select
              v-model="filterCustomer"
              :items="currentCustomers"
              :menu-props="{ maxHeight: '400' }"
              :placeholder="$t('AllCustomers')"
              :label="$t('Customer')"
              multiple
              outlined
              dense
              :hint="$t('CustomerDescription')"
              persistent-hint
            />
          </v-flex>

          <v-flex xs12 class="pb-0">
            <span class="body-2">{{ $t('DateTime') }}</span>
            <v-select
              v-model="filterDateRange"
              :items="dateRanges"
              name="dateRange"
              :label="$t('DateTime')"
              solo
              flat
              prepend-inner-icon="mdi-clock-outline"
              item-value="range"
              hide-details
            />
          </v-flex>

          <v-flex v-show="showDateRange" xs8 class="pb-0 pr-0">
            <v-text-field
              v-model="period.startDate"
              :label="$t('StartDate')"
              prepend-inner-icon="mdi-calendar"
              outlined
              hide-details
              @click:prepend-inner="menu1 = !menu1"
            />
          </v-flex>

          <v-flex v-show="showDateRange" xs4 class="pb-0 pl-1">
            <v-text-field
              v-model="period.startTime"
              :label="$t('Time')"
              outlined
              hide-details
            />
          </v-flex>

          <v-flex class="pa-0">
            <v-menu
              ref="menu1"
              v-model="menu1"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <div v-on="on" />
              </template>
              <v-date-picker
                v-model="period.startDate"
                no-title
                @input="menu1 = false"
              />
            </v-menu>
          </v-flex>
          <v-flex v-show="showDateRange" xs8 class="pb-0 pr-0">
            <v-text-field
              v-model="period.endDate"
              :label="$t('EndDate')"
              prepend-inner-icon="mdi-calendar"
              outlined
              hide-details
              @click:prepend-inner="menu2 = !menu2"
            />
          </v-flex>

          <v-flex v-show="showDateRange" xs4 class="pb-0 pl-1">
            <v-text-field
              v-model="period.endTime"
              :label="$t('Time')"
              outlined
              hide-details
            />
          </v-flex>
          <v-flex class="pa-0">
            <v-menu
              ref="menu2"
              v-model="menu2"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <div v-on="on" />
              </template>
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
      <v-flex xs12>
        <v-card-actions>
          <v-btn v-show="showDateRange" color="primary" @click="setDateRange">
            {{ $t('Apply') }}
          </v-btn>
          <v-spacer />
          <v-btn color="blue darken-1" text @click="reset">
            {{ $t('Reset') }}
          </v-btn>
        </v-card-actions>
      </v-flex>
    </v-card>
  </v-navigation-drawer>
</template>

<script lang='ts'>
import moment from 'moment'
import i18n from '@/plugins/i18n'
import Vue from 'vue'
import { DateRange } from '@/store/interfaces'

export default Vue.extend({
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    active: null,
    pagination: {
      itemsPerPage: 10,
      sortBy: ['updateTime']
    },
    showDateRange: false,
    menu1: false,
    menu2: false,
    period: {
      startDate: null,
      startTime: null,
      endDate: null,
      endTime: null
    }
  }),
  computed: {
    dateRanges() {
      return [
        { text: i18n.t('Latest'), range: [null, null] },
        { text: i18n.t('Hour'), range: [-3600, null] },
        { text: i18n.t('SixHours'), range: [-3600 * 6, null] },
        { text: i18n.t('TwelveHours'), range: [-3600 * 12, null] },
        { divider: true },
        { text: i18n.t('SelectRange'), range: [0, 0] }
      ]
    },
    statusList() {
      const statusMap = this.$config.alarm_model.status
      return Object.keys(statusMap).sort((a, b) =>
        statusMap[a].localeCompare(statusMap[b])
      )
    },
    currentCustomers() {
      return this.$store.getters['customers/customers']
    },
    currentServices() {
      return this.$store.getters['incidents/services']
    },
    filterText: {
      get() {
        return this.$store.state.incidents.filter.text
      },
      set(value) {
        this.$store.dispatch('incidents/setFilter', {
          text: value
        })
      }
    },
    filterStatus: {
      get() {
        return this.$store.state.incidents.filter.status
      },
      set(value: string[]) {
        this.$store.dispatch('incidents/setFilter', {
          status: value.length > 0 ? value : null
        })
      }
    },
    filterCustomer: {
      get() {
        return this.$store.state.incidents.filter.customer
      },
      set(value: string[]) {
        this.$store.dispatch('incidents/setFilter', {
          customer: value.length > 0 ? value : null
        })
      }
    },
    filterService: {
      get() {
        return this.$store.state.incidents.filter.service
      },
      set(value: string[]) {
        this.$store.dispatch('incidents/setFilter', {
          service: value.length > 0 ? value : null
        })
      }
    },
    filterDateRange: {
      get() {
        return this.$store.state.incidents.filter.dateRange[0] > 0
          ? [0, 0]
          : this.$store.state.incidents.filter.dateRange
      },
      set(value: DateRange) {
        if (value[0] !== 0) {
          this.showDateRange = false
          this.$store.dispatch('incidents/setFilter', {
            dateRange: value
          })
          return
        }

        this.period = this.getDateRange(
          this.$store.state.incidents.filter.dateRange[0]
            ? this.$store.state.incidents.filter.dateRange[0]
            : moment().unix() - 7 * 24 * 3600, // 7 days ago
          this.$store.state.incidents.filter.dateRange[1]
            ? this.$store.state.incidents.filter.dateRange[1]
            : moment().unix()
        )
        this.showDateRange = true
      }
    },
    username() {
      return this.$store.getters['auth/getUsername']
    }
  },

  created() {
    if (this.$config.customer_views) this.getCustomers()

    if (this.filterDateRange[0] === 0) {
      this.period = this.getDateRange(
        this.$store.state.incidents.filter.dateRange[0],
        this.$store.state.incidents.filter.dateRange[1]
      )
      this.showDateRange = true
    }
  },
  methods: {
    getCustomers() {
      this.$store.dispatch('customers/getCustomers')
    },
    getDateRange(from, to) {
      const t1 = moment.unix(from).utc()
      const t2 = moment.unix(to).utc()
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
      this.$store.dispatch('incidents/setFilter', {
        dateRange: [
          this.toEpoch(this.period.startDate, this.period.startTime),
          this.toEpoch(this.period.endDate, this.period.endTime)
        ]
      })
    },
    reset() {
      this.showDateRange = false
      this.$store.dispatch('incidents/resetFilter')
    },
    close() {
      this.$emit('close')
    }
  }
})
</script>

