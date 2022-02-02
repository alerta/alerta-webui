<template>
  <div>
    <v-card>
      <v-card-title primary-title>
        <div>
          <div class="headline">
            {{ $t('Top') }} {{ rowsPerPage }} {{ $t('Offenders') }}
          </div>
          <br />
          <span class="grey--text">{{ $t('TopOffendersDescription') }}</span>
        </div>
        <v-spacer />
      </v-card-title>
      <v-data-table :headers="headers" :items="top10" class="px-2" hide-actions>
        <template slot="items" slot-scope="props">
          <td>{{ props.item.event }}</td>
          <td class="text-xs-center">
            {{ props.item.count }}
          </td>
          <td class="text-xs-center">
            {{ props.item.duplicateCount }}
          </td>
          <td>{{ props.item.environments.join(', ') }}</td>
          <td>{{ props.item.services.join(', ') }}</td>
          <td>
            <span v-for="r in props.item.resources" :key="r.id">
              <router-link :to="`/alert/${r.id}`">
                {{ r.resource }}
              </router-link>
            </span>
          </td>
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
      if (this.filter) {
        return this.$store.state.reports.offenders.filter((alert) =>
          this.filter.text
            ? Object.keys(alert).some(
                (k) =>
                  alert[k] &&
                  alert[k]
                    .toString()
                    .toLowerCase()
                    .includes(this.filter.text.toLowerCase())
              )
            : true
        )
      } else {
        return this.$store.state.reports.offenders
      }
    },
    filter() {
      return this.$store.state.reports.filter
    },
    rowsPerPage() {
      return this.$store.state.reports.pagination.rowsPerPage
    },
    refresh() {
      return this.$store.state.refresh
    }
  },
  watch: {
    filter: {
      handler(val) {
        this.getTopOffenders()
      },
      deep: true
    },
    rowsPerPage(val) {
      this.getTopOffenders()
    },
    refresh(val) {
      val || this.getTopOffenders()
    }
  },
  created() {
    this.getTopOffenders()
  },
  methods: {
    getTopOffenders() {
      return this.$store.dispatch('reports/getTopOffenders')
    }
  }
}
</script>

<style></style>
