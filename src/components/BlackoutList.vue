<template>
  <div>
    <v-dialog
      v-model="dialog"
      max-width="700px"
    >
      <v-form ref="form">
        <v-card>
          <v-card-title>
            <span class="text-h5">
              {{ formTitle }}
            </span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-row wrap>
                <v-col
                  v-if="$config.customer_views"
                  xs="12"
                  sm="12"
                >
                  <v-select
                    v-model="editedItem.customer"
                    :items="allowedCustomers"
                    :label="$t('Customer')"
                    clearable
                  />
                </v-col>
                <v-col
                  xs="12"
                  sm="12"
                >
                  <v-select
                    v-model="editedItem.environment"
                    :items="allowedEnvironments"
                    :label="$t('Environment')"
                    :rules="[rules.required]"
                    required
                  />
                </v-col>

                <v-col
                  xs="4"
                  sm="4"
                >
                  <v-menu
                    ref="menu1"
                    v-model="menu1"
                    :close-on-content-click="false"
                    :offset="40"
                    lazy
                    transition="scale-transition"
                    full-width
                    max-width="290px"
                    min-width="290px"
                  >
                    <template #activator="{props}">
                      <div v-bind="props">
                        <!--TODO: Native input elements are used while v-date-picker is not yet released for Vuetify 3-->
                        <label v-html="$t('StartDate')" for="startdate"/>
                        <br/>
                        <input type="date" v-model="editedItem.period.startDate" name="startdate" class="datetime"/>
                      </div>
                      <!-- <v-text-field
                        v-bind="props"
                        v-model="editedItem.period.startDate"
                        :label="$t('StartDate')"
                        prepend-icon="event"
                      /> -->
                    </template>
                    <!--TODO: Wait until v-date-picker is readded to Vuetify 3?-->
                    <!-- <v-date-picker
                      v-model="editedItem.period.startDate"
                      no-title
                      @update:model-value="menu1 = false"
                    /> -->
                  </v-menu>
                </v-col>

                <v-col
                  xs="2"
                  sm="2"
                >
                  <v-combobox
                    v-model="editedItem.period.startTime"
                    :items="times"
                  />
                </v-col>
                <v-col
                  xs="2"
                  sm="2"
                >
                  <v-combobox
                    v-model="editedItem.period.endTime"
                    :items="times"
                  />
                </v-col>

                <v-col
                  xs="4"
                  sm="4"
                >
                  <v-menu
                    v-model="menu2"
                    :close-on-content-click="false"
                    :offset="40"
                    lazy
                    transition="scale-transition"
                    full-width
                    max-width="290px"
                    min-width="290px"
                  >
                    <template #activator="{props}">
                      <div v-bind="props">
                        <!--TODO: Native input elements are used while v-date-picker is not yet released for Vuetify 3-->
                        <label v-html="$t('EndDate')" for="enddate"/>
                        <br/>
                        <input type="date" v-model="editedItem.period.endDate" name="enddate" class="datetime"/>
                      </div>
                      <!-- <v-text-field
                        v-bind="props"
                        v-model="editedItem.period.endDate"
                        :label="$t('EndDate')"
                      /> -->
                    </template>
                    <!--TODO: Wait until v-date-picker is readded to Vuetify 3?-->
                    <!-- <v-date-picker
                      v-model="editedItem.period.endDate"
                      no-title
                      @update:model-value="menu2 = false"
                    /> -->
                  </v-menu>
                </v-col>

                <v-col
                  xs="12"
                  sm="6"
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
                </v-col>
                <v-col
                  xs="12"
                  sm="6"
                >
                  <v-text-field
                    v-model.trim="editedItem.resource"
                    :label="$t('Resource')"
                  />
                </v-col>
                <v-col
                  xs="12"
                  sm="6"
                >
                  <v-text-field
                    v-model.trim="editedItem.event"
                    :label="$t('Event')"
                  />
                </v-col>
                <v-col
                  xs="12"
                  sm="6"
                >
                  <v-text-field
                    v-model.trim="editedItem.group"
                    :label="$t('Group')"
                  />
                </v-col>

                <v-col
                  xs="12"
                  sm="6"
                >
                  <v-combobox
                    v-model="editedItem.tags"
                    :items="currentTags"
                    :label="$t('Tags')"
                    multiple
                    chips
                  >
                    <template #selection="data">
                      <v-chip
                        :key="JSON.stringify(data.item)"
                        :value="data.selected"
                        :disabled="data.disabled"
                        class="v-chip--select-multi"
                        label
                        small
                        @update:model-value="data.parent.selectItem(data.item)"
                      >
                        <v-icon start>
                          label
                        </v-icon>{{ data.item }}
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-col>

                <v-col
                  xs="12"
                  sm="6"
                >
                  <v-text-field
                    v-model.trim="editedItem.origin"
                    :label="$t('Origin')"
                  />
                </v-col>

                <v-col
                  xs="12"
                  sm="12"
                >
                  <v-text-field
                    v-model.trim="editedItem.text"
                    :label="$t('Reason')"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="blue-darken-1"
              variant="flat"
              @click="close"
            >
              {{ $t('Cancel') }}
            </v-btn>
            <v-btn
              color="blue-darken-1"
              variant="flat"
              @click="validate"
            >
              {{ $t('Save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-card>
      <v-card-title class="text-h6">
        <v-row>
          <v-col>
            {{ $t('Blackouts') }}
          </v-col>
          <v-spacer />
          <v-col>
            <v-btn-toggle
              v-model="status"
              class="bg-transparent"
              multiple
            >
              <v-btn
                value="active"
                variant="flat"
              >
                <v-tooltip location="bottom">
                  <template #activator="{props}">
                    <v-icon v-bind="props">
                      notifications_paused
                    </v-icon>
                  </template>
                  <span>{{ $t('Active') }}</span>
                </v-tooltip>
              </v-btn>
              <v-btn
                value="pending"
                variant="flat"
              >
                <v-tooltip location="bottom">
                  <template #activator="{props}">
                    <v-icon v-bind="props">
                      schedule
                    </v-icon>
                  </template>
                  <span>{{ $t('Pending') }}</span>
                </v-tooltip>
              </v-btn>
              <v-btn
                value="expired"
                variant="flat"
              >
                <v-tooltip location="bottom">
                  <template #activator="{props}">
                    <v-icon
                      v-bind="props">
                      block
                    </v-icon>
                  </template>
                  <span>{{ $t('Expired') }}</span>
                </v-tooltip>
              </v-btn>
            </v-btn-toggle>
          </v-col>
          <v-spacer />
          <v-col sm="5">
            <v-text-field
              v-model="search"
              append-icon="search"
              :label="$t('Search')"
              single-line
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-title>

      <v-data-table
        :headers="computedHeaders"
        :items="blackouts"
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
            <td>
              <v-tooltip location="top">
                <template #activator="{props}">
                  <v-icon
                    v-if="onlyEnvironment(item.props)"
                    v-bind="props"
                    color="red"
                    size="small"
                  >
                    report_problem
                  </v-icon>
                </template>
                {{ $t('WholeEnvironment') }}
              </v-tooltip>
              <v-tooltip location="top">
                <template #activator="{props}">
                  <v-icon
                    v-if="onlyOrigin(item.props)"
                    v-bind="props"
                    color="red"
                    size="small"
                  >
                    report_problem
                  </v-icon>
                </template>
                {{ $t('AllOrigin') }}
              </v-tooltip>
            </td>
            <td
              v-if="$config.customer_views"
            >
              {{ item.props.customer }}
            </td>
            <td>{{ item.props.environment }}</td>
            <td>
              <v-chip
                v-for="service in item.props.service"
                :key="service"
                variant="outlined"
                small
              >
                {{ service }}
              </v-chip>
            </td>
            <td>{{ item.props.resource }}</td>
            <td>{{ item.props.event }}</td>
            <td>{{ item.props.group }}</td>
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
            <td>{{ item.props.origin }}</td>
            <td class="text-right">
              <v-tooltip location="top">
                <template #activator="{props}">
                  <v-icon
                    v-if="item.props.status == 'pending'"
                    v-bind="props"
                    light
                    size="small"
                  >
                    schedule
                  </v-icon>

                  <v-icon
                    v-if="item.props.status == 'active'"
                    v-bind="props"
                    color="primary"
                    size="small"
                  >
                    notifications_paused
                  </v-icon>

                  <v-icon
                    v-if="item.props.status == 'expired'"
                    v-bind="props"
                    size="small"
                  >
                    block
                  </v-icon>
                </template>
                {{ this.$filters.capitalize(item.props.status) }}
              </v-tooltip>
            </td>
            <td class="text-left">
              <date-time
                :value="item.props.startTime"
                format="mediumDate"
              />
            </td>
            <td class="text-left">
              <date-time
                :value="item.props.endTime"
                format="mediumDate"
              />
            </td>
            <td
              class="text-left text-no-wrap"
            >
              {{ this.$filters.until(item.props.endTime) }}
            </td>
            <td class="text-left">
              {{ item.props.user }}
            </td>
            <td class="text-left">
              {{ item.props.text }}
            </td>
            <td class="text-no-wrap">
              <v-btn
                v-has-perms.disable="'write:blackouts'"
                icon
                class="btn--plain mr-0"
                @click="editItem(item.props)"
              >
                <v-icon
                  size="small"
                  color="grey-darken-3"
                >
                  edit
                </v-icon>
              </v-btn>
              <v-btn
                v-has-perms.disable="'write:blackouts'"
                icon
                class="btn--plain mx-0"
                @click="copyItem(item.props)"
              >
                <v-icon
                  size="small"
                  color="grey-darken-3"
                >
                  content_copy
                </v-icon>
              </v-btn>
              <v-btn
                v-has-perms.disable="'write:blackouts'"
                icon
                class="btn--plain mx-0"
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
        <template #bottom>
          <v-data-table-footer       
            :items-per-page-options="rowsPerPageItems.map(
              row => {
                return {
                  title: row.toString(),
                  value: row
                }
              }
            )"
          />
        </template>
      </v-data-table>
    </v-card>

    <list-button-add
      perms="write:blackouts"
      @add-to-list="dialog = true"
    />
  </div>
</template>

<script>
import DateTime from './lib/DateTime'
import ListButtonAdd from './lib/ListButtonAdd'
import moment from 'moment'
import i18n from '@/plugins/i18n'

export default {
  components: {
    DateTime,
    ListButtonAdd
  },
  data: vm => ({
    descending: true,
    page: 1,
    rowsPerPageItems: [10, 20, 30, 40, 50],
    pagination: {
      sortBy: 'startTime',
      rowsPerPage: 20
    },
    // totalItems: number,
    status: ['active', 'pending', 'expired'],
    search: '',
    dialog: false,
    headers: [
      { title: '', key: 'icons' },
      { title: i18n.global.t('Customer'), key: 'customer' },
      { title: i18n.global.t('Environment'), key: 'environment' },
      { title: i18n.global.t('Service'), key: 'service' },
      { title: i18n.global.t('Resource'), key: 'resource' },
      { title: i18n.global.t('Event'), key: 'event' },
      { title: i18n.global.t('Group'), key: 'group' },
      { title: i18n.global.t('Tags'), key: 'tags' },
      { title: i18n.global.t('Origin'), key: 'origin' },
      { title: '', key: 'status' },
      { title: i18n.global.t('Start'), key: 'startTime' },
      { title: i18n.global.t('End'), key: 'endTime' },
      { title: i18n.global.t('Expires'), key: 'remaining' },
      { title: i18n.global.t('User'), key: 'user' },
      // { title: 'Created', key: 'createTime' }, FIXME
      { title: i18n.global.t('Reason'), key: 'text' },
      { title: i18n.global.t('Actions'), key: 'name', sortable: false }
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
      required: v => !!v || i18n.global.t('Required')
    }
  }),
  computed: {
    blackouts() {
      return this.$store.state.blackouts.blackouts
        .filter(b => !this.status || this.status.includes(b.status))
        .map(b => {
          let s = moment(b.startTime)
          let e = moment(b.endTime)
          return Object.assign({}, b, {
            period: {
              startDate: s.format('YYYY-MM-DD'),
              startTime: s.format('HH:mm'),
              endDate: e.format('YYYY-MM-DD'),
              endTime: e.format('HH:mm')
            }
          })
        })
    },
    computedHeaders() {
      return this.headers.filter(h => !this.$config.customer_views ? h.key != 'customer' : true)
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
      return !this.editedId ? i18n.global.t('NewBlackout') : i18n.global.t('EditBlackout')
    },
    blackoutStartNow() {
      return this.$store.getters.getPreference('blackoutStartNow')
    },
    blackoutPeriod() {
      return (
        (this.$store.getters.getPreference('blackoutPeriod') ||
          this.$store.getters.getConfig('blackouts').duration)
      )
    },
    times() {
      return Array.from(
        {
          length: (24 * 60) / 15
        },
        (v, i) => {
          let h = Math.floor((i * 15) / 60)
          let m = i * 15 - h * 60
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
      if (this.blackoutStartNow) {
        return moment(date)
      }
      // return soonest 15 minute interval
      return moment(
        new Date(
          Math.ceil(date.getTime() / 1000 / 60 / 15) * 1000 * 60 * 15
        ).toISOString()
      )
    },
    defaultTimes() {
      let now = new Date()
      let start = this.getBlackoutTime(now)
      now.setTime(now.getTime() + this.blackoutPeriod * 1000)
      let end = this.getBlackoutTime(now)

      return {
        startDate: start.format('YYYY-MM-DD'),
        startTime: start.format('HH:mm'),
        endDate: end.format('YYYY-MM-DD'),
        endTime: end.format('HH:mm')
      }
    },
    toISODate(date, time) {
      return new Date(date + ' ' + time).toISOString()
    },
    blackoutAttributes(blackout) {
      const alertAttr = ['environment', 'service', 'resource', 'event', 'group', 'tags', 'origin']
      return Object.entries(blackout)
        .filter(([_, v]) => (!Array.isArray(v) && !!v) || (Array.isArray(v) && v.length))
        .filter(b => alertAttr.includes(b[0]))
        .reduce((a, [k, _]) => a.concat(k), [])
    },
    onlyEnvironment(blackout) {
      return JSON.stringify(this.blackoutAttributes(blackout)) === JSON.stringify(['environment'])
    },
    onlyOrigin(blackout) {
      return JSON.stringify(this.blackoutAttributes(blackout)) === JSON.stringify(['environment', 'origin'])
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
      confirm(i18n.global.t('ConfirmDelete')) &&
        this.$store.dispatch('blackouts/deleteBlackout', item.id)
    },
    close() {
      this.dialog = false
      setTimeout(() => {
        this.$refs.form.resetValidation()
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedItem.period = this.defaultTimes()
        this.editedId = null
      }, 100)
    },
    validate() {
      this.$refs.form.validate().then((status) => {
        if(status){
          this.$refs.form.resetValidation()
          this.save()
        }
      })
    },
    save() {
      if (this.editedId) {
        this.$store.dispatch('blackouts/updateBlackout', [
          this.editedId,
          {
            customer: this.editedItem.customer,
            environment: this.editedItem.environment,
            service: this.editedItem.service,
            resource: this.editedItem.resource ? this.editedItem.resource : null,
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

<style>
.datetime {
  border-style: solid;
  border-radius: 5px;
  padding: 10px;
}
</style>
