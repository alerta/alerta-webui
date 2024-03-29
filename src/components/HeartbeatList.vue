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
      :pagination.sync="pagination"
      :rows-per-page-items="pagination.rowsPerPageItems"
      :total-items="pagination.totalItems"
      class="px-2"
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
          {{ timeoutLeft(props.item) | hhmmss }}
        </td>
        <td>
          {{ props.item.receiveTime | timeago }}
        </td>
        <td>
          <span :class="['label', 'label-' + props.item.status.toLowerCase()]">
            {{ props.item.status | capitalize }}
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
    search: '',
    headers: [
      { text: i18n.t('Origin'), value: 'origin' },
      { text: i18n.t('Customer'), value: 'customer' },
      { text: i18n.t('Tags'), value: 'tags' },
      { text: i18n.t('Attributes'), value: 'attributes' },
      { text: i18n.t('CreateTime'), value: 'createTime' },
      { text: i18n.t('ReceiveTime'), value: 'receiveTime' },
      { text: i18n.t('Latency'), value: 'latency' },
      { text: i18n.t('Timeout'), value: 'timeout' },
      { text: i18n.t('Since'), value: 'since' },
      { text: i18n.t('Status'), value: 'status' },
      { text: i18n.t('Actions'), value: 'name', sortable: false }
    ]
  }),
  computed: {
    heartbeats() {
      return this.$store.state.heartbeats.heartbeats
        .filter(h => Object.keys(h).some(k => h[k] && h[k].toString().toLowerCase().includes(this.search.toLowerCase())))
    },
    computedHeaders() {
      return this.headers.filter(h => !this.$config.customer_views ? h.value != 'customer' : true)
    },
    isLoading() {
      return this.$store.state.heartbeats.isLoading
    },
    refresh() {
      return this.$store.state.refresh
    },
    pagination: {
      get() {
        return this.$store.state.heartbeats.pagination
      },
      set(value) {
        this.$store.dispatch('heartbeats/setPagination', value)
      }
    },
    status: {
      get() {
        return this.$store.state.heartbeats.filter.status
      },
      set(value) {
        this.$store.dispatch('heartbeats/setFilter', {status: value})
      }
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
      confirm(i18n.t('ConfirmDelete')) &&
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
