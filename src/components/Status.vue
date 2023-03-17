<template>
  <div>
    <v-data-table
      :header="headers"
      :item="metrics"
      class="px-2"
      hide-actions
    >
      <template
        #items="props"
      >
        <td>{{ props.item.title }}</td>
        <td>{{ this.$filters.capitalize(props.item.type) }}</td>
        <td>{{ props.item.group }}.{{ props.item.name }}</td>
        <td>{{ props.item.value || props.item.count }}</td>
        <td>{{ avgTime(props.item) }}</td>
      </template>
    </v-data-table>

    <v-data-table
      :header="[{sortable: false},{sortable: false},{sortable: false},{sortable: false}]"
      :item="uptime"
      class="px-2"
      hide-actions
    >
      <template
        #items="props"
      >
        <td>{{ $t('LastUpdate') }}</td>
        <td>
          <date-time
            v-if="props.item.lastTime"
            :value="props.item.lastTime"
            format="longDate"
          />
        </td>
        <td>{{ $t('Uptime') }}</td>
        <td>{{ this.$filters.days(props.item.uptime / 1000) }}</td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import DateTime from './lib/DateTime'
import moment from 'moment'
import i18n from '@/plugins/i18n'

export default {
  components: {
    DateTime
  },
  data: () => ({
    headers: [
      {text: i18n.global.t('Metric'), value: 'title', sortable: false},
      {text: i18n.global.t('Type'), value: 'type', sortable: false},
      {text: i18n.global.t('Name'), value: 'name', sortable: false},
      {text: i18n.global.t('Value'), value: 'value', sortable: false},
      {text: i18n.global.t('AvgTime'), value: 'time', sortable: false},
    ]
  }),
  computed: {
    metrics() {
      return this.$store.state.management.metrics
    },
    uptime() {
      return [{
        lastTime: moment(this.$store.state.management.time).utc().toISOString(),
        uptime: this.$store.state.management.uptime
      }]
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
