<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="metrics"
      hide-actions
    >
      <template
        slot="items"
        slot-scope="props"
      >
        <td>{{ props.item.title }}</td>
        <td>{{ props.item.type | capitalize }}</td>
        <td>{{ props.item.group }}.{{ props.item.name }}</td>
        <td>{{ props.item.value || props.item.count }}</td>
        <td>{{ avgTime(props.item) }}</td>
      </template>
    </v-data-table>

    <v-data-table
      :headers="[{sortable: false},{sortable: false},{sortable: false},{sortable: false}]"
      :items="uptime"
      hide-actions
    >
      <template
        slot="items"
        slot-scope="props"
      >
        <td>Last Update</td>
        <td>
          <date-time
            v-if="props.item.lastTime"
            :value="props.item.lastTime"
            format="longDate"
          />
        </td>
        <td>Uptime</td>
        <td>{{ props.item.uptime / 1000 | days }}</td>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import DateTime from './lib/DateTime'
import moment from 'moment'

export default {
  components: {
    DateTime
  },
  data: () => ({
    headers: [
      {text: 'Metric', value: 'title', sortable: false},
      {text: 'Type', value: 'type', sortable: false},
      {text: 'Name', value: 'name', sortable: false},
      {text: 'Value', value: 'value', sortable: false},
      {text: 'Avg. Time', value: 'time', sortable: false},
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
