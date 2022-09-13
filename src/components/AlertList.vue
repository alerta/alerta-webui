<template>
  <v-data-table
    v-model="selected"
    :headers="tableHeaders"
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
    :show-select="selectable"
    @click:row="openItem"
    :item-class="getSeverity"
    disable-filtering
  >
    <template v-for="(_, slot) in $slots">
      <template :slot="slot"><slot :name="slot" /></template>
    </template>

    <template v-slot:[`item.incident`]="{ item }">
      <div class="d-flex justify-center" v-if="item.incident">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              v-on="on"
              :to="{
                name: 'incident',
                params: { id: item.incident },
                query: { 'from-alerts': true }
              }"
              icon
              @click.native.stop
            >
              <v-icon small>mdi-group</v-icon>{{ item.incident.shortId }}
            </v-btn>
          </template>
          <span>Open Incident</span>
        </v-tooltip>
      </div>
    </template>

    <template v-slot:[`item.id`]="{ item }">
      {{ item.id | shortId }}
    </template>
    <template v-slot:[`item.severity`]="{ item }">
      <span :class="['label', `label-${item.severity.toLowerCase()}`]">
        {{ item.severity | capitalize }}
      </span>
    </template>
    <template v-slot:[`item.correlate`]="{ item }">
      {{ item.correlate.join(', ') }}
    </template>
    <template v-slot:[`item.status`]="{ item }">
      <span class="label">
        {{ item.status | capitalize }}
      </span>
      <span v-if="showNotesIcon && lastNote(item)">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon small v-on="on">mdi-note</v-icon>
          </template>
          <span>{{ lastNote(item) }}</span>
        </v-tooltip>
      </span>
    </template>
    <template v-slot:[`item.tags`]="{ item }">
      <span v-for="tag in item.tags" :key="tag" class="label">
        {{ tag }}
      </span>
    </template>
    <template v-slot:[`item.service`]="{ item }">
      {{ item.service.join(', ') }}
    </template>
    <template v-slot:[`item.type`]="{ item }">
      <span class="label">
        {{ item.type | splitCaps }}
      </span>
    </template>
    <template v-slot:[`item.resource`]="{ item }">
      <span class="text-truncate" @contextmenu="clipboardCopy(item.resource)">
        {{ item.resource }}
      </span>
    </template>
    <template v-slot:[`item.event`]="{ item }">
      <span class="text-truncate" @contextmenu="clipboardCopy(item.event)">
        {{ item.event }}
      </span>
    </template>
    <template v-slot:[`item.value`]="{ item }">
      <div class="text-truncate">
        <span v-html="item.value" />
      </div>
    </template>
    <template v-slot:[`item.text`]="{ item }">
      {{ item.text }}
    </template>
    <template v-slot:[`item.duration`]="{ item }">
      <span class="text-sm-right">
        {{ duration(item) | hhmmss }}
      </span>
    </template>
    <template v-slot:[`item.label`]="{ item }">
      <span class="label">
        {{ item.repeat | capitalize }}
      </span>
    </template>
    <template v-slot:[`item.receiveTime`]="{ item }">
      <date-format :value="item.receiveTime" format="mediumDate" />
    </template>
    <template v-slot:[`item.lastReceiveTime`]="{ item }">
      <date-format :value="item.lastReceiveTime" format="mediumDate" />
    </template>
    <template v-slot:[`item.createTime`]="{ item }">
      <date-format :value="item.createTime" format="mediumDate" />
    </template>
    <template v-slot:[`item.timeout`]="{ item }">
      {{ item.timeout | hhmmss }}
    </template>
    <template v-slot:[`item.timeoutLeft`]="{ item }">
      <span class="text-sm-right">
        {{ timeoutLeft(item) }}
      </span>
    </template>
    <template v-slot:[`item.repeat`]="{ item }">
      <span class="label">
        {{ item.repeat | capitalize }}
      </span>
    </template>
    <template v-slot:[`item.previousSeverity`]="{ item }">
      <span :class="['label', `label-${item.previousSeverity.toLowerCase()}`]">
        {{ item.previousSeverity | capitalize }}
      </span>
    </template>
    <template v-slot:[`item.lastReceiveId`]="{ item }">
      {{ item.lastReceiveId | shortId }}
    </template>
    <template v-slot:[`item.note`]="{ item }">
      {{ lastNote(item) }}
    </template>

    <template v-slot:[`item.actions`]="{ item }">
      <div class="row-actions">
        <v-btn
          v-if="isAcked(item.status) || isClosed(item.status)"
          text
          icon
          small
          plain
          class="pa-0 ma-0"
          @click.stop="takeAction(item.id, 'open')"
        >
          <v-icon :size="fontSize">mdi-refresh</v-icon>
        </v-btn>

        <v-btn
          v-if="!isWatched(item.tags)"
          text
          icon
          small
          plain
          class="pa-0 ma-0"
          @click.stop="watchAlert(item.id)"
        >
          <v-icon :size="fontSize">mdi-eye</v-icon>
        </v-btn>
        <v-btn
          v-if="isWatched(item.tags)"
          text
          icon
          small
          plain
          class="pa-0 ma-0"
          @click.stop="unwatchAlert(item.id)"
        >
          <v-icon :size="fontSize">mdi-eye-off</v-icon>
        </v-btn>

        <v-btn
          v-if="isOpen(item.status)"
          text
          icon
          small
          plain
          class="pa-0 ma-0"
          @click.stop="ackAlert(item.id)"
        >
          <v-icon :size="fontSize">mdi-check</v-icon>
        </v-btn>
        <v-btn
          v-if="isAcked(item.status)"
          text
          icon
          small
          plain
          class="pa-0 ma-0"
          @click.stop="takeAction(item.id, 'unack')"
        >
          <v-icon :size="fontSize">mdi-undo</v-icon>
        </v-btn>

        <v-btn
          v-if="isOpen(item.status) || isAcked(item.status)"
          text
          icon
          small
          plain
          class="pa-0 ma-0"
          @click.stop="shelveAlert(item.id)"
        >
          <v-icon :size="fontSize">mdi-clock-outline</v-icon>
        </v-btn>
        <v-btn
          v-if="isShelved(item.status)"
          text
          icon
          small
          plain
          class="pa-0 ma-0"
          @click.stop="takeAction(item.id, 'unshelve')"
        >
          <v-icon :size="fontSize">mdi-restore</v-icon>
        </v-btn>

        <v-btn
          v-if="!isClosed(item.status)"
          text
          icon
          small
          plain
          class="pa-0 ma-0"
          @click.stop="takeAction(item.id, 'close')"
        >
          <v-icon :size="fontSize">mdi-close-circle-outline</v-icon>
        </v-btn>
        <v-btn
          text
          icon
          small
          plain
          class="pa-0 ma-0"
          @click.stop="deleteAlert(item.id)"
        >
          <v-icon :size="fontSize">mdi-delete</v-icon>
        </v-btn>

        <v-menu bottom left>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" text icon plain small class="pa-0 ma-0">
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
</template>

