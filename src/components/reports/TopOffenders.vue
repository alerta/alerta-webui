<template>
  <div>
    <v-card>
      <v-card-title class="title">
        Top 10 Offenders
        <v-spacer />
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="top10"
        hide-actions
      >
        <template
          slot="items"
          slot-scope="props"
        >
          <td>{{ props.item.event }}</td>
          <td>{{ props.item.count }}</td>
          <td>{{ props.item.duplicateCount }}</td>
          <td>{{ props.item.environments.join(', ') }}</td>
          <td>{{ props.item.services.join(', ') }}</td>
          <td>
            <span
              v-for="r in props.item.resources"
              :key="r.id"
            >
              <a :href="`alert/${r.id}`">{{ r.resource }}</a>
            </span>
          </td>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  data: () => ({
    headers: [
      {text: 'Event', value: 'event', sortable: false},
      {text: 'Count', value: 'count', sortable: false},
      {text: 'Dupl. Count', value: 'duplicateCount', sortable: false},
      {text: 'Environment', value: 'environment', sortable: false},
      {text: 'Services', value: 'services', sortable: false},
      {text: 'Resources', value: 'resources', sortable: false},
    ]
  }),
  computed: {
    top10() {
      return this.$store.state.alerts.offenders
    },
    refresh() {
      return this.$store.state.refresh
    }
  },
  watch: {
    refresh(val) {
      val || this.getTopOffenders()
    }
  },
  created() {
    this.getTopOffenders()
  },
  methods: {
    getTopOffenders() {
      return this.$store.dispatch('alerts/getTopOffenders')
    }
  }
}
</script>

<style></style>
