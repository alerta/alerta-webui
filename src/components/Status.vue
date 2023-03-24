<!-- eslint-disable vuetify/no-deprecated-components -->
<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="metrics"
      class="px-2"
      hide-actions
    >
      <template
        #item="{item}"
      >
        <tr>
          <td>{{ item.props.title }}</td>
          <td>{{ this.$filters.capitalize(item.props.type) }}</td>
          <td>{{ item.props.group }}.{{ item.props.name }}</td>
          <td>{{ item.props.value || item.props.count }}</td>
          <td>{{ avgTime(item.props) }}</td>
        </tr>
      </template>
    </v-data-table>

    <v-data-table
      :headers="[{sortable: false},{sortable: false},{sortable: false},{sortable: false}]"
      :items="uptime"
      class="px-2"
      hide-actions
    >
      <template
        #item="{item}"
      >
        <td>{{ $t('LastUpdate') }}</td>
        <td>
          <date-time
            v-if="item.props.lastTime"
            :value="item.props.lastTime"
            format="longDate"
          />
        </td>
        <td>{{ $t('Uptime') }}</td>
        <td>{{ this.$filters.days(item.props.uptime / 1000) }}</td>
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
      {title: i18n.global.t('Metric'), value: 'title', sortable: false},
      {title: i18n.global.t('Type'), value: 'type', sortable: false},
      {title: i18n.global.t('Name'), value: 'name', sortable: false},
      {title: i18n.global.t('Value'), value: 'value', sortable: false},
      {title: i18n.global.t('AvgTime'), value: 'time', sortable: false},
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
