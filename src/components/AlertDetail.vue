<template>
  <v-card
    flat
  >
    <v-card
      rounded="0"
      flat
    >
      <v-toolbar
        :color="isDark ? '#616161' : '#eeeeee'"
        density="default"
      >
        <v-btn
          icon
          @click="dialog = false"
        >
          <v-icon>arrow_back</v-icon>
        </v-btn>

        <v-tooltip location="bottom">
          <template #activator="{props}">
            <v-btn
              v-bind="props"
              :disabled="!isAcked(item.status) && !isClosed(item.status)"
              icon
              class="btn--plain px-1 mx-0"
              @click="takeAction(item.id, 'open')"
            >
              <v-icon
                v-bind="props"
                size="20px"
              >
                refresh
              </v-icon>
            </v-btn>
          </template>
          <span>{{ $t('Open') }}</span>
        </v-tooltip>

        <v-tooltip location="bottom">
          <template #activator="{props}">
            <v-btn
              v-bind="props"
              v-show="!isWatched(item.tags)"
              icon
              class="btn--plain px-1 mx-0"
              @click="watchAlert(item.id)"
            >
              <v-icon
                size="20px"
                v-bind="props"
              >
                visibility
              </v-icon>
            </v-btn>
          </template>
          <span>{{ $t('Watch') }}</span>
        </v-tooltip>

        <v-tooltip location="bottom">
          <template #activator="{props}">
            <v-btn
              v-bind="props"
              v-show="isWatched(item.tags)"
              icon
              class="btn--plain px-1 mx-0"
              @click="unwatchAlert(item.id)"
            >
              <v-icon
                size="20px"
                v-bind="props"
              >
                visibility_off
              </v-icon>
            </v-btn>
          </template>
          <span>{{ $t('Unwatch') }}</span>

        </v-tooltip>

        <v-tooltip location="bottom">
          <template #activator="{props}">
            <v-btn
              v-bind="props"
              v-show="!isAcked(item.status)"
              :disabled="!isOpen(item.status)"
              icon
              class="btn--plain px-1 mx-0"
              @click="ackAlert(item.id)"
            >
              <v-icon
                size="20px"
                v-bind="props"
              >
                check
              </v-icon>
            </v-btn>
          </template>
          <span>{{ $t('Ack') }}</span>
        </v-tooltip>

        <v-tooltip location="bottom">
          <template #activator="{props}">
            <v-btn
              v-bind="props"
              v-show="isAcked(item.status)"
              icon
              class="btn--plain px-1 mx-0"
              @click="takeAction(item.id, 'unack')"
            >
              <v-icon
                size="20px"
                v-bind="props"
              >
                undo
              </v-icon>
            </v-btn>
          </template>
          <span>{{ $t('Unack') }}</span>
        </v-tooltip>

        <v-tooltip location="bottom">
          <template #activator="{props}">
            <v-btn
              v-bind="props"
              v-show="!isShelved(item.status)"
              :disabled="!isOpen(item.status) && !isAcked(item.status)"
              icon
              class="btn--plain px-1 mx-0"
              @click="shelveAlert(item.id)"
            >
              <v-icon
                size="20px"
                v-bind="props"
              >
                schedule
              </v-icon>
            </v-btn>
          </template>
          <span>{{ $t('Shelve') }}</span>
        </v-tooltip>

        <v-tooltip location="bottom">
          <template #activator="{props}">
            <v-btn
              v-bind="props"
              v-show="isShelved(item.status)"
              icon
              class="btn--plain px-1 mx-0"
              @click="takeAction(item.id, 'unshelve')"
            >
              <v-icon
                v-bind="props"
                size="20px"
              >
                restore
              </v-icon>
            </v-btn>
          </template>
          <span>{{ $t('Unshelve') }}</span>
        </v-tooltip>

        <v-tooltip location="bottom">
          <template #activator="{props}">
            <v-btn
              v-bind="props"
              :disabled="isClosed(item.status)"
              icon
              class="btn--plain px-1 mx-0"
              @click="takeAction(item.id, 'close')"
            >
              <v-icon
                size="20px"
                v-bind="props"
              >
                highlight_off
              </v-icon>
            </v-btn>
          </template>
          <span>{{ $t('Close') }}</span>
        </v-tooltip>

        <v-tooltip location="bottom">
          <template #activator="{props}">
            <v-btn
              v-bind="props"
              icon
              class="btn--plain px-1 mx-0"
              @click="deleteAlert(item.id)"
            >
              <v-icon
                size="20px"
                v-bind="props"
              >
                delete
              </v-icon>
            </v-btn>
          </template>
          <span>{{ $t('Delete') }}</span>
        </v-tooltip>

        <v-tooltip
          :key="copyIconText"
          location="bottom"
        >
          <template #activator="{props}">
            <v-btn
              v-bind="props"
              icon
              class="btn--plain px-1 mx-0"
              @click="clipboardCopy(JSON.stringify(item, null, 4))"
            >
              <v-icon
                size="20px"
                v-bind="props"
              >
                content_copy
              </v-icon>
            </v-btn>
          </template>
          <span>{{ copyIconText }}</span>
        </v-tooltip>

        <v-tooltip location="bottom">
          <template #activator="{props}">
            <v-menu
              location="bottom"
              start
            >
              <v-btn
                v-bind="props"
                icon
                class="btn--plain px-1 mx-0"
              >
                <v-icon v-bind="props">
                  more_vert
                </v-icon>
              </v-btn>

              <v-list>
                <v-list-subheader>Actions</v-list-subheader>
                <v-divider />
                <v-list-item
                  v-for="(action, i) in actions"
                  :key="i"
                  @click="takeAction(item.id, action)"
                >
                  <v-list-item-title>{{ this.$filters.splitCaps(action) }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
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
          <v-tab ripple>
            <v-icon>history</v-icon>&nbsp;{{ $t('History') }}
          </v-tab>
          <v-tab ripple>
            <v-icon>assessment</v-icon>&nbsp;{{ $t('Data') }}
          </v-tab>
        </v-tabs>
        <v-window v-model="active">
          <v-window-item
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
                closable
                type="info"
                class="ma-1"
                @update:model-value="deleteNote(item.id, note.id)"
              >
                <b>{{ note.user || 'Anonymous' }}</b> {{ $t('addedNoteOn') }}
                <span v-if="note.updateTime">
                  <b><date-time
                    :value="note.updateTime"
                    format="longDate"
                  /></b> ({{ this.$filters.timeago(note.updateTime) }})<br>
                </span>
                <span v-else>
                  <b><date-time
                    :value="note.createTime"
                    format="longDate"
                  /></b> ({{ this.$filters.timeago(note.createTime) }})<br>
                </span>
                <i>{{ note.text }}</i>
              </v-alert>

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
                /></b> ({{ this.$filters.timeago(note.updateTime) }})<br>
                <i>{{ note.text }}</i>
              </v-alert>
              <!-- DEPRECATED -->

              <v-card-text>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-left">
                      <div class="text-grey">
                        {{ $t('AlertId') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-left">
                      <div>
                        <span class="console-text">{{ item.id }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-left">
                      <div class="text-grey">
                        {{ $t('LastReceiveAlertId') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-left">
                      <div>
                        <span class="console-text">{{ item.lastReceiveId }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-left">
                      <div class="text-grey">
                        {{ $t('CreateTime') }}
                      </div>
                    </div>
                    <div class="flex xs9 text-left">
                      <div>
                        <date-time
                          v-if="item.createTime"
                          :value="item.createTime"
                          format="longDate"
                        />
                        ({{ this.$filters.timeago(item.createTime) }})
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-left">
                      <div class="text-grey">
                        {{ $t('ReceiveTime') }}
                      </div>
                    </div>
                    <div class="flex xs9 text-left">
                      <div>
                        <date-time
                          v-if="item.receiveTime"
                          :value="item.receiveTime"
                          format="longDate"
                        />
                        ({{ this.$filters.timeago(item.receiveTime) }})
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-left">
                      <div class="text-grey">
                        {{ $t('LastReceiveTime') }}
                      </div>
                    </div>
                    <div class="flex xs9 text-left">
                      <div>
                        <date-time
                          v-if="item.lastReceiveTime"
                          :value="item.lastReceiveTime"
                          format="longDate"
                        />
                        ({{ this.$filters.timeago(item.lastReceiveTime) }})
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-if="$config.customer_views"
                  class="flex xs12 ma-1"
                >
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-left">
                      <div class="text-grey">
                        {{ $t('Customer') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-left">
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
                    <div class="flex xs3 text-left">
                      <div class="text-grey">
                        {{ $t('Service') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-left">
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
                    <div class="flex xs3 text-left">
                      <div class="text-grey">
                        {{ $t('Environment') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-left">
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
                    <div class="flex xs3 text-left">
                      <div class="text-grey">
                        {{ $t('Resource') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-left">
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
                    <div class="flex xs3 text-left">
                      <div class="text-grey">
                        {{ $t('Event') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-left">
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
                    <div class="flex xs3 text-left">
                      <div class="text-grey">
                        {{ $t('Correlate') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-left">
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
                    <div class="flex xs3 text-left">
                      <div class="text-grey">
                        {{ $t('Group') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-left">
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
                    <div class="flex xs3 text-left">
                      <div class="text-grey">
                        {{ $t('Severity') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-left">
                      <div>
                        <span :class="['label', 'label-' + item.previousSeverity]">
                          {{ this.$filters.capitalize(item.previousSeverity) }}
                        </span>&nbsp;&rarr;&nbsp;
                        <span :class="['label', 'label-' + item.severity]">
                          {{ this.$filters.capitalize(item.severity) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-left">
                      <div class="text-grey">
                        {{ $t('Status') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-left">
                      <div>
                        <span class="label">
                          {{ this.$filters.capitalize(item.status) }}
                        </span>
                        <span
                          v-if="statusNote && statusNote.user"
                        >&nbsp;{{ $t('by') }} <b>{{ statusNote.user }}</b> ({{ this.$filters.timeago(statusNote.updateTime) }})
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
                    <div class="flex xs3 text-left">
                      <div class="text-grey" />
                    </div>
                    <div class="flex xs6 text-left">
                      <div>
                        <v-icon size="small">
                          error_outline
                        </v-icon>
                        <i>&nbsp;{{ statusNote.text }}</i>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-left">
                      <div class="text-grey">
                        {{ $t('Value') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-left">
                      <div>
                        {{ item.value }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-left">
                      <div class="text-grey">
                        {{ $t('Text') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-left">
                      <div>
                        <span>{{ item.text }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-left">
                      <div class="text-grey">
                        {{ $t('TrendIndication') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-left">
                      <div>
                        <span class="label">
                          {{ this.$filters.splitCaps(item.trendIndication) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-left">
                      <div class="text-grey">
                        {{ $t('Timeout') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-left">
                      <div>
                        {{ item.timeout }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-left">
                      <div class="text-grey">
                        {{ $t('Type') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-left">
                      <div>
                        <span class="label">
                          {{ this.$filters.splitCaps(item.type) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-left">
                      <div class="text-grey">
                        {{ $t('DuplicateCount') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-left">
                      <div>
                        {{ item.duplicateCount }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-left">
                      <div class="text-grey">
                        {{ $t('Repeat') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-left">
                      <div>
                        <span class="label">
                          {{ this.$filters.capitalize(item.repeat) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex xs12 ma-1">
                  <div class="d-flex align-top">
                    <div class="flex xs3 text-left">
                      <div class="text-grey">
                        {{ $t('Origin') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-left">
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
                    <div class="flex xs3 text-left">
                      <div class="text-grey">
                        {{ $t('Tags') }}
                      </div>
                    </div>
                    <div class="flex xs6 text-left">
                      <div>
                        <v-chip
                          v-for="tag in item.tags"
                          :key="tag"
                          label
                          small
                          @click="queryBy('tags', tag)"
                        >
                          <v-icon start>
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
                    <div class="flex xs3 text-left">
                      <div class="text-grey">
                        {{ this.$filters.splitCaps(attr) }}
                      </div>
                    </div>
                    <div class="flex xs6 text-left">
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
                        class="link-text"
                      >
                        {{ value }}
                      </div>
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
          </v-window-item>
          <v-window-item
            :transition="false"
            :reverse-transition="false"
          >
            <div class="tab-item-wrapper">
              <v-data-table
                :headers="headersByScreenSize"
                :items="history"
                item-key="index"
                v-model:pagination="pagination"
                sort-icon="arrow_drop_down"
                item-props
              >
                <template #item="{item}"
                >
                  <tr>
                    <td class="hidden-sm-and-down">
                      <span class="console-text">{{ this.$filters.shortId(item.props.id) }}</span>
                    </td>
                    <td
                      class="hidden-sm-and-down text-no-wrap"
                    >
                      <date-time
                        :value="item.props.updateTime"
                        format="mediumDate"
                      />
                    </td>
                    <td
                      class="hidden-md-and-up text-no-wrap"
                    >
                      <date-time
                        :value="item.props.updateTime"
                        format="shortTime"
                      />
                    </td>
                    <td class="hidden-sm-and-down">
                      <span :class="['label', 'label-' + item.props.severity]">
                        {{ this.$filters.capitalize(item.props.severity) }}
                      </span>
                    </td>
                    <td class="hidden-sm-and-down">
                      <span class="label">
                        {{ this.$filters.capitalize(item.props.status) }}
                      </span>
                    </td>
                    <td class="hidden-sm-and-down">
                      {{ this.$filters.hhmmss(item.props.timeout) }}
                    </td>
                    <td>
                      <span class="label">
                        {{ this.$filters.splitCaps(item.props.type || 'unknown') }}
                      </span>
                    </td>
                    <td class="hidden-sm-and-down">
                      {{ item.props.event }}
                    </td>
                    <td class="hidden-sm-and-down">
                      {{ item.props.value }}
                    </td>
                    <td>
                      {{ item.props.user }}
                    </td>
                    <td>
                      {{ item.props.text }}
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </div>
          </v-window-item>
          <v-window-item
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
          </v-window-item>
        </v-window>
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
      { title: i18n.global.t('AlertOrNoteId'), value: 'id', hide: 'smAndDown' },
      { title: i18n.global.t('UpdateTime'), value: 'updateTime', hide: 'smAndDown' },
      { title: i18n.global.t('Updated'), value: 'updateTime', hide: 'mdAndUp' },
      { title: i18n.global.t('Severity'), value: 'severity', hide: 'smAndDown' },
      { title: i18n.global.t('Status'), value: 'status', hide: 'smAndDown' },
      { title: i18n.global.t('Timeout'), value: 'timeout', hide: 'smAndDown' },
      { title: i18n.global.t('Type'), value: 'type' },
      { title: i18n.global.t('Event'), value: 'event', hide: 'smAndDown' },
      { title: i18n.global.t('Value'), value: 'value', hide: 'smAndDown' },
      { title: i18n.global.t('User'), value: 'user' },
      { title: i18n.global.t('Text'), value: 'text' }
    ],
    copyIconText: i18n.global.t('Copy')
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
        h => !h.hide || !this.$vuetify.display[h.hide]
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
      confirm(i18n.global.t('ConfirmDelete')) &&
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
      this.copyIconText = i18n.global.t('Copied')
      let textarea = document.createElement('textarea')
      textarea.textContent = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setTimeout(() => {
        this.copyIconText = i18n.global.t('Copy')
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
  color: #3f51b5;
  font-weight: 400;
  text-decoration: underline;
}

.theme--dark div.clickable, .theme--dark span.clickable, .theme--dark div.link-text a {
  color: orange;
}

div.clickable:hover, span.clickable:hover, div.link-text a:hover {
  text-decoration: none;
}

#alerta .v-chip__content {
  cursor: pointer;
}
</style>
