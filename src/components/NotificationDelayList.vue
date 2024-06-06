<template>
  <div>
    <v-card>
      <v-card-title class="title">
        {{ $t('notificationDelays') }}
      </v-card-title>

      <v-data-table
        :headers="computedHeaders"
        :items="notification_delays"
        :pagination.sync="pagination"
        :total-items="pagination.totalItems"
        :rows-per-page-items="pagination.rowsPerPageItems"
        class="px-2"
        :loading="false"
        must-sort
        sort-icon="arrow_drop_down"
      >
        <template
          slot="items"
          slot-scope="props"
        >
          <td>{{ props.item.alert_id }}</td>
          <td>{{ props.item.notification_rule_id }}</td>
          <td>{{ props.item.delay_time }}</td>
          <td class="text-no-wrap">
            <v-btn
              v-has-perms.disable="'write:notification_rules'"
              icon
              class="btn--plain mx-0"
              @click="deleteItem(props.item)"
            >
              <v-icon
                small
                color="grey darken-3"
              >
                delete
              </v-icon>
            </v-btn>
          </td>
        </template>
        <template slot="no-data">
          <v-alert
            :value="true"
            color="error"
            icon="warning"
          >
            {{ $t('NoDisplay') }}
          </v-alert>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import ListButtonAdd from './lib/ListButtonAdd'
import moment from 'moment'
import i18n from '@/plugins/i18n'

export default {
  data: vm => ({
    headers: [
      { text: i18n.t('Alert'), value: 'alert_id' },
      { text: i18n.t('NotificationRule'), value: 'notification_rule_id' },
      { text: i18n.t('Time'), value: 'delay_time' },
    ],
    timer: null
  }),
  computed: {
    notification_delays() {
      return this.$store.state.notificationDelays.notification_delays
        .map(b => {
          let delay_time = b.delay_time ? moment(b.delay_time).format('YYYY-MM-DD HH:mm:ss') : null

          return Object.assign(
            { ...b, delay_time },
          )
        })
    },
    pagination: {
      get() {
        return this.$store.getters['notificationDelays/pagination']
      },
      set(value) {
        this.$store.dispatch('notificationDelays/setPagination', value)
      }
    },
    computedHeaders() {
      return this.headers.filter(h =>
        !this.$config.customer_views ? h.value != 'customer' : true
      )
    },
    isLoading() {
      return this.$store.state.notificationDelays.isLoading
    },
    refresh() {
      return this.$store.state.refresh
    },
    refreshInterval() {
      return (
        this.$store.getters.getPreference('refreshInterval') ||
        this.$store.getters.getConfig('refresh_interval')
      )
    },
  },
  watch: {
    refresh(val) {
      if (val) return
      this.getNotificationDelays()
    },
    pagination: {
      handler() {
        this.getNotificationDelays()
      },
      deep: true
    }
  },
  created() {
    this.cancelTimer()
    this.refreshDelays()
  },
  beforeDestroy() {
    this.cancelTimer()
  },
  methods: {
    getNotificationDelays() {
      return this.$store.dispatch('notificationDelays/getNotificationDelays')
    },
    deleteItem(item) {
      confirm(i18n.t('ConfirmDelete')) &&
        this.$store.dispatch(
          'notificationDelays/deleteNotificationDelay',
          item.id
        )
    },
    cancelTimer() {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    },
    refreshDelays() {
      this.getNotificationDelays()
        .then(() => {
          this.timer = setTimeout(() => this.refreshDelays(), this.refresh_interval)
        })
    },
    refresh_all() {
      this.$store.dispatch('set', ['refresh', true])
      setTimeout(() => {
        this.$store.dispatch('set', ['refresh', false])
      }, 300)
    }
  }
}
</script>

<style></style>
