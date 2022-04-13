<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="metrics"
      class="px-2"
      hide-default-footer
    >
      <template v-slot:[`item.type`]="{ item }">
        {{ item.type | capitalize }}
      </template>
      <template v-slot:[`item.value`]="{ item }">
        {{ item.value || item.count }}
      </template>

      <template v-slot:[`item.name`]="{ item }">
        {{ item.group }}.{{ item.name }}
      </template>
      <template v-slot:[`item.time`]="{ item }">
        {{ avgTime(item) }}
      </template>
    </v-data-table>

    <v-data-table
      :headers="[
        { sortable: false },
        { sortable: false },
        { sortable: false },
        { sortable: false }
      ]"
      :items="uptime"
      class="px-2"
      hide-default-footer
    >
      <template v-slot:item="{ item }">
        <td>{{ $t('LastUpdate') }}</td>
        <td>
          <date-filter
            v-if="item.lastTime"
            :value="item.lastTime"
            format="longDate"
          />
        </td>
        <td>{{ $t('Uptime') }}</td>
        <td>{{ getUptime(item.uptime) }}</td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import DateFilter from './lib/DateFormat.vue'
import i18n from '@/plugins/i18n'
import { DateTime, Duration } from 'luxon'

export default {
  components: {
    DateFilter
  },
  data: () => ({
    headers: [
      { text: i18n.t('Metric'), value: 'title', sortable: false },
      { text: i18n.t('Type'), value: 'type', sortable: false },
      { text: i18n.t('Name'), value: 'name', sortable: false },
      { text: i18n.t('Value'), value: 'value', sortable: false },
      { text: i18n.t('AvgTime'), value: 'time', sortable: false }
    ]
  }),
  computed: {
    metrics() {
      return this.$store.state.management.metrics
    },
    uptime() {
      return [
        {
          lastTime: this.$store.state.management.time
            ? DateTime.fromMillis(this.$store.state.management.time, {
                setZone: 'utc'
              }).toISO()
            : null,
          uptime: this.$store.state.management.uptime
        }
      ]
    },
    refresh() {
      return this.$store.state.refresh
    }
  },
  watch: {
    refresh(val) {
      val || this.getStatus()
    }
  },
  created() {
    this.getStatus()
  },
  methods: {
    getUptime(val) {
      return Duration.fromMillis(val).toFormat(`d 'days' hh:mm:ss`)
    },
    getStatus() {
      return this.$store.dispatch('management/getStatus')
    },
    avgTime(item) {
      if (item.type == 'timer') {
        return (item.totalTime / item.count).toFixed(2) + ' ms'
      } else {
        return 'n/a'
      }
    }
  }
}
</script>

<style></style>
