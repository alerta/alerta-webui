<template>
  <div class="reports">
    <v-card>
      <v-card-title class="title">
        {{ $t('Reports') }}
        <v-spacer />
        <v-flex
          xs1
        >
          <v-select
            v-model.number="rowsPerPage"
            :items="rowsPerPageItems"
            :prefix="$t('Top')"
            type="number"
          />
        </v-flex>

        <v-btn
          flat
          icon
          :class="{ 'filter-active': isActive }"
          @click="sidesheet = !sidesheet"
        >
          <v-icon>filter_list</v-icon>
        </v-btn>
      </v-card-title>

      <top-offenders />
      <top-flapping />
      <top-standing />
    </v-card>

    <report-filter
      :value="sidesheet"
      @close="sidesheet = false"
    />
  </div>
</template>

<script>
import TopOffenders from '@/components/reports/TopOffenders.vue'
import TopFlapping from '@/components/reports/TopFlapping.vue'
import TopStanding from '@/components/reports/TopStanding.vue'

import i18n from '@/plugins/i18n'

export default {
  components: {
    TopOffenders,
    TopFlapping,
    TopStanding,
    ReportFilter: () => import('@/components/reports/ReportFilter.vue')
  },
  data: () => ({
    sidesheet: false,
    rowsPerPageItems: [10, 20, 50, 100, 200]
  }),
  computed: {
    filter() {
      return this.$store.state.reports.filter
    },
    isActive() {
      return this.filter.text || this.filter.environment || this.filter.severity
        || this.filter.status || this.filter.customer || this.filter.service
        || this.filter.group || this.filter.dateRange[0] || this.filter.dateRange[1]
    },
    rowsPerPage: {
      get() {
        return this.$store.state.reports.pagination.rowsPerPage
      },
      set(value) {
        this.$store.dispatch('reports/setPageSize', value)
      }
    },
  }
}
</script>
