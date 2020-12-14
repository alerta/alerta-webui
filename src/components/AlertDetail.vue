<template>
  <v-card
    flat
  >
    <v-card
      tile
      flat
    >
      <v-toolbar
        :color="isDark ? '#616161' : '#eeeeee'"
        dense
      >
        <v-btn
          icon
          @click="dialog = false"
        >
          <v-icon>arrow_back</v-icon>
        </v-btn>

        <v-tooltip bottom>
          <v-btn
            slot="activator"
            :disabled="!isAcked(item.status) && !isClosed(item.status)"
            icon
            class="btn--plain px-1 mx-0"
            @click="takeAction(item.id, 'open')"
          >
            <v-icon
              size="20px"
            >
              refresh
            </v-icon>
          </v-btn>
          <span>{{ $t('Open') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            v-show="!isWatched(item.tags)"
            slot="activator"
            icon
            class="btn--plain px-1 mx-0"
            @click="watchAlert(item.id)"
          >
            <v-icon
              size="20px"
            >
              visibility
            </v-icon>
          </v-btn>
          <span>{{ $t('Watch') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            v-show="isWatched(item.tags)"
            slot="activator"
            icon
            class="btn--plain px-1 mx-0"
            @click="unwatchAlert(item.id)"
          >
            <v-icon
              size="20px"
            >
              visibility_off
            </v-icon>
          </v-btn>
          <span>{{ $t('Unwatch') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            v-show="!isAcked(item.status)"
            slot="activator"
            :disabled="!isOpen(item.status)"
            icon
            class="btn--plain px-1 mx-0"
            @click="ackAlert(item.id)"
          >
            <v-icon
              size="20px"
            >
              check
            </v-icon>
          </v-btn>
          <span>{{ $t('Ack') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            v-show="isAcked(item.status)"
            slot="activator"
            icon
            class="btn--plain px-1 mx-0"
            @click="takeAction(item.id, 'unack')"
          >
            <v-icon
              size="20px"
            >
              undo
            </v-icon>
          </v-btn>
          <span>{{ $t('Unack') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            v-show="!isShelved(item.status)"
            slot="activator"
            :disabled="!isOpen(item.status) && !isAcked(item.status)"
            icon
            class="btn--plain px-1 mx-0"
            @click="shelveAlert(item.id)"
          >
            <v-icon
              size="20px"
            >
              schedule
            </v-icon>
          </v-btn>
          <span>{{ $t('Shelve') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            v-show="isShelved(item.status)"
            slot="activator"
            icon
            class="btn--plain px-1 mx-0"
            @click="takeAction(item.id, 'unshelve')"
          >
            <v-icon
              size="20px"
            >
              restore
            </v-icon>
          </v-btn>
          <span>{{ $t('Unshelve') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            slot="activator"
            :disabled="isClosed(item.status)"
            icon
            class="btn--plain px-1 mx-0"
            @click="takeAction(item.id, 'close')"
          >
            <v-icon
              size="20px"
            >
              highlight_off
            </v-icon>
          </v-btn>
          <span>{{ $t('Close') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            slot="activator"
            icon
            class="btn--plain px-1 mx-0"
            @click="deleteAlert(item.id)"
          >
            <v-icon
              size="20px"
            >
              delete
            </v-icon>
          </v-btn>
          <span>{{ $t('Delete') }}</span>
        </v-tooltip>

        <v-tooltip
          :key="copyIconText"
          bottom
        >
          <v-btn
            slot="activator"
            icon
            class="btn--plain px-1 mx-0"
            @click="clipboardCopy(JSON.stringify(item, null, 4))"
          >
            <v-icon
              size="20px"
            >
              content_copy
            </v-icon>
          </v-btn>
          <span>{{ copyIconText }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-menu
            slot="activator"
            bottom
            left
          >
            <v-btn
              slot="activator"
              icon
              class="btn--plain px-1 mx-0"
            >
              <v-icon>
                more_vert
              </v-icon>
            </v-btn>

            <v-list
              subheader
            >
              <v-subheader>Actions</v-subheader>
              <v-divider />
              <v-list-tile
                v-for="(action, i) in actions"
                :key="i"
                @click="takeAction(item.id, action)"
              >
                <v-list-tile-title>{{ action | splitCaps }}</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
          <span>{{ $t('More') }}</span>
        </v-tooltip>
      </v-toolbar>

      <v-card
        flat
      >
        <v-tabs
          v-model="active"
          grow
        >
          <v-tab ripple>
            <v-icon>info</v-icon>&nbsp;{{ $t('Details') }}
          </v-tab>
          <v-tab-item
            :transition="false"
            :reverse-transition="false"
          >
            <v-card
              flat
            >
              <v-alert
                v-for="note in notes"
                :key="note.id"
                :value="true"
                dismissible
                type="info"
                class="ma-1"
                @input="deleteNote(item.id, note.id)"
              >
                <b>{{ note.user || 'Anonymous' }}</b> {{ $t('addedNoteOn') }}
                <span v-if="note.updateTime">
                  <b><date-time
                    :value="note.updateTime"
                    format="longDate"
                  /></b> ({{ note.updateTime | timeago }})<br>
                </span>
                <span v-else>
                  <b><date-time
                    :value="note.createTime"
                    format="longDate"
                  /></b> ({{ note.createTime | timeago }})<br>
                </span>
                <i>{{ note.text }}</i>
              </v-alert>

              <!-- DEPRECATED -->
              <v-alert
                v-for="note in historyNotes"
                :key="note.index"
                type="info"
                class="ma-1"
                :value="true"
              >
                <b>{{ note.user || 'Anonymous' }}</b> {{ $t('addedNoteOn') }}
                <b><date-time
                  v-if="note.updateTime"
                  :value="note.updateTime"
                  format="longDate"
                /></b> ({{ note.updateTime | timeago }})<br>
                <i>{{ note.text }}</i>
              </v-alert>
              <!-- DEPRECATED -->

              <v-card-text>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ $t('AlertId') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        <span class="console-text">{{ item.id }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ $t('LastReceiveAlertId') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        <span class="console-text">{{ item.lastReceiveId }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ $t('CreateTime') }}
                      </div>
                    </div>
                    <div class="flex xs9 text-xs-left">
                      <div>
                        <date-time
                          v-if="item.createTime"
                          :value="item.createTime"
                          format="longDate"
                        />
                        ({{ item.createTime | timeago }})
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ $t('ReceiveTime') }}
                      </div>
                    </div>
                    <div class="flex xs9 text-xs-left">
                      <div>
                        <date-time
                          v-if="item.receiveTime"
                          :value="item.receiveTime"
                          format="longDate"
                        />
                        ({{ item.receiveTime | timeago }})
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ $t('LastReceiveTime') }}
                      </div>
                    </div>
                    <div class="flex xs9 text-xs-left">
                      <div>
                        <date-time
                          v-if="item.lastReceiveTime"
                          :value="item.lastReceiveTime"
                          format="longDate"
                        />
                        ({{ item.lastReceiveTime | timeago }})
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-if="$config.customer_views"
                  class="flex xs12 ma-1"
                >
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ $t('Customer') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div
                        class="clickable"
                        @click="queryBy('customer', item.customer)"
                      >
                        {{ item.customer }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ $t('Service') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        <span
                          v-for="service in item.service"
                          :key="service"
                          @click="queryBy('service', service)"
                        >
                          <span class="clickable">{{ service }}</span>&nbsp;
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ $t('Environment') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div
                        class="clickable"
                        @click="queryBy('environment', item.environment)"
                      >
                        {{ item.environment }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ $t('Resource') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div
                        class="clickable"
                        @click="queryBy('resource', item.resource)"
                      >
                        {{ item.resource }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ $t('Event') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div
                        class="clickable"
                        @click="queryBy('event', item.event)"
                      >
                        {{ item.event }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ $t('Correlate') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        <span
                          v-for="event in item.correlate"
                          :key="event"
                          @click="queryBy('event', event)"
                        >
                          <span class="clickable">{{ event }}</span>&nbsp;
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ $t('Group') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div
                        class="clickable"
                        @click="queryBy('group', item.group)"
                      >
                        {{ item.group }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ $t('Severity') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        <span :class="['label', 'label-' + item.previousSeverity]">
                          {{ item.previousSeverity | capitalize }}
                        </span>&nbsp;&rarr;&nbsp;
                        <span :class="['label', 'label-' + item.severity]">
                          {{ item.severity | capitalize }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ $t('Status') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        <span class="label">
                          {{ item.status | capitalize }}
                        </span>
                        <span
                          v-if="statusNote && statusNote.user"
                        >&nbsp;{{ $t('by') }} <b>{{ statusNote.user }}</b> ({{ statusNote.updateTime | timeago }})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-if="statusNote && statusNote.user && statusNote.text"
                  class="flex xs12 ma-1"
                >
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text" />
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        <v-icon small>
                          error_outline
                        </v-icon>
                        <i>&nbsp;{{ statusNote.text }}</i>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ $t('Value') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        {{ item.value }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ $t('Text') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        <span v-html="item.text" />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ $t('TrendIndication') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        <span class="label">
                          {{ item.trendIndication | splitCaps }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ $t('Timeout') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        {{ item.timeout }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ $t('Type') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        <span class="label">
                          {{ item.type | splitCaps }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ $t('DuplicateCount') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        {{ item.duplicateCount }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ $t('Repeat') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        <span class="label">
                          {{ item.repeat | capitalize }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ $t('Origin') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div
                        class="clickable"
                        @click="queryBy('origin', item.origin)"
                      >
                        {{ item.origin }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ $t('Tags') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div>
                        <v-chip
                          v-for="tag in item.tags"
                          :key="tag"
                          label
                          small
                          @click="queryBy('tags', tag)"
                        >
                          <v-icon left>
                            label
                          </v-icon>{{ tag }}
                        </v-chip>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-for="(value, attr) in item.attributes"
                  :key="attr"
                  class="flex xs12 ma-1"
                >
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-xs-left">
                      <div class="grey--text">
                        {{ attr | splitCaps }}
                      </div>
                    </div>
                    <div class="flex xs6 text-xs-left">
                      <div
                        v-if="typeof value === 'object'"
                      >
                        <span
                          v-for="v in value"
                          :key="v"
                          @click="queryBy(`_.${attr}`, v)"
                        >
                          <span class="clickable">{{ v }}</span>&nbsp;
                        </span>
                      </div>
                      <div
                        v-else-if="typeof value === 'string' && (value.includes('http://') || value.includes('https://'))"
                        v-html="value"
                      />
                      <div
                        v-else
                        class="clickable"
                        @click="queryBy(`_.${attr}`, value)"
                      >
                        {{ value }}
                      </div>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-tab-item>

          <v-tab ripple>
            <v-icon>history</v-icon>&nbsp;{{ $t('History') }}
          </v-tab>
          <v-tab-item
            :transition="false"
            :reverse-transition="false"
          >
            <div class="tab-item-wrapper">
              <v-data-table
                :headers="headersByScreenSize"
                :items="history"
                item-key="index"
                :pagination.sync="pagination"
                sort-icon="arrow_drop_down"
              >
                <template
                  slot="items"
                  slot-scope="props"
                >
                  <td class="hidden-sm-and-down">
                    <span class="console-text">{{ props.item.id | shortId }}</span>
                  </td>
                  <td
                    class="hidden-sm-and-down text-no-wrap"
                  >
                    <date-time
                      :value="props.item.updateTime"
                      format="mediumDate"
                    />
                  </td>
                  <td
                    class="hidden-md-and-up text-no-wrap"
                  >
                    <date-time
                      :value="props.item.updateTime"
                      format="shortTime"
                    />
                  </td>
                  <td class="hidden-sm-and-down">
                    <span :class="['label', 'label-' + props.item.severity]">
                      {{ props.item.severity | capitalize }}
                    </span>
                  </td>
                  <td class="hidden-sm-and-down">
                    <span class="label">
                      {{ props.item.status | capitalize }}
                    </span>
                  </td>
                  <td class="hidden-sm-and-down">
                    {{ props.item.timeout | hhmmss }}
                  </td>
                  <td>
                    <span class="label">
                      {{ props.item.type || 'unknown' | splitCaps }}
                    </span>
                  </td>
                  <td class="hidden-sm-and-down">
                    {{ props.item.event }}
                  </td>
                  <td class="hidden-sm-and-down">
                    {{ props.item.value }}
                  </td>
                  <td>
                    {{ props.item.user }}
                  </td>
                  <td>
                    {{ props.item.text }}
                  </td>
                </template>
              </v-data-table>
            </div>
          </v-tab-item>

          <v-tab ripple>
            <v-icon>assessment</v-icon>&nbsp;{{ $t('Data') }}
          </v-tab>
          <v-tab-item
            :transition="false"
            :reverse-transition="false"
          >
            <v-card
              :color="isDark ? 'grey darken-1' : 'grey lighten-3'"
              class="mx-1"
              style="overflow-x: auto;"
              flat
            >
              <v-card-text>
                <span class="console-text">{{ item.rawData || 'no raw data' }}</span>
              </v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs>
      </v-card>

      <alert-actions
        v-if="item.id"
        :id="item.id"
        :status="item.status"
        :is-watched="isWatched(item.tags)"
        @take-action="takeAction"
        @ack-alert="ackAlert"
        @shelve-alert="shelveAlert"
        @watch-alert="watchAlert"
        @unwatch-alert="unwatchAlert"
        @add-note="addNote"
        @delete-alert="deleteAlert"
      />
    </v-card>
  </v-card>
</template>

<script>
import debounce from 'lodash/debounce'
import DateTime from './lib/DateTime'
import AlertActions from '@/components/AlertActions'
import i18n from '@/plugins/i18n'

export default {
  components: {
    DateTime,
    AlertActions
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data: () => ({
    dialog: true,
    sheet: false,
    active: null,
    pagination: {
      rowsPerPage: 10,
      sortBy: 'updateTime',
      descending: true
    },
    headers: [
      { text: i18n.t('AlertOrNoteId'), value: 'id', hide: 'smAndDown' },
      { text: i18n.t('UpdateTime'), value: 'updateTime', hide: 'smAndDown' },
      { text: i18n.t('Updated'), value: 'updateTime', hide: 'mdAndUp' },
      { text: i18n.t('Severity'), value: 'severity', hide: 'smAndDown' },
      { text: i18n.t('Status'), value: 'status', hide: 'smAndDown' },
      { text: i18n.t('Timeout'), value: 'timeout', hide: 'smAndDown' },
      { text: i18n.t('Type'), value: 'type' },
      { text: i18n.t('Event'), value: 'event', hide: 'smAndDown' },
      { text: i18n.t('Value'), value: 'value', hide: 'smAndDown' },
      { text: i18n.t('User'), value: 'user' },
      { text: i18n.t('Text'), value: 'text' }
    ],
    copyIconText: i18n.t('Copy')
  }),
  computed: {
    isDark() {
      return this.$store.getters.getPreference('isDark')
    },
    item() {
      return this.$store.state.alerts.alert
    },
    actions() {
      return this.$config.actions
    },
    history() {
      return this.item.history
        ? this.item.history.map((h, index) => ({ index: index, ...h }))
        : []
    },
    notes() {
      return this.$store.state.alerts.notes
    },
    // DEPRECATED: notes stored in alert history are deprecated and will be removed in version 8
    historyNotes() {
      return this.history
        .filter(h => h.type == 'note' && h.id == this.id)  // get notes from alert history
    },
    statusNote() {
      return this.history.filter(h => h.type != 'note' && h.status == this.item.status).pop()
    },
    headersByScreenSize() {
      return this.headers.filter(
        h => !h.hide || !this.$vuetify.breakpoint[h.hide]
      )
    },
    ackTimeout() {
      return this.$store.getters.getPreference('ackTimeout')
    },
    shelveTimeout() {
      return this.$store.getters.getPreference('shelveTimeout')
    },
    username() {
      return this.$store.getters['auth/getUsername']
    },
    refresh() {
      return this.$store.state.refresh
    }
  },
  watch: {
    dialog(val) {
      val || this.close()
    },
    refresh(val) {
      if (val) {
        this.getAlert(this.id)
        this.getNotes(this.id)
      }
    }
  },
  created() {
    this.getAlert(this.id)
    this.getNotes(this.id)
  },
  methods: {
    getAlert() {
      this.$store.dispatch('alerts/getAlert', this.id)
    },
    getNotes() {
      this.$store.dispatch('alerts/getNotes', this.id)
    },
    isOpen(status) {
      return status == 'open' || status == 'NORM'
    },
    isWatched(tags) {
      const tag = `watch:${this.username}`
      return tags ? tags.indexOf(tag) > -1 : false
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
    deleteNote(alertId, noteId) {
      this.$store.dispatch('alerts/deleteNote', [alertId, noteId])
    },
    takeAction: debounce(function(id, action, text) {
      this.$store
        .dispatch('alerts/takeAction', [id, action, text])
        .then(() => this.getAlert(this.id))
    }, 200, {leading: true, trailing: false}),
    ackAlert: debounce(function(id, text) {
      this.$store
        .dispatch('alerts/takeAction', [id, 'ack', text, this.ackTimeout])
        .then(() => this.getAlert(this.id))
    }, 200, {leading: true, trailing: false}),
    shelveAlert: debounce(function(id, text) {
      this.$store
        .dispatch('alerts/takeAction', [id, 'shelve', text, this.shelveTimeout])
        .then(() => this.getAlert(this.id))
    }, 200, {leading: true, trailing: false}),
    watchAlert: debounce(function(id) {
      this.$store
        .dispatch('alerts/watchAlert', id)
        .then(() => this.getAlert(this.id))
    }, 200, {leading: true, trailing: false}),
    unwatchAlert: debounce(function(id) {
      this.$store
        .dispatch('alerts/unwatchAlert', id)
        .then(() => this.getAlert(this.id))
    }, 200, {leading: true, trailing: false}),
    addNote: debounce(function(id, text) {
      this.$store
        .dispatch('alerts/addNote', [id, text])
        .then(() => this.getNotes(this.id))
    }, 200, {leading: true, trailing: false}),
    deleteAlert: debounce(function(id) {
      confirm(i18n.t('ConfirmDelete')) &&
        this.$store.dispatch('alerts/deleteAlert', id)
          .then(() => this.$router.push({ name: 'alerts' }))
    }, 200, {leading: true, trailing: false}),
    queryBy(attribute, value) {
      this.$router.push({ path: `/alerts?q=${attribute}:"${value}"` })  // double-quotes (") around value mean exact match
    },
    close() {
      this.$emit('close')
    },
    clipboardCopy(text) {
      this.copyIconText = i18n.t('Copied')
      let textarea = document.createElement('textarea')
      textarea.textContent = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setTimeout(() => {
        this.copyIconText = i18n.t('Copy')
      }, 2000)
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

.label-critical {
  background-color: #b94a48;
}

.label-major {
  background-color: #f89406;
}

.label-minor {
  background-color: #ffd700;
}

.label-warning {
  background-color: #3a87ad;
}

.label-normal,
.label-cleared,
.label-ok,
.label-informational {
  background-color: #468847;
}

.label-inverse {
  background-color: #333333;
}

.v-alert__dismissible {
  margin-top: 8px;
}

.console-text {
  font-size: 14px;
  font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace;
  white-space: pre;
  line-height: 1;
}

div.clickable, span.clickable {
  cursor: pointer;
  color: blue;
  font-weight: 400;
  text-decoration: underline;
}

.theme--dark div.clickable, .theme--dark span.clickable {
  color: orange;
}

div.clickable:hover, span.clickable:hover {
  text-decoration: none;
}

#alerta .v-chip__content {
  cursor: pointer;
}
</style>
