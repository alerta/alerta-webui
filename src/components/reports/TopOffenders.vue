<template>
  <div>
    <v-card>
      <v-card-title primary-title>
        <div>
          <div class="text-h5">
            {{ $t('Top') }} {{ rowsPerPage }} {{ $t('Offenders') }}
          </div><br>
          <span class="text-grey">{{ $t('TopOffendersDescription') }}</span>
        </div>
        <v-spacer />
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="top10"
        class="px-2"
        hide-default-footer
      >
        <template #items="{props}">
          <tr>
            <td>{{ props.event }}</td>
            <td class="text-center">
              {{ props.count }}
            </td>
            <td class="text-center">
              {{ 7 }}
            </td>
            <td>{{ props.environment.join(', ') }}</td>
            <td>{{ props.services.join(', ') }}</td>
            <td>
              <span
                v-for="r in props.resources"
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
      {title: i18n.global.t('Event'), value: 'event', sortable: false},
      {title: i18n.global.t('Count'), value: 'count', sortable: false},
      {title: i18n.global.t('DuplCount'), value: 'duplicateCount', sortable: false},
      {title: i18n.global.t('Environment'), value: 'environments', sortable: false},
      {title: i18n.global.t('Services'), value: 'services', sortable: false},
      {title: i18n.global.t('Resources'), value: 'resources', sortable: false},
    ]
  }),
  computed: {
    top10() {
      console.log(this.$store.state.reports.offenders)
      if (this.filter) {
        return this.$store.state.reports.offenders
          .filter(alert =>
            this.filter.text
              ? Object.keys(alert).some(k => alert[k] && alert[k].toString().toLowerCase().includes(this.filter.text.toLowerCase()))
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
