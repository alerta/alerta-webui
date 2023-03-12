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
        :headers="headers"
        :items="top10"
        class="px-2"
        hide-default-footer
      >
        <template #items="props">
          <tr>
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
          </tr>
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
      {title: i18n.global.t('Event'), key: 'event', sortable: false},
      {title: i18n.global.t('Count'), key: 'count', sortable: false},
      {title: i18n.global.t('DuplCount'), key: 'duplicateCount', sortable: false},
      {title: i18n.global.t('Environment'), key: 'environment', sortable: false},
      {title: i18n.global.t('Services'), key: 'services', sortable: false},
      {title: i18n.global.t('Resources'), key: 'resources', sortable: false},
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
