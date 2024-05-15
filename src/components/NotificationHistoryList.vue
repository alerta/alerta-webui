<template>
  <div>
    <v-card>
      <v-card-title class="title">
        {{ $t('Notification History') }}
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="search"
          :label="$t('Search')"
          single-line
          hide-details
        />
      </v-card-title>

      <v-data-table
        :headers="computedHeaders"
        :items="notification_history"
        :pagination.sync="pagination"
        :total-items="pagination.totalItems"
        :rows-per-page-items="pagination.rowsPerPageItems"
        class="alert-table"
        :loading="isLoading"
        must-sort
        sort-icon="arrow_drop_down"
      >
        <template
          slot="items"
          slot-scope="props"
        > 
          <tr
            :style="{'background-color': severityColor(props.item.confirmed, props.item.sent)}"
          >
            <td>{{ props.item.id }}</td>
            <td>{{ props.item.sent }}</td>
            <td>{{ props.item.sent_time }}</td>
            <td>{{ props.item.message }}</td>
            <td>{{ props.item.receiver }}</td>
            <td>{{ props.item.sender }}</td>
            <td>{{ props.item.channel }}</td>
            <td
              class="clickable"
              @click="findNotificationRule(props.item.rule)"
            >
              {{ props.item.rule }}
            </td>
            <td
              class="clickable"
              @click="findAlert(props.item.alert)"
            >
              {{ props.item.alert }}
            </td>
            <td>{{ props.item.error }}</td>
            <td>{{ props.item.confirmed }}</td>
            <td>{{ props.item.confirmed_time }}</td>
          </tr>
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
        <v-alert
          slot="no-results"
          :value="true"
          color="error"
          icon="warning"
        >
          {{ $t('SearchNoResult1') }} "{{ search }}" {{ $t('SearchNoResult2') }}
        </v-alert>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import moment from 'moment'
import i18n from '@/plugins/i18n'

export default {
  data: vm => ({
    search: '',
    headers: [
      { text: i18n.t('Id'), value: 'id' },
      { text: i18n.t('Sent'), value: 'sent' },
      { text: i18n.t('SentTime'), value: 'sent_time' },
      { text: i18n.t('Message'), value: 'message' },
      { text: i18n.t('Receiver'), value: 'receiver' },
      { text: i18n.t('Sender'), value: 'sender' },
      { text: i18n.t('Channel'), value: 'channel' },
      { text: i18n.t('NotificationRule'), value: 'rule' },
      { text: i18n.t('Alert'), value: 'alert' },
      { text: i18n.t('Error'), value: 'error' },
      { text: i18n.t('Confirmed'), value: 'confirmed' },
      { text: i18n.t('ConfirmedTime'), value: 'confirmed_time' },
    ],
    rules: {
      required: v => !!v || i18n.t('Required')
    }
  }),
  computed: {
    notification_history() {
      return this.$store.state.notificationHistory.notification_history
        .filter(b =>
          this.search
            ? Object.keys(b).some(
              k => b[k] && b[k].toString().includes(this.search)
            )
            : true
        )
        .map(b => {
          let sent_time = b.sent_time ? moment(b.sent_time).format('YYYY-MM-DD HH:mm:ss') : null
          let confirmed_time = b.confirmed_time ? moment(b.confirmed_time).format('YYYY-MM-DD HH:mm:ss') : null

          return { ...b, sent_time, confirmed_time }
        })
    },
    pagination: {
      get() {
        return this.$store.getters['notificationHistory/pagination']
      },
      set(value) {
        this.$store.dispatch('notificationHistory/setPagination', value)
      }
    },
    computedHeaders() {
      return this.headers.filter(h =>
        !this.$config.customer_views ? h.value != 'customer' : true
      )
    },
    isLoading() {
      return this.$store.state.notificationHistory.isLoading
    },
    refresh() {
      return this.$store.state.refresh
    }
  },
  watch: {
    refresh(val) {
      if (!val) return
      this.getNotificationsHistory()
    },
    pagination: {
      handler() {
        this.getNotificationsHistory()
      },
      deep: true
    }
  },
  created() {
    this.getNotificationsHistory()
  },
  methods: {
    getNotificationsHistory() {
      this.$store.dispatch('notificationHistory/getNotificationHistory')
    },
    severityColor(confirmed, sent) {
      const config = this.$store.getters.getConfig('colors')
      return config.severity[confirmed ? 'ok' : sent ? 'warning' : 'critical'] || 'white'
    },
    findAlert(id){
      this.$router.push({ path: `/alerts?q=id:"${id}"` })
    },
    findNotificationRule(id){
      this.$router.push({ path: `/notificationrules?q=id:"${id}"` })
    }
  }
}
</script>

<style>
td.clickable {
  cursor: pointer;
  color: #3f51b5;
  font-weight: 400;
  text-decoration: underline;
}
</style>
