<template>
  <div>
    <v-dialog v-model="dialog" max-width="540px">
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
                <v-flex v-if="$config.customer_views" xs12>
                  <v-select
                    v-model="editedItem.customer"
                    :items="allowedCustomers"
                    :label="$t('Customer')"
                    clearable
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

                <v-flex xs4>
                  <v-menu
                    ref="menu1"
                    v-model="menu1"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        v-on="on"
                        v-model="editedItem.period.startDate"
                        :label="$t('StartDate')"
                        prepend-icon="mdi-calendar"
                      />
                    </template>
                    <v-date-picker
                      v-model="editedItem.period.startDate"
                      no-title
                      @input="menu1 = false"
                    />
                  </v-menu>
                </v-flex>

                <v-flex xs2>
                  <v-combobox
                    v-model="editedItem.period.startTime"
                    :items="times"
                  />
                </v-flex>
                <v-flex xs2>
                  <v-combobox
                    v-model="editedItem.period.endTime"
                    :items="times"
                  />
                </v-flex>

                <v-flex xs4>
                  <v-menu
                    v-model="menu2"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        v-on="on"
                        v-model="editedItem.period.endDate"
                        :label="$t('EndDate')"
                      />
                    </template>
                    <v-date-picker
                      v-model="editedItem.period.endDate"
                      no-title
                      @input="menu2 = false"
                    />
                  </v-menu>
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
                  <v-text-field
                    v-model.trim="editedItem.group"
                    :label="$t('Group')"
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
                    <template slot="selection" slot-scope="data">
                      <v-chip
                        :key="JSON.stringify(data.item)"
                        :selected="data.selected"
                        :disabled="data.disabled"
                        class="v-chip--select-multi"
                        label
                        small
                        @input="data.parent.selectItem(data.item)"
                      >
                        <v-icon left>mdi-label</v-icon>{{ data.item }}
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-flex>

                <v-flex xs12>
                  <v-text-field
                    v-model.trim="editedItem.origin"
                    :label="$t('Origin')"
                  />
                </v-flex>

                <v-flex xs12>
                  <v-text-field
                    v-model.trim="editedItem.text"
                    :label="$t('Reason')"
                  />
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn color="blue darken-1" text @click="close">
              {{ $t('Cancel') }}
            </v-btn>
            <v-btn color="blue darken-1" text @click="validate">
              {{ $t('Save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-card>
      <v-card-title class="title">
        {{ $t('Blackouts') }}
        <v-spacer />
        <v-btn-toggle v-model="status" class="transparent" multiple>
          <v-btn value="active" text>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on">mdi-bell-sleep</v-icon>
              </template>

              <span>{{ $t('Active') }}</span>
            </v-tooltip>
          </v-btn>
          <v-btn value="pending" text>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on">mdi-clock-outline</v-icon>
              </template>
              <span>{{ $t('Pending') }}</span>
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
        :items="blackouts"
        :footer-props="{ itemsPerPageOptions }"
        :options.sync="pagination"
        class="px-2"
        :search="search"
        :loading="isLoading"
        must-sort
        :header-props="{ sortIcon: 'mdi-chevron-down' }"
      >
        <template slot="items" slot-scope="props">
          <td>
            <v-tooltip top>
              {{ $t('WholeEnvironment') }}
              <template v-slot:activator="{ on }">
                <v-icon
                  v-if="onlyEnvironment(props.item)"
                  v-on="on"
                  color="red"
                  small
                >
                  mdi-alert
                </v-icon>
              </template>
            </v-tooltip>
            <v-tooltip top>
              {{ $t('AllOrigin') }}
              <v-icon v-if="onlyOrigin(props.item)" v-on="on" color="red" small>
                mdi-alert
              </v-icon>
            </v-tooltip>
          </td>
          <td v-if="$config.customer_views">
            {{ props.item.customer }}
          </td>
          <td>{{ props.item.environment }}</td>
          <td>
            <v-chip
              v-for="service in props.item.service"
              :key="service"
              outlined
              small
            >
              {{ service }}
            </v-chip>
          </td>
          <td>{{ props.item.resource }}</td>
          <td>{{ props.item.event }}</td>
          <td>{{ props.item.group }}</td>
          <td>
            <v-chip v-for="tag in props.item.tags" :key="tag" label small>
              <v-icon left>mdi-label</v-icon>{{ tag }}
            </v-chip>
          </td>
          <td>{{ props.item.origin }}</td>
          <td class="text-sm-right">
            <v-tooltip top>
              {{ props.item.status | capitalize }}
              <template v-slot:activator="{ on }">
                <v-icon
                  v-if="props.item.status == 'pending'"
                  v-on="on"
                  light
                  small
                >
                  mdi-clock-outline
                </v-icon>

                <v-icon
                  v-if="props.item.status == 'active'"
                  v-on="on"
                  color="primary"
                  small
                >
                  mdi-bell-sleep
                </v-icon>

                <v-icon v-if="props.item.status == 'expired'" v-on="on" small>
                  mdi-cancel
                </v-icon>
              </template>
            </v-tooltip>
          </td>
          <td class="text-sm-left">
            <date-format :value="props.item.startTime" format="mediumDate" />
          </td>
          <td class="text-sm-left">
            <date-format :value="props.item.endTime" format="mediumDate" />
          </td>
          <td class="text-sm-left text-no-wrap">
            {{ props.item.endTime | until }}
          </td>
          <td class="text-sm-left">
            {{ props.item.user }}
          </td>
          <td class="text-sm-left">
            {{ props.item.text }}
          </td>
          <td class="text-no-wrap">
            <v-btn
              v-has-perms.disable="'write:blackouts'"
              icon
              plain
              class="mr-0"
              @click="editItem(props.item)"
            >
              <v-icon small color="grey darken-3">mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              v-has-perms.disable="'write:blackouts'"
              icon
              plain
              class="mx-0"
              @click="copyItem(props.item)"
            >
              <v-icon small color="grey darken-3"
                >mdi-clipboard-multiple-outline</v-icon
              >
            </v-btn>
            <v-btn
              v-has-perms.disable="'write:blackouts'"
              icon
              plain
              class="mx-0"
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

    <list-button-add perms="write:blackouts" @add-to-list="dialog = true" />
  </div>
</template>

<script>
import DateFormat from './lib/DateFormat.vue'
import ListButtonAdd from './lib/ListButtonAdd.vue'
import { DateTime } from 'luxon'
import i18n from '@/plugins/i18n'

export default {
  components: {
    DateFormat,
    ListButtonAdd
  },
  data: () => ({
    itemsPerPageOptions: [10, 20, 30, 40, 50],
    pagination: {
      page: 1,
      sortBy: ['startTime'],
      sortDesc: [true],
      itemsPerPage: 20
    },
    status: ['active', 'pending', 'expired'],
    search: '',
    dialog: false,
    headers: [
      { text: '', value: 'icons' },
      { text: i18n.t('Customer'), value: 'customer' },
      { text: i18n.t('Environment'), value: 'environment' },
      { text: i18n.t('Service'), value: 'service' },
      { text: i18n.t('Resource'), value: 'resource' },
      { text: i18n.t('Event'), value: 'event' },
      { text: i18n.t('Group'), value: 'group' },
      { text: i18n.t('Tags'), value: 'tags' },
      { text: i18n.t('Origin'), value: 'origin' },
      { text: '', value: 'status' },
      { text: i18n.t('Start'), value: 'startTime' },
      { text: i18n.t('End'), value: 'endTime' },
      { text: i18n.t('Expires'), value: 'remaining' },
      { text: i18n.t('User'), value: 'user' },
      // { text: 'Created', value: 'createTime' }, FIXME
      { text: i18n.t('Reason'), value: 'text' },
      { text: i18n.t('Actions'), value: 'name', sortable: false }
    ],
    editedId: null,
    editedItem: {
      customer: null,
      environment: null,
      service: [],
      resource: null,
      event: null,
      group: null,
      tags: [],
      origin: null,
      period: {
        startDate: null,
        startTime: null,
        endDate: null,
        endTime: null
      },
      text: ''
    },
    menu1: false,
    menu2: false,
    defaultItem: {
      customer: null,
      environment: null,
      service: [],
      resource: null,
      event: null,
      group: null,
      tags: [],
      origin: null,
      period: {
        startDate: null,
        startTime: null,
        endDate: null,
        endTime: null
      },
      text: ''
    },
    rules: {
      required: (v) => !!v || i18n.t('Required')
    }
  }),
  computed: {
    blackouts() {
      return this.$store.state.blackouts.blackouts
        .filter((b) => !this.status || this.status.includes(b.status))
        .map((b) => {
          const t1 = DateTime.fromISO(b.startTime)
          const t2 = DateTime.fromISO(b.endTime)
          return Object.assign(b, {
            period: {
              startDate: t1.toFormat('yyyy-MM-dd'),
              startTime: t1.toFormat('HH:mm'),
              endDate: t2.toFormat('yyyy-MM-dd'),
              endTime: t2.toFormat('HH:mm')
            }
          })
        })
    },
    computedHeaders() {
      return this.headers.filter((h) =>
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
    currentTags() {
      return this.$store.getters['alerts/tags']
    },
    isLoading() {
      return this.$store.state.blackouts.isLoading
    },
    formTitle() {
      return !this.editedId ? i18n.t('NewBlackout') : i18n.t('EditBlackout')
    },
    blackoutStartNow() {
      return this.$store.getters.getPreference('blackoutStartNow')
    },
    blackoutPeriod() {
      return (
        this.$store.getters.getPreference('blackoutPeriod') ||
        this.$store.getters.getConfig('blackouts').duration
      )
    },
    times() {
      return Array.from(
        {
          length: (24 * 60) / 15
        },
        (v, i) => {
          const h = Math.floor((i * 15) / 60)
          const m = i * 15 - h * 60
          return ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2)
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
      this.getBlackouts()
      this.getCustomers()
      this.getEnvironments()
      this.getServices()
      this.getTags()
    }
  },
  created() {
    this.getBlackouts()
    this.getCustomers()
    this.getEnvironments()
    this.getServices()
    this.getTags()
    this.editedItem = Object.assign({}, this.defaultItem)
    this.editedItem.period = this.defaultTimes()
  },
  methods: {
    getBlackouts() {
      this.$store.dispatch('blackouts/getBlackouts')
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
    getBlackoutTime(date) {
      if (this.blackoutStartNow) return DateTime.fromJSDate(date)

      // return soonest 15 minute interval
      return DateTime.fromMillis(
        Math.ceil(date.getTime() / 1000 / 60 / 15) * 1000 * 60 * 15
      )
    },
    defaultTimes() {
      const now = new Date()
      const start = this.getBlackoutTime(now)
      now.setTime(now.getTime() + this.blackoutPeriod * 1000)
      const end = this.getBlackoutTime(now)

      return {
        startDate: start.toFormat('yyyy-MM-dd'),
        startTime: start.toFormat('HH:mm'),
        endDate: end.toFormat('yyyy-MM-dd'),
        endTime: end.toFormat('HH:mm')
      }
    },
    toISODate(date, time) {
      return new Date(date + ' ' + time).toISOString()
    },
    blackoutAttributes(blackout) {
      const alertAttr = [
        'environment',
        'service',
        'resource',
        'event',
        'group',
        'tags',
        'origin'
      ]
      return (
        Object.entries(blackout)
          .filter(
            ([, v]) =>
              (!Array.isArray(v) && !!v) || (Array.isArray(v) && v.length)
          )
          .filter((b) => alertAttr.includes(b[0]))
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .reduce((a, [k, _]) => a.concat(k), [])
      )
    },
    onlyEnvironment(blackout) {
      return (
        JSON.stringify(this.blackoutAttributes(blackout)) ===
        JSON.stringify(['environment'])
      )
    },
    onlyOrigin(blackout) {
      return (
        JSON.stringify(this.blackoutAttributes(blackout)) ===
        JSON.stringify(['environment', 'origin'])
      )
    },
    editItem(item) {
      this.editedId = item.id
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    copyItem(item) {
      this.editedItem = Object.assign({}, item)
      this.editedItem.period = this.defaultTimes()
      this.editedId = null
      this.dialog = true
    },
    deleteItem(item) {
      confirm(i18n.t('ConfirmDelete')) &&
        this.$store.dispatch('blackouts/deleteBlackout', item.id)
    },
    close() {
      this.dialog = false
      setTimeout(() => {
        this.$refs.form.resetValidation()
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedItem.period = this.defaultTimes()
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
      if (this.editedId) {
        this.$store.dispatch('blackouts/updateBlackout', [
          this.editedId,
          {
            customer: this.editedItem.customer,
            environment: this.editedItem.environment,
            service: this.editedItem.service,
            resource: this.editedItem.resource
              ? this.editedItem.resource
              : null,
            event: this.editedItem.event ? this.editedItem.event : null,
            group: this.editedItem.group ? this.editedItem.group : null,
            tags: this.editedItem.tags,
            origin: this.editedItem.origin ? this.editedItem.origin : null,
            startTime: this.toISODate(
              this.editedItem.period.startDate,
              this.editedItem.period.startTime
            ),
            endTime: this.toISODate(
              this.editedItem.period.endDate,
              this.editedItem.period.endTime
            ),
            text: this.editedItem.text
          }
        ])
      } else {
        this.$store.dispatch(
          'blackouts/createBlackout',
          Object.assign(this.editedItem, {
            id: null,
            startTime: this.toISODate(
              this.editedItem.period.startDate,
              this.editedItem.period.startTime
            ),
            endTime: this.toISODate(
              this.editedItem.period.endDate,
              this.editedItem.period.endTime
            )
          })
        )
      }
      this.close()
    }
  }
}
</script>

<style></style>
