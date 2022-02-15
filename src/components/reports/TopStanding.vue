<template>
  <div>
    <v-card>
      <v-card-title primary-title>
        <div>
          <div class="headline">
            {{ $t('Top') }} {{ itemsPerPage }} {{ $t('Standing') }}
          </div>
          <br />
          <span class="grey--text">{{ $t('TopStandingDescription') }}</span>
        </div>
        <v-spacer />
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="top10"
        class="px-2"
        hide-default-footer
      >
        <template v-slot:item.environment="{ item }">
          {{ item.environments.join(', ') }}
        </template>
        <template v-slot:item.service="{ item }">
          {{ item.services.join(', ') }}
        </template>
        <template v-slot:item.resources="{ item }">
          <span v-for="r in item.resources" :key="r.id">
            <router-link :to="`/alert/${r.id}`">
              {{ r.resource }}
            </router-link>
          </span>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import i18n from '@/plugins/i18n'

export default {
  data: () => ({
    headers: [
      { text: i18n.t('Event'), value: 'event', sortable: false },
      { text: i18n.t('Count'), value: 'count', sortable: false },
      { text: i18n.t('DuplCount'), value: 'duplicateCount', sortable: false },
      { text: i18n.t('Environment'), value: 'environment', sortable: false },
      { text: i18n.t('Services'), value: 'services', sortable: false },
      { text: i18n.t('Resources'), value: 'resources', sortable: false }
    ]
  }),
  computed: {
    top10() {
      if (!this.filter || !this.filter.text)
        return this.$store.state.reports.standing

      return this.$store.state.reports.standing.filter((alert) =>
        Object.keys(alert).some(
          (k) =>
            alert[k] &&
            alert[k]
              .toString()
              .toLowerCase()
              .includes(this.filter.text.toLowerCase())
        )
      )
    },
    filter() {
      return this.$store.state.reports.filter
    },
    itemsPerPage() {
      return this.$store.state.reports.pagination.itemsPerPage
    },
    refresh() {
      return this.$store.state.refresh
    }
  },
  watch: {
    filter: {
      handler() {
        this.getTopStanding()
      },
      deep: true
    },
    itemsPerPage() {
      this.getTopStanding()
    },
    refresh(val) {
      val || this.getTopStanding()
    }
  },
  created() {
    this.getTopStanding()
  },
  methods: {
    getTopStanding() {
      return this.$store.dispatch('reports/getTopStanding')
    }
  }
}
</script>

<style></style>
