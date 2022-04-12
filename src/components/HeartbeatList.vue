<template>
  <v-card>
    <v-card-title class="title">
      {{ $t('Heartbeats') }}
      <v-spacer />
      <v-btn-toggle v-model="status" class="transparent" multiple>
        <v-btn value="ok" text>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-icon v-on="on">mdi-check-circle</v-icon>
            </template>
            <span>{{ $t('OK') }}</span>
          </v-tooltip>
        </v-btn>
        <v-btn value="slow" text>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-icon v-on="on">mdi-clock-outline</v-icon>
            </template>
            <span>{{ $t('Slow') }}</span>
          </v-tooltip>
        </v-btn>
        <v-btn value="expired" text>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-icon v-on="on">mdi-timer-off-outline</v-icon>
            </template>
            <span>{{ $t('Expired') }}</span>
          </v-tooltip>
        </v-btn>
      </v-btn-toggle>
      <v-spacer />
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        :label="$t('Search')"
        single-line
        hide-details
      />
    </v-card-title>

    <v-data-table
      :headers="computedHeaders"
      :items="heartbeats"
      :footer-props="{ itemsPerPageOptions }"
      :options.sync="pagination"
      class="px-2"
      :search="search"
      :loading="isLoading"
      must-sort
      :header-props="{ sortIcon: 'mdi-chevron-down' }"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.origin }}</td>
        <td v-if="$config.customer_views">
          {{ props.item.customer }}
        </td>
        <td>
          <v-chip v-for="tag in props.item.tags" :key="tag" label small>
            <v-icon left>mdi-label</v-icon>{{ tag }}
          </v-chip>
        </td>
        <td>
          {{ props.item.attributes }}
        </td>
        <td>
          <date-format :value="props.item.createTime" format="mediumDate" />
        </td>
        <td>
          <date-format :value="props.item.receiveTime" format="mediumDate" />
        </td>
        <td>
          {{ diffTime(props.item.createTime, props.item.receiveTime) }} ms
        </td>
        <td class="text-sm-center text-no-wrap">
          {{ timeoutLeft(props.item) }}
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
            plain
            class="mr-0"
            @click="deleteItem(props.item)"
          >
            <v-icon small color="grey darken-3">mdi-delete</v-icon>
          </v-btn>
        </td>
      </template>
      <template slot="no-data">
        <v-alert :value="true" color="error" icon="mdi-alert">
          {{ $t('NoDisplay') }}
        </v-alert>
      </template>
      <v-alert slot="no-results" :value="true" color="error" icon="mdi-alert">
        {{ $t('SearchNoResult1') }} "{{ search }}" {{ $t('SearchNoResult2') }}
      </v-alert>
    </v-data-table>
  </v-card>
</template>

<script>
import DateFormat from './lib/DateTime.vue'
import { DateTime } from 'luxon'
import i18n from '@/plugins/i18n'

export default {
  components: {
    DateFormat
  },
  data: () => ({
    itemsPerPageOptions: [10, 20, 30, 40, 50],
    pagination: {
      page: 1,
      sortBy: ['receiveTime'],
      sortDesc: [true],
      itemsPerPage: 20
    },
    status: ['ok', 'slow', 'expired'],
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
      return this.$store.state.heartbeats.heartbeats.filter(
        (hb) => !this.status || this.status.includes(hb.status)
      )
    },
    computedHeaders() {
      return this.headers.filter((h) =>
        !this.$config.customer_views ? h.value != 'customer' : true
      )
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
      const expireTime = DateTime.fromISO(item.createTime)
        .plus({
          seconds: item.timeout
        })
        .diffNow()

      return expireTime.toMillis() > 0
        ? expireTime.toFormat('hh:mm:ss')
        : '00:00:00'
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
