<template>
  <v-card>
    <v-card-title class="title">
      {{ $t('Heartbeats') }}
      <v-spacer />
      <v-btn-toggle
        v-model="status"
        class="transparent"
        multiple
      >
        <v-btn
          value="ok"
          flat
        >
          <v-tooltip bottom>
            <v-icon slot="activator">
              check_circle
            </v-icon>
            <span>{{ $t('OK') }}</span>
          </v-tooltip>
        </v-btn>
        <v-btn
          value="slow"
          flat
        >
          <v-tooltip bottom>
            <v-icon slot="activator">
              access_time
            </v-icon>
            <span>{{ $t('Slow') }}</span>
          </v-tooltip>
        </v-btn>
        <v-btn
          value="expired"
          flat
        >
          <v-tooltip bottom>
            <v-icon slot="activator">
              timer_off
            </v-icon>
            <span>{{ $t('Expired') }}</span>
          </v-tooltip>
        </v-btn>
      </v-btn-toggle>
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
      :items="heartbeats"
      :rows-per-page-items="rowsPerPageItems"
      :pagination.sync="pagination"
      class="px-2"
      :search="search"
      :loading="isLoading"
      must-sort
      sort-icon="arrow_drop_down"
    >
      <template
        slot="items"
        slot-scope="props"
      >
        <td>{{ props.item.origin }}</td>
        <td
          v-if="$config.customer_views"
        >
          {{ props.item.customer }}
        </td>
        <td>
          <v-chip
            v-for="tag in props.item.tags"
            :key="tag"
            label
            small
          >
            <v-icon left>
              label
            </v-icon>{{ tag }}
          </v-chip>
        </td>
        <td>
          {{ props.item.attributes }}
        </td>
        <td>
          <date-time
            :value="props.item.createTime"
            format="mediumDate"
          />
        </td>
        <td>
          <date-time
            :value="props.item.receiveTime"
            format="mediumDate"
          />
        </td>
        <td>
          {{ diffTime(props.item.createTime, props.item.receiveTime) }} ms
        </td>
        <td
          class="text-xs-center text-no-wrap"
        >
          {{ $filters.hhmmss(timeoutLeft(props.item)) }}
        </td>
        <td>
          {{ $filters.timeago(props.item.receiveTime) }}
        </td>
        <td>
          <span :class="['label', 'label-' + props.item.status.toLowerCase()]">
            {{ $filters.capitalize(props.item.status) }}
          </span>
        </td>
        <td class="text-no-wrap">
          <v-btn
            v-has-perms.disable="'write:heartbeats'"
            icon
            class="btn--plain mr-0"
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
</template>

<script>
import DateTime from './lib/DateTime'
import moment from 'moment'
import i18n from '@/plugins/i18n'

export default {
  components: {
    DateTime
  },
  data: () => ({
    descending: true,
    page: 1,
    rowsPerPageItems: [10, 20, 30, 40, 50],
    pagination: {
      sortBy: 'receiveTime',
      descending: true,
      rowsPerPage: 20
    },
    // totalItems: number,
    status: ['ok', 'slow', 'expired'],
    search: '',
    headers: [
      { text: i18n.global.t('Origin'), value: 'origin' },
      { text: i18n.global.t('Customer'), value: 'customer' },
      { text: i18n.global.t('Tags'), value: 'tags' },
      { text: i18n.global.t('Attributes'), value: 'attributes' },
      { text: i18n.global.t('CreateTime'), value: 'createTime' },
      { text: i18n.global.t('ReceiveTime'), value: 'receiveTime' },
      { text: i18n.global.t('Latency'), value: 'latency' },
      { text: i18n.global.t('Timeout'), value: 'timeout' },
      { text: i18n.global.t('Since'), value: 'since' },
      { text: i18n.global.t('Status'), value: 'status' },
      { text: i18n.global.t('Actions'), value: 'name', sortable: false }
    ]
  }),
  computed: {
    heartbeats() {
      return this.$store.state.heartbeats.heartbeats.filter(hb => !this.status || this.status.includes(hb.status))
    },
    computedHeaders() {
      return this.headers.filter(h => !this.$config.customer_views ? h.value != 'customer' : true)
    },
    isLoading() {
      return this.$store.state.heartbeats.isLoading
    },
    refresh() {
      return this.$store.state.refresh
    }
  },
  watch: {
    refresh(val) {
      val || this.getHeartbeats()
    }
  },
  created() {
    this.getHeartbeats()
  },
  methods: {
    timeoutLeft(item) {
      let expireTime = moment(item.createTime).add(item.timeout, 'seconds')
      return expireTime.isAfter() ? expireTime.diff(moment(), 'seconds') : moment.duration()
    },
    getHeartbeats() {
      this.$store.dispatch('heartbeats/getHeartbeats')
    },
    deleteItem(item) {
      confirm(i18n.global.t('ConfirmDelete')) &&
        this.$store.dispatch('heartbeats/deleteHeartbeat', item.id)
    },
    diffTime(a, b) {
      return new Date(b).getTime() - new Date(a).getTime()
    }
  }
}
</script>

<style>
.label {
  font-size: 13px;
  font-weight: bold;
  line-height: 14px;
  color: #ffffff;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  white-space: nowrap;
  vertical-align: baseline;
  background-color: #999999;
}

.label {
  padding: 1px 4px 2px;
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  border-radius: 3px;
}

.label-expired {
  background-color: #b94a48;
}

.label-slow {
  background-color: #3a87ad;
}

.label-ok {
  background-color: #468847;
}
</style>
