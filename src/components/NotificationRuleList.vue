<template>
  <div>
    <v-dialog
      v-model="dialog"
      max-width="540px"
    >
      <v-form ref="form">
        <v-card>
          <v-card-title>
            <span class="headline">
              {{ formTitle }}
            </span>
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
                  xs12
                >
                  <v-select
                    v-model="editedItem.environment"
                    :items="allowedEnvironments"
                    :label="$t('Environment')"
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>

                

                <v-flex
                  xs12
                >
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
                >
                  <v-combobox
                    v-model="editedItem.receivers"
                    :label="$t('Receivers')"
                    multiple
                    chips
                  >
                  </v-combobox>
                </v-flex>

                <v-flex
                  xs12
                >
                  <v-select
                    v-model="editedItem.severity"
                    :items="severities"
                    :label="$t('Severity')"
                    chips
                    multiple
                  />
                </v-flex>

                <v-flex
                  xs12
                >
                  <v-select
                    v-model="editedItem.days"
                    :items="days"
                    :label="$t('Days')"
                    chips
                    multiple
                  />
                </v-flex>

                <v-flex
                  xs6
                >
                  <v-combobox
                    v-model="editedItem.period.startTime"
                    :items="times"
                    :label="$t('StartTime')"
                  />
                </v-flex>
                <v-flex
                  xs6
                >
                  <v-combobox
                    v-model="editedItem.period.endTime"
                    :items="times"
                    :label="$t('EndTime')"
                  />
                </v-flex>

                <v-flex
                  xs12
                >
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
                <v-flex
                  xs12
                >
                  <v-text-field
                    v-model.trim="editedItem.resource"
                    :label="$t('Resource')"
                  />
                </v-flex>
                <v-flex
                  xs12
                >
                  <v-text-field
                    v-model.trim="editedItem.event"
                    :label="$t('Event')"
                  />
                </v-flex>
                <v-flex
                  xs12
                >
                  <v-text-field
                    v-model.trim="editedItem.group"
                    :label="$t('Group')"
                  />
                </v-flex>

                <v-flex
                  xs12
                >
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

                <v-flex
                  xs12
                >
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
            value="active"
            flat
          >
            <v-tooltip bottom>
              <v-icon slot="activator">
                notifications_paused
              </v-icon>
              <span>{{ $t('Active') }}</span>
            </v-tooltip>
          </v-btn>
          <v-btn
            value="deactivated"
            flat
          >
            <v-tooltip bottom>
              <v-icon slot="activator">
                schedule
              </v-icon>
              <span>{{ $t('Deactivated') }}</span>
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
          <td
            v-if="$config.customer_views"
          >
            {{ props.item.customer }}
          </td>
          <td>{{ props.item.environment }}</td>
          <td>{{ props.item.channelId }}</td>
          <td>
            <v-chip
              v-for="number in props.item.receivers"
              :key="number"
              outline
              small
            >
              {{ number }}
            </v-chip>
          </td>
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
              v-for="day in props.item.days"
              :key="day"
              outline
              small
            >
              {{ day }}
            </v-chip>
          </td>
          <td class="text-xs-left">{{ props.item.period.startTime }}</td>
          <td class="text-xs-left">{{ props.item.period.endTime }}</td>
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
          <td class="text-xs-right">
            <v-tooltip top>
              {{ props.item.status | capitalize }}
              <v-icon
                v-if="props.item.status == 'active'"
                slot="activator"
                color="primary"
                small
              >
                accept
              </v-icon>

              <v-icon
                v-if="props.item.status == 'deactivated'"
                slot="activator"
                small
              >
                block
              </v-icon>
            </v-tooltip>
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
    status: ['active', 'deactivated'],
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    search: '',
    dialog: false,
    headers: [
      { text: i18n.t('Customer'), value: 'customer' },
      { text: i18n.t('Environment'), value: 'environment' },
      { text: i18n.t('Channel'), value: 'channel' },
      { text: i18n.t('Receivers'), value: 'receivers' },
      { text: i18n.t('Severity'), value: 'severity' },
      { text: i18n.t('Days'), value: 'days' },
      { text: i18n.t('Start'), value: 'startTime' },
      { text: i18n.t('End'), value: 'endTime' },
      { text: i18n.t('Service'), value: 'service' },
      { text: i18n.t('Resource'), value: 'resource' },
      { text: i18n.t('Event'), value: 'event' },
      { text: i18n.t('Group'), value: 'group' },
      { text: i18n.t('Tags'), value: 'tags' },
      { text: '', value: 'status' },
      { text: i18n.t('User'), value: 'user' },
      { text: 'Text', value: 'text' },
      { text: i18n.t('Actions'), value: 'name', sortable: false }
    ],
    editedId: null,
    editedItem: {
      customer: null,
      environment: null,
      receivers: [],
      service: [],
      resource: null,
      event: null,
      group: null,
      tags: [],
      period: {
        startTime: '',
        endTime: ''
      },
      startTime: '',
      endTime: '',
      text: '',
      days:[],
      severity:[],
      channelId: null
    },
    menu1: false,
    menu2: false,
    defaultItem: {
      customer: null,
      environment: null,
      receivers: [],
      service: [],
      resource: null,
      event: null,
      group: null,
      tags: [],
      period: {
        startTime: '',
        endTime: ''
      },
      startTime: '',
      endTime: '',
      text: '',
      days:[],
      severity:[],
      channelId: null
    },
    rules: {
      required: v => !!v || i18n.t('Required')
    }
  }),
  computed: {
    notification_rules() {
      console.log(this.$store.getters)
      return this.$store.state.notificationRules.notification_rules
        .filter(b => this.search ? (Object.keys(b).some(k => b[k] && b[k].toString().includes(this.search))) : true)
        .map(b => {
          let period = {
            startTime: '',
            endTime: ''
          }
          if(b.startTime !== null && b.endTime !== null) {
            let sTime = new Date()
            let eTime = new Date()
            sTime.setUTCHours(parseInt(b.startTime.substr(0,2)), parseInt(b.startTime.substr(3)))
            eTime.setUTCHours(parseInt(b.endTime.substr(0,2)), parseInt(b.endTime.substr(3)))
            period.startTime = `${("0" + sTime.getHours()).slice(-2)}:${('0' + sTime.getMinutes()).slice(-2)}`
            period.endTime = `${("0" + eTime.getHours()).slice(-2)}:${('0' + eTime.getMinutes()).slice(-2)}`
          }

          return Object.assign({...b}, {
            period: period,
            text: b.text === null ? '' : b.text.replace(/%\((\w*)\)s/g, "{$1}")
          })
        })
    },
    pagination: {
      get() {
        return this.$store.getters['notificationRules/pagination']
      },
      set(value) {
        this.$store.dispatch('notificationRules/setPagination', value)
      }
    },
    computedHeaders() {
      return this.headers.filter(h => !this.$config.customer_views ? h.value != 'customer' : true)
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
      console.log(this.$store.getters)
      return this.$store.getters['notificationChannels/ids']
    },
    currentTags() {
      return this.$store.getters['alerts/tags']
    },
    isLoading() {
      return this.$store.state.notificationRules.isLoading
    },
    formTitle() {
      return !this.editedId ? i18n.t('NewNotificationRule') : i18n.t('EditNotificationRule')
    },
    severities() {
      return Object.keys(this.$store.getters.getConfig("alarm_model").severity)
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
            let h = Math.floor(((i-1) * 15) / 60)
            let m = (i-1) * 15 - h * 60
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
      if (!val) return
      this.getNotificationRules()
      this.getNotificationChannels()
      this.getCustomers()
      this.getEnvironments()
      this.getServices()
      this.getTags()
    },
    pagination: {
      handler () {
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
    this.editedItem = Object.assign({}, this.defaultItem)
  },
  methods: {
    getNotificationRules() {
      this.$store.dispatch('notificationRules/getNotificationRules')
    },
    getNotificationChannels() {
      this.$store.dispatch('notificationChannels/getNotificationChannels')
    },
    getCustomers() {
      this.$store.dispatch('customers/getCustomers')
    },
    getEnvironments() {
      this.$store.dispatch('alerts/getEnvironments')
    },
    getServices() {
      this.$store.dispatch('alerts/getServices')
    },
    getTags() {
      this.$store.dispatch('alerts/getTags')
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
        this.$store.dispatch('notificationRules/deleteNotificationRule', item.id)
    },
    close() {
      this.dialog = false
      setTimeout(() => {
        this.$refs.form.resetValidation()
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
    save() {
      let sTimeStr = null
      let eTimeStr = null
      if (this.editedItem.period.startTime !== '' && this.editedItem.period.endTime !== '') {
        let sTime = new Date()
        let eTime = new Date()
        sTime.setHours(this.editedItem.period.startTime.substr(0,2), this.editedItem.period.startTime.substr(3))
        eTime.setHours(this.editedItem.period.endTime.substr(0,2), this.editedItem.period.endTime.substr(3))
        sTimeStr = `${("0" + sTime.getUTCHours()).slice(-2)}:${('0' + sTime.getUTCMinutes()).slice(-2)}`
        eTimeStr = `${("0" + eTime.getUTCHours()).slice(-2)}:${('0' + eTime.getUTCMinutes()).slice(-2)}`
      }
      if (this.editedId) {
        this.$store.dispatch('notificationRules/updateNotificationRule', [
          this.editedId,
          {
            customer: this.editedItem.customer,
            environment: this.editedItem.environment,
            receivers: this.editedItem.receivers,
            service: this.editedItem.service,
            resource: this.editedItem.resource,
            event: this.editedItem.event,
            group: this.editedItem.group,
            tags: this.editedItem.tags,
            startTime: sTimeStr,
            endTime: eTimeStr,
            text: this.editedItem.text.replace(/\{(\w*)\}/g, "%($1)s"),
            days: this.editedItem.days,
            severity: this.editedItem.severity,
            channelId: this.editedItem.channelId
          }
        ])
      } else {
        this.$store.dispatch(
          'notificationRules/createNotificationRule',
          Object.assign(this.editedItem, {
            id: null,
            startTime: sTimeStr,
            endTime: eTimeStr,
            text: this.editedItem.text.replace(/\{(\w*)\}/g, "%($1)s")
          })
        )
      }
      this.close()
    }
  }
}
</script>

<style></style>
