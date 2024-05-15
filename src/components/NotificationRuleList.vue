<template>
  <div>
    <v-dialog
      v-model="active_dialog"
      max-width="540px"
    >
      <v-form ref="form">
        <v-card>
          <v-card-title>
            <v-flex
              xs12
              sm6
              md9
            >
              <span class="headline">
                Active
              </span>
            </v-flex>
            <v-flex
              xs12
              sm6
              md3
            >
              <v-checkbox
                v-model="editedItem.active"
                :label="$t('Active')"
              />
            </v-flex>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex
                  xs8
                >
                  <v-menu
                    ref="menu1"
                    v-model="menu1"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    lazy
                    transition="scale-transition"
                    offset-y
                    full-width
                    max-width="290px"
                    min-width="290px"
                  >
                    <v-text-field
                      slot="activator"
                      v-model="editedItem.reactivateDate"
                      :label="$t('ReactivateDate')"
                      prepend-icon="event"
                    />
                    <v-date-picker
                      v-model="editedItem.reactivateDate"
                      no-title
                      @input="menu1 = false"
                    />
                  </v-menu>
                </v-flex>

                <v-flex
                  xs4
                >
                  <v-combobox
                    v-model="editedItem.reactivateTime"
                    :items="times"
                  />
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="blue darken-1"
              flat
              @click="close_active"
            >
              {{ $t('Cancel') }}
            </v-btn>
            <v-btn
              color="blue darken-1"
              flat
              @click="changeState(editedItem)"
            >
              {{ $t('Save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
    <v-dialog
      v-model="dialog"
      max-width="540px"
    >
      <v-form ref="form">
        <v-card>
          <v-card-title>
            <v-flex
              xs12
              sm6
              md9
            >
              <span class="headline">
                {{ formTitle }}
              </span>
            </v-flex>
            <v-flex
              xs12
              sm6
              md3
            >
              <v-checkbox
                v-model="editedItem.active"
                :label="$t('Active')"
              />
            </v-flex>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex
                  v-if="$config.customer_views"
                  xs12
                >
                  <v-select
                    v-model="editedItem.customer"
                    :items="allowedCustomers"
                    :label="$t('Customer')"
                    clearable
                  />
                </v-flex>

                <v-flex
                  xs8
                >
                  <v-menu
                    ref="menu2"
                    v-model="menu2"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    lazy
                    transition="scale-transition"
                    offset-y
                    full-width
                    max-width="290px"
                    min-width="290px"
                  >
                    <v-text-field
                      slot="activator"
                      v-model="editedItem.reactivateDate"
                      :label="$t('ReactivateDate')"
                      prepend-icon="event"
                    />
                    <v-date-picker
                      v-model="editedItem.reactivateDate"
                      no-title
                      @input="menu2 = false"
                    />
                  </v-menu>
                </v-flex>

                <v-flex
                  xs4
                >
                  <v-combobox
                    v-model="editedItem.reactivateTime"
                    :items="times"
                  />
                </v-flex>

                <v-flex xs12>
                  <v-text-field
                    v-model.trim="editedItem.name"
                    :label="$t('Name')"
                  />
                </v-flex>

                <v-flex xs12>
                  <v-select
                    v-model="editedItem.environment"
                    :items="allowedEnvironments"
                    :label="$t('Environment')"
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>

                <v-flex xs12>
                  <v-select
                    v-model="editedItem.channelId"
                    :items="currentChannelsIds"
                    :label="$t('Channel')"
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>

                <v-flex
                  xs12
                  sm6
                  md9
                >
                  <v-combobox
                    v-model="editedItem.receivers"
                    :label="$t('Receivers')"
                    multiple
                    chips
                  />
                </v-flex>


                <v-flex
                  xs12
                  sm6
                  md3
                >
                  <v-checkbox
                    v-model="editedItem.useOnCall"
                    :label="$t('UseOncall')"
                  />
                </v-flex>


                <v-flex xs12>
                  <v-select
                    v-model="editedItem.userIds"
                    :items="users"
                    item-text="name"
                    item-value="id"
                    :label="$t('Users')"
                    chips
                    multiple
                  />
                </v-flex>

                <v-flex xs12>
                  <v-select
                    v-model="editedItem.groupIds"
                    :items="groups"
                    item-text="name"
                    item-value="id"
                    :label="$t('Groups')"
                    chips
                    multiple
                  />
                </v-flex>
                <v-flex xs12>
                  <v-card v-if="editedItem.useAdvancedSeverity">
                    <v-toolbar>
                      <v-toolbar-title>Advanced Severity</v-toolbar-title>

                      <v-spacer />

                      <v-btn
                        icon
                        @click="
                          editedItem.advancedSeverity.push({ from: [], to: [] })
                        "
                      >
                        add
                        <v-icon>add</v-icon>
                      </v-btn>
                      <v-spacer />

                      <v-btn
                        icon
                        @click="editedItem.advancedSeverity = []"
                      >
                        clear
                        <v-icon>
                          clear
                        </v-icon>
                      </v-btn>
                    </v-toolbar>
                    <v-container>
                      <v-layout
                        v-for="(item, index) in editedItem.advancedSeverity"
                        :key="index"
                        wrap
                        xs12
                      >
                        <v-flex xs5>
                          <v-select
                            v-model="item.from"
                            :items="severities"
                            :label="$t('From')"
                            chips
                            multiple
                          />
                        </v-flex>
                        <v-flex xs5>
                          <v-select
                            v-model="item.to"
                            :items="severities"
                            :label="$t('To')"
                            chips
                            multiple
                          />
                        </v-flex>
                        <v-flex xs2>
                          <v-btn
                            icon
                            @click="
                              editedItem.advancedSeverity.splice(index, 1)
                            "
                          >
                            <v-icon>delete</v-icon>
                          </v-btn>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-card>
                </v-flex>
                <v-flex
                  v-if="!editedItem.useAdvancedSeverity"
                  xs10
                >
                  <v-select
                    v-model="editedItem.severity"
                    :items="severities"
                    :label="$t('Severity')"
                    chips
                    multiple
                  />
                </v-flex>

                <v-flex xs2>
                  <v-checkbox
                    v-model="editedItem.useAdvancedSeverity"
                    :label="$t('Advanced Severity')"
                  />
                </v-flex>
                <v-flex
                  xs12
                >
                  <v-select
                    v-model="editedItem.status"
                    :items="statuses"
                    :label="$t('Status')"
                    chips
                    multiple
                  />
                </v-flex>

                <v-flex xs12>
                  <v-select
                    v-model="editedItem.days"
                    :items="days"
                    :label="$t('Days')"
                    chips
                    multiple
                  />
                </v-flex>

                <v-flex xs6>
                  <v-combobox
                    v-model="editedItem.period.startTime"
                    :items="times"
                    :label="$t('StartTime')"
                  />
                </v-flex>
                <v-flex xs6>
                  <v-combobox
                    v-model="editedItem.period.endTime"
                    :items="times"
                    :label="$t('EndTime')"
                  />
                </v-flex>

                <v-flex xs12>
                  <v-combobox
                    v-model="editedItem.service"
                    :items="currentServices"
                    :menu-props="{ maxHeight: '400' }"
                    :label="$t('Service')"
                    chips
                    multiple
                    :hint="$t('ChooseService')"
                    persistent-hint
                  />
                </v-flex>
                <v-flex xs12>
                  <v-text-field
                    v-model.trim="editedItem.resource"
                    :label="$t('Resource')"
                  />
                </v-flex>
                <v-flex xs12>
                  <v-text-field
                    v-model.trim="editedItem.event"
                    :label="$t('Event')"
                  />
                </v-flex>
                <v-flex xs12>
                  <v-combobox
                    v-model.trim="editedItem.group"
                    :items="currentGroups"
                    :label="$t('Group')"
                    clearable
                  />
                </v-flex>

                <v-flex xs12>
                  <v-combobox
                    v-model="editedItem.tags"
                    :items="currentTags"
                    :label="$t('Tags')"
                    multiple
                    chips
                  >
                    <template
                      slot="selection"
                      slot-scope="data"
                    >
                      <v-chip
                        :key="JSON.stringify(data.item)"
                        :selected="data.selected"
                        :disabled="data.disabled"
                        class="v-chip--select-multi"
                        label
                        small
                        @input="data.parent.selectItem(data.item)"
                      >
                        <v-icon left>
                          label
                        </v-icon>{{ data.item }}
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-flex>

                <v-flex xs12>
                  <v-combobox
                    v-model="editedItem.excludedTags"
                    :items="currentTags"
                    :label="$t('Excluded Tags')"
                    multiple
                    chips
                  >
                    <template
                      slot="selection"
                      slot-scope="data"
                    >
                      <v-chip
                        :key="JSON.stringify(data.item)"
                        :selected="data.selected"
                        :disabled="data.disabled"
                        class="v-chip--select-multi"
                        label
                        small
                        @input="data.parent.selectItem(data.item)"
                      >
                        <v-icon left>
                          label
                        </v-icon>{{ data.item }}
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-flex>

                <v-flex xs12>
                  <v-text-field
                    v-model.trim="editedItem.text"
                    :label="$t('Text')"
                  />
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="blue darken-1"
              flat
              @click="close"
            >
              {{ $t('Cancel') }}
            </v-btn>
            <v-btn
              color="blue darken-1"
              flat
              @click="validate"
            >
              {{ $t('Save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-card>
      <v-card-title class="title">
        {{ $t('notificationRules') }}
        <v-spacer />
        <v-btn-toggle
          v-model="status"
          class="transparent"
          multiple
        >
          <v-btn
            value="true"
            flat
          >
            <v-tooltip bottom>
              <v-icon slot="activator">
                notifications
              </v-icon>
              <span>{{ $t('Active') }}</span>
            </v-tooltip>
          </v-btn>
          <v-btn
            value="false"
            flat
          >
            <v-tooltip bottom>
              <v-icon slot="activator">
                notifications_paused
              </v-icon>
              <span>{{ $t('Deactivated') }}</span>
            </v-tooltip>
          </v-btn>
        </v-btn-toggle>
        <v-spacer />
        <v-text-field
          v-model="query"
          append-icon="search"
          clearable
          single-line
          hide-details
          :label="$t('Search')"
          @change="setSearch"
          @click:clear="clearSearch"
        />
      </v-card-title>

      <v-data-table
        :headers="computedHeaders"
        :items="notification_rules"
        :pagination.sync="pagination"
        :total-items="pagination.totalItems"
        :rows-per-page-items="pagination.rowsPerPageItems"
        class="px-2"
        :loading="isLoading"
        must-sort
        sort-icon="arrow_drop_down"
      >
        <template
          slot="items"
          slot-scope="props"
        >
          <td>
            <v-btn
              v-has-perms.disable="'write:notification_rules'"
              icon
              class="btn--plain mx-0"
              @click="editActive(props.item)"
            >
              <v-icon
                small
                :color="props.item.active ? 'green': 'red'"
              >
                {{ props.item.active ? "check_circle": "cancel" }}
              </v-icon>
            </v-btn>
          </td>
          <td v-if="$config.customer_views">
            {{ props.item.customer }}
          </td>
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.environment }}</td>
          <td>{{ props.item.reactivateDate }} {{ props.item.reactivateTime }}</td>
          <td>{{ props.item.channelId }}</td>
          <td>
            <v-chip
              v-for="number in [...props.item.receivers, ...users.filter(b => props.item.userIds.includes(b.id)).map(b => b.name), ...groups.filter(b => props.item.groupIds.includes(b.id)).map(b => b.name)]"
              :key="number"
              outline
              small
            >
              {{ number }}
            </v-chip>
          </td>
          <td>{{ props.item.useOnCall }}</td>
          <td>
            <v-chip
              v-for="severity in props.item.severity"
              :key="severity"
              outline
              small
            >
              {{ severity }}
            </v-chip>
          </td>
          <td>
            <v-chip
              v-for="status in props.item.status"
              :key="status"
              outline
              small
            >
              {{ status }}
            </v-chip>
          </td>
          <td>
            <v-chip
              v-for="day in props.item.days"
              :key="day"
              outline
              small
            >
              {{ day }}
            </v-chip>
          </td>
          <td class="text-xs-left">
            {{ props.item.period.startTime }}
          </td>
          <td class="text-xs-left">
            {{ props.item.period.endTime }}
          </td>
          <td>
            <v-chip
              v-for="service in props.item.service"
              :key="service"
              outline
              small
            >
              {{ service }}
            </v-chip>
          </td>
          <td>{{ props.item.resource }}</td>
          <td>{{ props.item.event }}</td>
          <td>{{ props.item.group }}</td>
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
            <v-chip
              v-for="tag in props.item.excludedTags"
              :key="tag"
              label
              small
            >
              <v-icon left>
                label
              </v-icon>{{ tag }}
            </v-chip>
          </td>
          <td class="text-xs-left">
            {{ props.item.user }}
          </td>
          <td class="text-xs-left">
            {{ props.item.text }}
          </td>
          <td class="text-no-wrap">
            <v-btn
              v-has-perms.disable="'write:notification_rules'"
              icon
              class="btn--plain mr-0"
              @click="editItem(props.item)"
            >
              <v-icon
                small
                color="grey darken-3"
              >
                edit
              </v-icon>
            </v-btn>
            <v-btn
              v-has-perms.disable="'write:notification_rules'"
              icon
              class="btn--plain mx-0"
              @click="copyItem(props.item)"
            >
              <v-icon
                small
                color="grey darken-3"
              >
                content_copy
              </v-icon>
            </v-btn>
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

    <list-button-add
      perms="write:notification_rules"
      @add-to-list="dialog = true"
    />
  </div>
</template>

<script>
import ListButtonAdd from './lib/ListButtonAdd'
import moment from 'moment'
import i18n from '@/plugins/i18n'

export default {
  components: {
    ListButtonAdd
  },
  data: vm => ({
    status: ['true', 'false'],
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    search: '',
    dialog: false,
    active_dialog: false,
    headers: [
      { text: i18n.t('Acitve'), value: 'active' },
      { text: i18n.t('Customer'), value: 'customer' },
      { text: i18n.t('Name'), value: 'Name' },
      { text: i18n.t('Environment'), value: 'environment' },
      { text: i18n.t('Reactivate'), value: 'reactivate' },
      { text: i18n.t('Channel'), value: 'channel' },
      { text: i18n.t('Receivers'), value: 'receivers' },
      { text: i18n.t('OnCall'), value: 'useOnCall' },
      { text: i18n.t('Severity'), value: 'severity' },
      { text: i18n.t('Status'), value: 'status' },
      { text: i18n.t('Days'), value: 'days' },
      { text: i18n.t('Start'), value: 'startTime' },
      { text: i18n.t('End'), value: 'endTime' },
      { text: i18n.t('Service'), value: 'service' },
      { text: i18n.t('Resource'), value: 'resource' },
      { text: i18n.t('Event'), value: 'event' },
      { text: i18n.t('Group'), value: 'group' },
      { text: i18n.t('Tags'), value: 'tags' },
      { text: i18n.t('Excluded Tags'), value: 'excludedTags' },
      { text: i18n.t('User'), value: 'user' },
      { text: 'Text', value: 'text' },
      { text: i18n.t('Actions'), value: 'name', sortable: false }
    ],
    editedId: null,
    editedItem: {
      active: true,
      customer: null,
      name: null,
      environment: null,
      receivers: [],
      userIds: [],
      groupIds: [],
      useOnCall: false,
      service: [],
      resource: null,
      event: null,
      group: null,
      tags: [],
      excludedTags: [],
      period: {
        startTime: '',
        endTime: ''
      },
      startTime: '',
      endTime: '',
      text: '',
      days: [],
      severity: [],
      status: [],
      advancedSeverity: [],
      useAdvancedSeverity: false,
      channelId: null
    },
    menu1: false,
    menu2: false,
    defaultItem: {
      active: true,
      customer: null,
      name: null,
      environment: null,
      receivers: [],
      userIds: [],
      groupIds: [],
      useOnCall: false,
      service: [],
      resource: null,
      event: null,
      group: null,
      tags: [],
      excludedTags: [],
      period: {
        startTime: '',
        endTime: ''
      },
      startTime: '',
      endTime: '',
      text: '',
      days: [],
      severity: [],
      status: [],
      advancedSeverity: [],
      useAdvancedSeverity: false,
      channelId: null
    },
    rules: {
      required: v => !!v || i18n.t('Required')
    }
  }),
  computed: {
    notification_rules() {
      return this.$store.state.notificationRules.notification_rules
        .filter(b => !this.status  || this.status.includes(String(b.active)))
        .map(b => {
          let period = {
            startTime: '',
            endTime: ''
          }
          if (b.startTime !== null && b.endTime !== null) {
            let sTime = new Date()
            let eTime = new Date()
            sTime.setUTCHours(
              parseInt(b.startTime.substr(0, 2)),
              parseInt(b.startTime.substr(3))
            )
            eTime.setUTCHours(
              parseInt(b.endTime.substr(0, 2)),
              parseInt(b.endTime.substr(3))
            )
            period.startTime = `${('0' + sTime.getHours()).slice(-2)}:${(
              '0' + sTime.getMinutes()
            ).slice(-2)}`
            period.endTime = `${('0' + eTime.getHours()).slice(-2)}:${(
              '0' + eTime.getMinutes()
            ).slice(-2)}`
          }
          let reactivate = b.reactivate ? moment(b.reactivate) : null
          
          return Object.assign(
            { ...b },
            {
              period: period,
              text:
                b.text === null
                  ? ''
                  : b.text.replace(/%\(([\w\[\]\. ]*)\)s/g, '{$1}')
            },
            reactivate ? {reactivateDate: reactivate.format('YYYY-MM-DD'),reactivateTime: reactivate.format('HH:mm'),} : {} 
          )
        })
    },
    query: {
      get() {
        return this.$store.state.notificationRules.query
          ? this.$store.state.notificationRules.query.q
          : null
      },
      set(value) {
        // FIXME: offer query suggestions to user here, in future
      }
    },
    pagination: {
      get() {
        return this.$store.getters['notificationRules/pagination']
      },
      set(value) {
        this.$store.dispatch('notificationRules/setPagination', value)
      }
    },
    users() {
      return this.$store.state.users.users
    },
    groups() {
      return this.$store.state.notificationGroups.notificationGroups
    },
    computedHeaders() {
      return this.headers.filter(h =>
        !this.$config.customer_views ? h.value != 'customer' : true
      )
    },
    allowedCustomers() {
      return this.$store.getters['customers/customers']
    },
    allowedEnvironments() {
      return this.$store.getters['alerts/environments']()
    },
    currentServices() {
      return this.$store.getters['alerts/services']
    },
    currentChannelsIds() {
      return this.$store.getters['notificationChannels/ids']
    },
    currentTags() {
      return this.$store.getters['alerts/tags']
    },
    currentGroups() {
      return this.$store.getters['alerts/groups']
    },
    isLoading() {
      return this.$store.state.notificationRules.isLoading
    },
    formTitle() {
      return !this.editedId
        ? i18n.t('NewNotificationRule')
        : i18n.t('EditNotificationRule')
    },
    severities() {
      return Object.keys(this.$store.getters.getConfig('alarm_model').severity)
    },
    statuses() {
      return Object.keys(this.$store.getters.getConfig('alarm_model').status)
    },
    times() {
      return Array.from(
        {
          length: (24 * 60) / 15 + 1
        },
        (v, i) => {
          if (i == 0) {
            return ''
          } else {
            let h = Math.floor(((i - 1) * 15) / 60)
            let m = (i - 1) * 15 - h * 60
            return ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2)
          }
        }
      )
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
      if (val) return
      this.getNotificationRules()
      this.getNotificationChannels()
      this.getCustomers()
      this.getEnvironments()
      this.getServices()
      this.getTags()
      this.getUsers()
      this.getGroups()
      this.getNotificaitonGroups()
    },
    pagination: {
      handler() {
        this.getNotificationRules()
      },
      deep: true
    }
  },
  created() {
    this.getNotificationRules()
    this.getNotificationChannels()
    this.getCustomers()
    this.getEnvironments()
    this.getServices()
    this.getTags()
    this.getUsers()
    this.getGroups()
    this.getNotificaitonGroups()
    this.editedItem = Object.assign({}, this.defaultItem)
  },
  methods: {
    setSearch(query) {
      this.$store.dispatch('notificationRules/updateQuery', {q: query})
      this.$router.push({query: {...this.$router.query, q: query}})
      this.refresh_all()
    },
    clearSearch() {
      this.query = null
      this.$store.dispatch('notificationRules/updateQuery', {})
      this.$router.push({query: {...this.$router.query, q: undefined}})
      this.refresh_all()
    },
    getNotificationRules() {
      this.$store.dispatch('notificationRules/getNotificationRules')
    },
    getNotificationChannels() {
      this.$store.dispatch('notificationChannels/getNotificationChannels')
    },
    getCustomers() {
      this.$store.dispatch('customers/getCustomers')
    },
    getUsers() {
      this.$store.dispatch('users/getUsers')
    },
    getGroups() {
      this.$store.dispatch('groups/getGroups')
    },
    getNotificaitonGroups() {
      this.$store.dispatch('notificationGroups/getNotificationGroups')
    },
    getEnvironments() {
      this.$store.dispatch('alerts/getEnvironments')
    },
    toISODate(date, time) {
      return new Date(date + ' ' + time).toISOString()
    },
    getServices() {
      this.$store.dispatch('alerts/getServices')
    },
    getTags() {
      this.$store.dispatch('alerts/getTags')
    },
    editActive(item) {
      this.editedId = item.id
      this.editedItem = Object.assign({}, item)
      this.editedItem.active = !this.editedItem.active
      if (this.editedItem.active) this.changeState(this.editedItem)
      else this.active_dialog = true
    },
    editItem(item) {
      this.editedId = item.id
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    copyItem(item) {
      this.editedItem = Object.assign({}, item)
      this.editedId = null
      this.dialog = true
    },
    deleteItem(item) {
      confirm(i18n.t('ConfirmDelete')) &&
        this.$store.dispatch(
          'notificationRules/deleteNotificationRule',
          item.id
        )
    },
    close() {
      this.dialog = false
      setTimeout(() => {
        this.$refs.form.resetValidation()
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedId = null
      }, 300)
    },
    close_active() {
      this.active_dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedId = null
      }, 300)
    },
    validate() {
      if (this.$refs.form.validate()) {
        this.$refs.form.resetValidation()
        this.save()
      }
    },
    changeState(item) {
      this.$store.dispatch('notificationRules/updateNotificationRule', [
        item.id,
        {
          active: item.active,
          reactivate: this.editedItem.reactivateDate ? this.toISODate(
            this.editedItem.reactivateDate,
            this.editedItem.reactivateTime
          ) : null
        }
      ])
      this.close_active()
    },
    refresh_all() {
      this.$store.dispatch('set', ['refresh', true])
      setTimeout(() => {
        this.$store.dispatch('set', ['refresh', false])
      }, 300)
    },
    save() {
      let sTimeStr = null
      let eTimeStr = null
      if (
        this.editedItem.period.startTime !== '' &&
        this.editedItem.period.endTime !== ''
      ) {
        let sTime = new Date()
        let eTime = new Date()
        sTime.setHours(
          this.editedItem.period.startTime.substr(0, 2),
          this.editedItem.period.startTime.substr(3)
        )
        eTime.setHours(
          this.editedItem.period.endTime.substr(0, 2),
          this.editedItem.period.endTime.substr(3)
        )
        sTimeStr = `${('0' + sTime.getUTCHours()).slice(-2)}:${(
          '0' + sTime.getUTCMinutes()
        ).slice(-2)}`
        eTimeStr = `${('0' + eTime.getUTCHours()).slice(-2)}:${(
          '0' + eTime.getUTCMinutes()
        ).slice(-2)}`
      }
      if (this.editedId) {
        this.$store.dispatch('notificationRules/updateNotificationRule', [
          this.editedId,
          {
            active: this.editedItem.active,
            customer: this.editedItem.customer,
            name: this.editedItem.name,
            environment: this.editedItem.environment,
            receivers: this.editedItem.receivers,
            userIds: this.editedItem.userIds,
            groupIds: this.editedItem.groupIds,
            useOnCall: this.editedItem.useOnCall,
            service: this.editedItem.service,
            resource: this.editedItem.resource,
            event: this.editedItem.event,
            group: this.editedItem.group,
            tags: this.editedItem.tags,
            excludedTags: this.editedItem.excludedTags,
            startTime: sTimeStr,
            endTime: eTimeStr,
            text: this.editedItem.text.replace(/\{([\w\[\]\. ]*)\}/g, '%($1)s'),
            days: this.editedItem.days,
            severity: this.editedItem.severity,
            status: this.editedItem.status,
            channelId: this.editedItem.channelId,
            advancedSeverity: this.editedItem.advancedSeverity,
            useAdvancedSeverity: this.editedItem.useAdvancedSeverity,
            reactivate:  this.editedItem.reactivateDate ? this.toISODate(
              this.editedItem.reactivateDate,
              this.editedItem.reactivateTime
            ) : null
          }
        ])
      } else {
        this.$store.dispatch(
          'notificationRules/createNotificationRule',
          Object.assign(this.editedItem, {
            id: null,
            startTime: sTimeStr,
            endTime: eTimeStr,
            text: this.editedItem.text.replace(/\{([\w\[\]\. ]*)\}/g, '%($1)s')
          })
        )
      }
      this.close()
    }
  }
}
</script>

<style></style>
