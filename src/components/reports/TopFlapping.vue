<template>
  <div>
    <v-card>
      <v-card-title primary-title>
        <div>
          <div class="text-h5">
            {{ $t('Top') }} {{ rowsPerPage }} {{ $t('Flapping') }}
          </div><br>
          <span class="text-grey">{{ $t('TopFlappingDescription') }}</span>
        </div>
        <v-spacer />
      </v-card-title>
      <v-data-table
        :header="headers"
        :item="top10"
        class="px-2"
        hide-actions
      >
        <template
          #items="props"
        >
          <td>{{ props.item.event }}</td>
          <td class="text-center">
            {{ props.item.count }}
          </td>
          <td class="text-center">
            {{ props.item.duplicateCount }}
          </td>
          <td>{{ props.item.environments.join(', ') }}</td>
          <td>{{ props.item.services.join(', ') }}</td>
          <td>
            <span
              v-for="r in props.item.resources"
              :key="r.id"
            >
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
      {text: i18n.global.t('Event'), value: 'event', sortable: false},
      {text: i18n.global.t('Count'), value: 'count', sortable: false},
      {text: i18n.global.t('DuplCount'), value: 'duplicateCount', sortable: false},
      {text: i18n.global.t('Environment'), value: 'environment', sortable: false},
      {text: i18n.global.t('Services'), value: 'services', sortable: false},
      {text: i18n.global.t('Resources'), value: 'resources', sortable: false},
    ]
  }),
  computed: {
    top10() {
      if (this.filter) {
        return this.$store.state.reports.flapping
          .filter(alert =>
            this.filter.text
              ? Object.keys(alert).some(k => alert[k] && alert[k].toString().toLowerCase().includes(this.filter.text.toLowerCase()))
              : true
          )
      } else {
        return this.$store.state.reports.flapping
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
        this.getTopFlapping()
      },
      deep: true
    },
    rowsPerPage(val) {
      this.getTopFlapping()
    },
    refresh(val) {
      val || this.getTopFlapping()
    }
  },
  created() {
    this.getTopFlapping()
  },
  methods: {
    getTopFlapping() {
      return this.$store.dispatch('reports/getTopFlapping')
    }
  }
}
</script>

<style></style>
