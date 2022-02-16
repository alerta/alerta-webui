<template>
  <div>
    <v-data-table
      v-model="selected"
      :headers="customHeaders"
      :items="alerts"
      item-key="id"
      :options.sync="pagination"
      :server-items-length="pagination.totalItems"
      :footer-props="pagination"
      :loading="isSearching"
      :loading-text="$t('Loading')"
      :dense="displayDensity == 'compact'"
      :style="[columnWidths, severityColors]"
      :header-props="{ sortIcon: 'mdi-chevron-down' }"
      show-select
      @click:row="openItem"
      :item-class="getSeverity"
    >
      <template v-slot:item.id="{ item }">
        {{ item.id | shortId }}
      </template>
      <template v-slot:item.severity="{ item }">
        <span :class="['label', `label-${item.severity.toLowerCase()}`]">
          {{ item.severity | capitalize }}
        </span>
      </template>
      <template v-slot:item.correlate="{ item }">
        {{ item.correlate.join(', ') }}
      </template>
      <template v-slot:item.status="{ item }">
        <span class="label">
          {{ item.status | capitalize }}
        </span>
        <span v-if="showNotesIcon">
          <span v-if="lastNote(item)" class="pl-2">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon v-bind="attrs" small v-on="on">mdi-note</v-icon>
              </template>
              <span>{{ lastNote(item) }}</span>
            </v-tooltip>
          </span>
        </span>
      </template>
      <template v-slot:item.tags="{ item }">
        <span v-for="tag in item.tags" :key="tag">
          <span class="label">{{ tag }}</span>
          &nbsp;
        </span>
      </template>
      <template v-slot:item.service="{ item }">
        {{ item.service.join(', ') }}
      </template>
      <template v-slot:item.type="{ item }">
        <span class="label">
          {{ item.type | splitCaps }}
        </span>
      </template>
      <template v-slot:item.resource="{ item }">
        <span class="text-truncate">
          {{ item.resource }}
        </span>
      </template>
      <template v-slot:item.value="{ item }">
        <div class="text-truncate">
          <span v-html="item.value" />
        </div>
      </template>
      <template v-slot:item.text="{ item }">
        {{ item.text }}
      </template>
      <template v-slot:item.duration="{ item }">
        <span class="text-sm-right">
          {{ duration(item) | hhmmss }}
        </span>
      </template>
      <template v-slot:item.label="{ item }">
        <span class="label">
          {{ item.repeat | capitalize }}
        </span>
      </template>
      <template v-slot:item.receiveTime="{ item }">
        <date-time :value="item.receiveTime" format="mediumDate" />
      </template>
      <template v-slot:item.lastReceiveTime="{ item }">
        <date-time :value="item.lastReceiveTime" format="mediumDate" />
      </template>
      <template v-slot:item.createTime="{ item }">
        <date-time :value="item.createTime" format="mediumDate" />
      </template>
      <template v-slot:item.timeout="{ item }">
        {{ item.timeout | hhmmss }}
      </template>
      <template v-slot:item.timeoutLeft="{ item }">
        <span class="text-sm-right">
          {{ timeoutLeft(item) | hhmmss }}
        </span>
      </template>
      <template v-slot:item.repeat="{ item }">
        <span class="label">
          {{ item.repeat | capitalize }}
        </span>
      </template>
      <template v-slot:item.previousSeverity="{ item }">
        <span
          :class="['label', `label-${item.previousSeverity.toLowerCase()}`]"
        >
          {{ item.previousSeverity | capitalize }}
        </span>
      </template>
      <template v-slot:item.lastReceiveId="{ item }">
        {{ item.lastReceiveId | shortId }}
      </template>
      <template v-slot:item.note="{ item }">
        {{ lastNote(item) }}
      </template>

      <template v-slot:item.actions="{ item }">
        <div class="row-actions">
          <v-btn
            v-if="isAcked(item.status) || isClosed(item.status)"
            text
            icon
            small
            class="btn--plain pa-0 ma-0"
            @click.stop="takeAction(item.id, 'open')"
          >
            <v-icon :size="fontSize">mdi-refresh</v-icon>
          </v-btn>

          <v-btn
            v-if="!isWatched(item.tags)"
            text
            icon
            small
            class="btn--plain pa-0 ma-0"
            @click.stop="watchAlert(item.id)"
          >
            <v-icon :size="fontSize">mdi-eye</v-icon>
          </v-btn>
          <v-btn
            v-if="isWatched(item.tags)"
            text
            icon
            small
            class="btn--plain pa-0 ma-0"
            @click.stop="unwatchAlert(item.id)"
          >
            <v-icon :size="fontSize">mdi-eye-off</v-icon>
          </v-btn>

          <v-btn
            v-if="isOpen(item.status)"
            text
            icon
            small
            class="btn--plain pa-0 ma-0"
            @click.stop="ackAlert(item.id)"
          >
            <v-icon :size="fontSize">mdi-check</v-icon>
          </v-btn>
          <v-btn
            v-if="isAcked(item.status)"
            text
            icon
            small
            class="btn--plain pa-0 ma-0"
            @click.stop="takeAction(item.id, 'unack')"
          >
            <v-icon :size="fontSize">mdi-undo</v-icon>
          </v-btn>

          <v-btn
            v-if="isOpen(item.status) || isAcked(item.status)"
            text
            icon
            small
            class="btn--plain pa-0 ma-0"
            @click.stop="shelveAlert(item.id)"
          >
            <v-icon :size="fontSize">mdi-clock-outline</v-icon>
          </v-btn>
          <v-btn
            v-if="isShelved(item.status)"
            text
            icon
            small
            class="btn--plain pa-0 ma-0"
            @click.stop="takeAction(item.id, 'unshelve')"
          >
            <v-icon :size="fontSize">mdi-restore</v-icon>
          </v-btn>

          <v-btn
            v-if="!isClosed(item.status)"
            text
            icon
            small
            class="btn--plain pa-0 ma-0"
            @click.stop="takeAction(item.id, 'close')"
          >
            <v-icon :size="fontSize">mdi-close-circle-outline</v-icon>
          </v-btn>
          <v-btn
            text
            icon
            small
            class="btn--plain pa-0 ma-0"
            @click.stop="deleteAlert(item.id)"
          >
            <v-icon :size="fontSize">mdi-delete</v-icon>
          </v-btn>

          <v-menu bottom left>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" text icon small class="btn--plain pa-0 ma-0">
                <v-icon small>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>

            <v-list subheader>
              <v-subheader>Actions</v-subheader>
              <v-divider />
              <v-list-item
                v-for="(action, i) in actions"
                :key="i"
                @click.stop="takeAction(item.id, action)"
              >
                <v-list-item-title>{{ action | splitCaps }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import i18n from '@/plugins/i18n'
import debounce from 'lodash/debounce'
import moment from 'moment'
import DateTime from '@/components/lib/DateTime.vue'

export default {
  components: {
    DateTime
  },
  props: {
    alerts: {
      type: Array,
      default: () => []
    }
  },
  data: () => ({
    search: '',
    headersMap: {
      id: { text: i18n.t('AlertId'), value: 'id' },
      resource: { text: i18n.t('Resource'), value: 'resource' },
      event: { text: i18n.t('Event'), value: 'event' },
      environment: { text: i18n.t('Environment'), value: 'environment' },
      severity: { text: i18n.t('Severity'), value: 'severity' },
      correlate: { text: i18n.t('Correlate'), value: 'correlate' },
      status: { text: i18n.t('Status'), value: 'status' },
      service: { text: i18n.t('Service'), value: 'service' },
      group: { text: i18n.t('Group'), value: 'group' },
      value: { text: i18n.t('Value'), value: 'value', class: 'value-header' },
      text: {
        text: i18n.t('Description'),
        value: 'text',
        class: 'text-header'
      },
      tags: { text: i18n.t('Tags'), value: 'tags' },
      attributes: { text: i18n.t('Attribute'), value: 'attributes' },
      origin: { text: i18n.t('Origin'), value: 'origin' },
      type: { text: i18n.t('Type'), value: 'type' },
      createTime: { text: i18n.t('CreateTime'), value: 'createTime' },
      timeout: { text: i18n.t('Timeout'), value: 'timeout' },
      timeoutLeft: { text: i18n.t('TimeoutLeft'), value: 'timeoutLeft' },
      customer: { text: i18n.t('Customer'), value: 'customer' },
      duplicateCount: {
        text: i18n.t('Dupl'),
        value: 'duplicateCount'
      },
      repeat: { text: i18n.t('Repeat'), value: 'repeat' },
      previousSeverity: {
        text: i18n.t('PrevSeverity'),
        value: 'previousSeverity'
      },
      trendIndication: {
        text: i18n.t('TrendIndication'),
        value: 'trendIndication'
      },
      receiveTime: { text: i18n.t('ReceiveTime'), value: 'receiveTime' },
      duration: {
        text: i18n.t('Duration'),
        value: 'duration',
        sortable: false
      },
      lastReceiveId: { text: i18n.t('LastReceiveId'), value: 'lastReceiveId' },
      lastReceiveTime: {
        text: i18n.t('LastReceiveTime'),
        value: 'lastReceiveTime'
      },
      note: { text: i18n.t('LastNote'), value: 'note', sortable: false }
    },
    details: false,
    selectedId: null,
    multiselect: false,
    timer: null
  }),
  computed: {
    displayDensity() {
      return (
        this.$store.getters.getPreference('displayDensity') ||
        this.$store.state.alerts.displayDensity
      )
    },
    severityColors() {
      const colors = this.$store.getters.getConfig('colors')

      return {
        ...Object.entries(colors.severity).reduce(
          (acc, [severity, color]) => ({
            ...acc,
            [`--bg-${severity}`]: color,
            [`--text-${severity}`]: colors.text
          }),
          {}
        )
      }
    },
    fontStyle() {
      const font = this.$store.getters.getPreference('font')
      return {
        'font-family': font['font-family'],
        'font-size': font['font-size'],
        'font-weight': font['font-weight']
      }
    },
    fontSize() {
      return this.$store.getters.getPreference('font')['font-size']
    },
    columnWidths() {
      return {
        '--value-width': this.valueWidth() + 'px',
        '--text-width': this.textWidth() + 'px'
      }
    },
    isLoading() {
      return this.$store.state.alerts.isLoading
    },
    isSearching() {
      return this.$store.state.alerts.isSearching ? 'primary' : false
    },
    showNotesIcon() {
      return this.$store.getters.getPreference('showNotesIcon')
    },
    itemsPerPage() {
      return this.$store.getters.getPreference('itemsPerPage')
    },
    pagination: {
      get() {
        return this.$store.state.alerts.pagination
      },
      set(value) {
        this.$store.dispatch('alerts/setPagination', value)
      }
    },
    actions() {
      return this.$config.actions
    },
    customHeaders() {
      return this.$config.columns.map(
        (c) =>
          this.headersMap[c] || {
            text: this.$options.filters.capitalize(c),
            value: 'attributes.' + c
          }
      )
    },
    selectableRows() {
      return this.selected.length > 0
    },
    selected: {
      get() {
        return this.$store.state.alerts.selected
      },
      set(value) {
        this.$store.dispatch('alerts/updateSelected', value)
      }
    },
    ackTimeout() {
      return this.$store.getters.getPreference('ackTimeout')
    },
    shelveTimeout() {
      return this.$store.getters.getPreference('shelveTimeout')
    },
    username() {
      return this.$store.getters['auth/getUsername']
    }
  },
  watch: {
    itemsPerPage(val) {
      this.pagination = Object.assign({}, this.pagination, {
        itemsPerPage: val
      })
    }
  },
  methods: {
    duration(item) {
      return moment.duration(moment().diff(moment(item.receiveTime)))
    },
    timeoutLeft(item) {
      const ackedOrShelved =
        this.isShelved(item.status) || this.isAcked(item.status)
      const lastModified =
        ackedOrShelved && item.updateTime
          ? item.updateTime
          : item.lastReceiveTime
      const expireTime = moment(lastModified).add(item.timeout, 'seconds')
      return expireTime.isAfter()
        ? expireTime.diff(moment(), 'seconds')
        : moment.duration()
    },
    lastNote(item) {
      const note = item.history
        .filter((h) => h.type == 'note' || h.type == 'dismiss')
        .pop()
      return note && note.type == 'note' ? note.text : ''
    },
    valueWidth() {
      return this.$store.getters.getPreference('valueWidth')
    },
    textWidth() {
      return this.$store.getters.getPreference('textWidth')
    },
    getSeverity(item) {
      return `row-${item.severity}`
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    openItem(item, ..._args) {
      !this.selected.length && this.$emit('set-alert', item)
    },
    isOpen(status) {
      return status == 'open' || status == 'NORM'
    },
    isWatched(tags) {
      return tags ? tags.indexOf(`watch:${this.username}`) > -1 : false
    },
    isAcked(status) {
      return status == 'ack' || status == 'ACKED'
    },
    isShelved(status) {
      return status == 'shelved' || status == 'SHLVD'
    },
    isClosed(status) {
      return status == 'closed'
    },
    takeAction: debounce(
      function (id, action) {
        this.$store
          .dispatch('alerts/takeAction', [id, action, ''])
          .then(() => this.$store.dispatch('alerts/getAlerts'))
      },
      200,
      { leading: true, trailing: false }
    ),
    ackAlert: debounce(
      function (id) {
        this.$store
          .dispatch('alerts/takeAction', [id, 'ack', '', this.ackTimeout])
          .then(() => this.$store.dispatch('alerts/getAlerts'))
      },
      200,
      { leading: true, trailing: false }
    ),
    shelveAlert: debounce(
      function (id) {
        this.$store
          .dispatch('alerts/takeAction', [id, 'shelve', '', this.shelveTimeout])
          .then(() => this.$store.dispatch('alerts/getAlerts'))
      },
      200,
      { leading: true, trailing: false }
    ),
    watchAlert: debounce(
      function (id) {
        this.$store
          .dispatch('alerts/watchAlert', id)
          .then(() => this.$store.dispatch('alerts/getAlerts'))
      },
      200,
      { leading: true, trailing: false }
    ),
    unwatchAlert: debounce(
      function (id) {
        this.$store
          .dispatch('alerts/unwatchAlert', id)
          .then(() => this.$store.dispatch('alerts/getAlerts'))
      },
      200,
      { leading: true, trailing: false }
    ),
    deleteAlert: debounce(
      function (id) {
        confirm(i18n.t('ConfirmDelete')) &&
          this.$store
            .dispatch('alerts/deleteAlert', id)
            .then(() => this.$store.dispatch('alerts/getAlerts'))
      },
      200,
      { leading: true, trailing: false }
    ),
    clipboardCopy(text) {
      if (!window.isSecureContext || !navigator.clipboard) return
      navigator.clipboard.writeText(text)
    }
  }
}
</script>

<style lang="scss">
.row-actions {
  display: flex;
  width: fit-content;
  align-items: center;
}

.row-actions > button {
  color: inherit !important;
}

.value-header {
  width: var(--value-width);
  min-width: var(--value-width);
}

.text-header {
  width: var(--text-width);
  min-width: var(--text-width);
}

.label {
  font-weight: bold;
  line-height: 14px;
  color: #ffffff;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  white-space: nowrap;
  vertical-align: baseline;
  background-color: #999999;
  padding: 1px 4px 2px;
  border-radius: 3px;

  &.label-critical {
    background-color: #b94a48;
  }

  &.label-major {
    background-color: #f89406;
  }

  &.label-minor {
    background-color: #ffd700;
  }

  &.label-warning {
    background-color: #3a87ad;
  }

  &.label-normal,
  &.label-cleared,
  &.label-ok,
  &.label-informational {
    background-color: #468847;
  }

  &.label-inverse {
    background-color: #333333;
  }
}

$severities: 'warning', 'critical', 'debug', 'cleared', 'indeterminate',
  'informational', 'major', 'minor', 'normal', 'ok', 'security', 'trace',
  'unknown';

@each $severity in $severities {
  .row-#{$severity} {
    background: var(--bg-#{$severity});
    color: var(--text-#{$severity});

    &:hover {
      background: var(--bg-#{$severity}) !important;
      filter: brightness(0.87);
    }
  }
}
</style>
