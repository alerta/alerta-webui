<!-- eslint-disable vuetify/no-deprecated-components -->
<template>
  <v-card>
    <v-card-title class="text-h6">
      {{ $t('Heartbeats') }}
      <v-spacer />
      <v-btn-toggle
        v-model="status"
        class="bg-transparent"
        multiple
      >
        <v-btn
          value="ok"
          variant="flat"
        >
          <v-tooltip location="bottom">
            <template #activator="{props}">
              <v-icon v-bind="props">
                check_circle
              </v-icon>
            </template>
            <span>{{ $t('OK') }}</span>
          </v-tooltip>
        </v-btn>
        <v-btn
          value="slow"
          variant="flat"
        >
          <v-tooltip location="bottom">
            <template #activator="{props}">
              <v-icon v-bind="props">
                access_time
              </v-icon>
            </template>
            <span>{{ $t('Slow') }}</span>
          </v-tooltip>
        </v-btn>
        <v-btn
          value="expired"
          variant="flat"
        >
          <v-tooltip location="bottom">
            <template #activator="{props}">
              <v-icon v-bind="props">
                timer_off
              </v-icon>
            </template>
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
      v-model:pagination="pagination"
      class="px-2"
      :search="search"
      :loading="isLoading"
      must-sort
      sort-icon="arrow_drop_down"
      item-props
    >
      <template #item="{item}">
        <tr>
          <td>{{ item.props.origin }}</td>
          <td
            v-if="$config.customer_views"
          >
            {{ item.props.customer }}
          </td>
          <td>
            <v-chip
              v-for="tag in item.props.tags"
              :key="tag"
              label
              small
            >
              <v-icon start>
                label
              </v-icon>{{ tag }}
            </v-chip>
          </td>
          <td>
            {{ item.props.attributes }}
          </td>
          <td>
            <date-time
              :value="item.props.createTime"
              format="mediumDate"
            />
          </td>
          <td>
            <date-time
              :value="item.props.receiveTime"
              format="mediumDate"
            />
          </td>
          <td>
            {{ diffTime(item.props.createTime, item.props.receiveTime) }} ms
          </td>
          <td
            class="text-center text-no-wrap"
          >
            {{ this.$filters.hhmmss(timeoutLeft(item.props.title)) }}
          </td>
          <td>
            {{ this.$filters.timeago(item.props.receiveTime) }}
          </td>
          <td>
            <span :class="['label', 'label-' + item.props.status.toLowerCase()]">
              {{ this.$filters.capitalize(item.props.status) }}
            </span>
          </td>
          <td class="text-no-wrap">
            <v-btn
              v-has-perms.disable="'write:heartbeats'"
              icon
              class="btn--plain mr-0"
              @click="deleteItem(item.props)"
            >
              <v-icon
                size="small"
                color="grey-darken-3"
              >
                delete
              </v-icon>
            </v-btn>
          </td>
        </tr>
      </template>
      <template #no-data>
        <v-alert
          :value="true"
          color="error"
          icon="warning"
        >
          {{ $t('NoDisplay') }}
        </v-alert>
      </template>
      <template #no-results>
        <v-alert
          :value="true"
          color="error"
          icon="warning"
        >
          {{ $t('SearchNoResult1') }} "{{ search }}" {{ $t('SearchNoResult2') }}
        </v-alert>
      </template>
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
      { title: i18n.global.t('Origin'), key: 'origin' },
      { title: i18n.global.t('Customer'), key: 'customer' },
      { title: i18n.global.t('Tags'), key: 'tags' },
      { title: i18n.global.t('Attributes'), key: 'attributes' },
      { title: i18n.global.t('CreateTime'), key: 'createTime' },
      { title: i18n.global.t('ReceiveTime'), key: 'receiveTime' },
      { title: i18n.global.t('Latency'), key: 'latency' },
      { title: i18n.global.t('Timeout'), key: 'timeout' },
      { title: i18n.global.t('Since'), key: 'since' },
      { title: i18n.global.t('Status'), key: 'status' },
      { title: i18n.global.t('Actions'), key: 'name', sortable: false }
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