<script lang='ts'>
import i18n from '@/plugins/i18n'
import debounce from 'lodash/debounce'
import DateFormat from '@/components/lib/DateFormat.vue'
import { DateTime } from 'luxon'
import Vue, { PropType } from 'vue'
import { IAlerts } from '@/store/interfaces'
import { DataTableHeader } from 'vuetify'

type Alert = Required<IAlerts>['alert']

export default Vue.extend({
  components: {
    DateFormat
  },
  props: {
    selectable: {
      type: Boolean,
      default: true
    },
    alerts: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array as PropType<Array<string>>,
      default: null
    }
  },
  data: () => ({
    search: '',
    headersMap: {
      incident: {
        text: i18n.t('Incident'),
        value: 'incident',
        sortable: false,
        align: 'center',
        class: 'pa-0',
        cellClass: 'pa-0'
      },
      id: { text: i18n.t('AlertId'), value: 'id' },
      resource: { text: i18n.t('Resource'), value: 'resource' },
      event: { text: i18n.t('Event'), value: 'event' },
      environment: { text: i18n.t('Environment'), value: 'environment' },
      severity: { text: i18n.t('Severity'), value: 'severity' },
      correlate: { text: i18n.t('Correlate'), value: 'correlate' },
      status: { text: i18n.t('Status'), value: 'status', cellClass: 'status' },
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
        value: 'duplicateCount',
        align: 'center'
      },
      repeat: { text: i18n.t('Repeat'), value: 'repeat' },
      previousSeverity: {
        text: i18n.t('PrevSeverity'),
        value: 'previousSeverity'
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
    } as Record<string, DataTableHeader>,
    details: false,
    selectedId: null,
    multiselect: false,
    timer: null
  }),
  beforeDestroy() {
    this.$store.dispatch('alerts/updateSelected', [])
  },
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
        return {
          ...this.$store.state.alerts.pagination
        }
      },
      set(value) {
        this.$store.dispatch('alerts/setPagination', value)
      }
    },
    actions() {
      return this.$config.actions
    },
    tableHeaders() {
      return [
        ...new Set<string>(
          this.columns ?? ['incident', ...this.$config.columns]
        )
      ].map(
        (c) =>
          this.headersMap[c] || {
            text: this.$options.filters?.capitalize(c),
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
  mounted() {
    this.pagination = { itemsPerPage: this.itemsPerPage }
  },
  watch: {
    itemsPerPage(val) {
      this.pagination = { itemsPerPage: val }
    }
  },
  methods: {
    duration(item: Alert) {
      return DateTime.fromISO(item.receiveTime)
    },
    timeoutLeft(item: Alert) {
      const ackedOrShelved =
        this.isShelved(item.status) || this.isAcked(item.status)
      const lastModified =
        ackedOrShelved && item.updateTime
          ? item.updateTime
          : item.lastReceiveTime

      const expireTime = DateTime.fromISO(lastModified)
        .plus({
          seconds: item.timeout
        })
        .diffNow()

      return expireTime.toMillis() > 0
        ? expireTime.toFormat('hh:mm:ss')
        : '00:00:00'
    },
    lastNote(item: Alert) {
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
    getSeverity(item: Alert) {
      return `row-${item.severity}`
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    openItem(item: Alert, _options) {
      !this.selected.length && this.$emit('set-alert', item)
    },
    isOpen(status: Alert['status']) {
      return status === 'open' || status === 'NORM'
    },
    isWatched(tags: Alert['tags']) {
      return tags ? tags.indexOf(`watch:${this.username}`) > -1 : false
    },
    isAcked(status: Alert['status']) {
      return status === 'ack' || status === 'ACKED'
    },
    isShelved(status: Alert['status']) {
      return status === 'shelved' || status === 'SHLVD'
    },
    isClosed(status: Alert['status']) {
      return status === 'closed'
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
        confirm(i18n.t('ConfirmDelete').toString()) &&
          this.$store
            .dispatch('alerts/deleteAlert', id)
            .then(() => this.$store.dispatch('alerts/getAlerts'))
      },
      200,
      { leading: true, trailing: false }
    ),
    clipboardCopy(text: string) {
      if (!window.isSecureContext || !navigator.clipboard) return
      navigator.clipboard.writeText(text)
      this.$store.dispatch('notifications/success', 'Copied to clipboard')
    }
  }
})
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

.status {
  white-space: nowrap;
  & > :nth-child(2) {
    margin-left: 0.25rem;
  }
}

.value-header {
  width: var(--value-width);
  min-width: var(--value-width);
}

.text-header {
  width: var(--text-width);
  min-width: var(--text-width);
}

$severities: 'warning', 'critical', 'debug', 'cleared', 'indeterminate',
  'informational', 'major', 'minor', 'normal', 'ok', 'security', 'trace',
  'unknown';

@each $severity in $severities {
  .row-#{$severity} {
    background: var(--bg-#{$severity});
    color: var(--text-#{$severity});

    &:hover,
    &.v-data-table__selected {
      background: var(--bg-#{$severity}) !important;
      filter: brightness(0.87);
    }
  }
}
</style>
