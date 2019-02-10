<template>
  <div>
    <v-dialog
      v-model="dialog"
      max-width="500px"
    >
      <v-card>
        <v-toolbar
          dark
          color="secondary"
        >
          <v-toolbar-title>{{ formTitle }}</v-toolbar-title>
          <v-spacer />
        </v-toolbar>

        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex
                xs12
                sm6
                md12
              >
                <v-select
                  v-model="editedItem.customer"
                  :items="allowedCustomers"
                  label="Customer"
                />
              </v-flex>
              <v-flex
                xs12
                sm6
                md12
              >
                <v-select
                  v-model="editedItem.environment"
                  :items="allowedEnvironments"
                  label="Environment"
                  required
                />
              </v-flex>

              <v-flex
                xs12
                lg4
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
                    v-model="editedItem.period.startDate"
                    label="Start Date"
                    prepend-icon="event"
                  />
                  <v-date-picker
                    v-model="editedItem.period.startDate"
                    no-title
                    @input="menu1 = false"
                  />
                </v-menu>
              </v-flex>

              <v-flex
                xs12
                lg2
                d-flex
              >
                <v-select
                  v-model="editedItem.period.startTime"
                  :items="times"
                />
              </v-flex>
              <v-flex
                xs12
                lg2
                d-flex
              >
                <v-select
                  v-model="editedItem.period.endTime"
                  :items="times"
                />
              </v-flex>

              <v-flex
                xs12
                lg4
              >
                <v-menu
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
                    v-model="editedItem.period.endDate"
                    label="End Date"
                  />
                  <v-date-picker
                    v-model="editedItem.period.endDate"
                    no-title
                    @input="menu2 = false"
                  />
                </v-menu>
              </v-flex>

              <v-flex
                xs12
                sm6
                md12
              >
                <v-select
                  v-model="editedItem.service"
                  :items="currentServices"
                  :menu-props="{ maxHeight: '400' }"
                  label="Service"
                  multiple
                  hint="Choose one or more service"
                  persistent-hint
                />
              </v-flex>
              <v-flex
                xs12
                sm6
                md12
              >
                <v-text-field
                  v-model="editedItem.resource"
                  label="Resource"
                />
              </v-flex>
              <v-flex
                xs12
                sm6
                md12
              >
                <v-text-field
                  v-model="editedItem.event"
                  label="Event"
                />
              </v-flex>
              <v-flex
                xs12
                sm6
                md12
              >
                <v-text-field
                  v-model="editedItem.group"
                  label="Group"
                />
              </v-flex>

              <v-flex
                xs12
                sm6
                md12
              >
                <v-combobox
                  v-model="editedItem.tags"
                  :items="currentTags"
                  label="Tags"
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
                sm6
                md12
              >
                <v-text-field
                  v-model="editedItem.text"
                  label="Reason"
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
            Cancel
          </v-btn>
          <v-btn
            color="blue darken-1"
            flat
            @click="save"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card>
      <v-card-title class="title">
        Blackouts
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="search"
          label="Search"
          single-line
          hide-details
        />
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="blackouts"
        :rows-per-page-items="rowsPerPageItems"
        :pagination.sync="pagination"
        class="px-2"
        :search="search"
        :loading="isLoading"
        must-sort
        sort-icon="arrow_drop_down"
      >
        <template
          slot="items"
          slot-scope="props"
        >
          <td>{{ props.item.customer }}</td>
          <td>{{ props.item.environment }}</td>
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
                v-if="props.item.status == 'pending'"
                slot="activator"
                light
                small
              >
                schedule
              </v-icon>

              <v-icon
                v-if="props.item.status == 'active'"
                slot="activator"
                color="primary"
                small
              >
                notifications_paused
              </v-icon>

              <v-icon
                v-if="props.item.status == 'expired'"
                slot="activator"
                small
              >
                block
              </v-icon>
            </v-tooltip>
          </td>
          <td class="text-xs-left">
            <date-time
              :value="props.item.startTime"
              format="mediumDate"
            />
          </td>
          <td class="text-xs-left">
            <date-time
              :value="props.item.endTime"
              format="mediumDate"
            />
          </td>
          <td
            class="text-xs-left"
            nowrap
          >
            {{ props.item.endTime | until }}
          </td>
          <td class="text-xs-left">
            {{ props.item.user }}
          </td>
          <!-- <td class="text-xs-left">
            <date-time :value="props.item.createTime" format="mediumDate"/>
          </td> -->
          <td class="text-xs-left">
            {{ props.item.text }}
          </td>
          <td class="justify-center layout px-0">
            <v-icon
              small
              class="mr-2"
              @click="editItem(props.item)"
            >
              edit
            </v-icon>
            <v-icon
              small
              class="mr-2"
              @click="copyItem(props.item)"
            >
              content_copy
            </v-icon>
            <v-icon
              small
              @click="deleteItem(props.item)"
            >
              delete
            </v-icon>
          </td>
        </template>
        <template slot="no-data">
          <v-alert
            :value="true"
            color="error"
            icon="warning"
          >
            Sorry, nothing to display here :(
          </v-alert>
        </template>
        <v-alert
          slot="no-results"
          :value="true"
          color="error"
          icon="warning"
        >
          Your search for "{{ search }}" found no results.
        </v-alert>
      </v-data-table>
    </v-card>

    <list-button-add
      v-has-perms="'write:blackouts'"
      @add-to-list="dialog = true"
    />
  </div>
</template>

<script>
import DateTime from '@/components/DateTime'
import ListButtonAdd from '@/components/ListButtonAdd'
import moment from 'moment'

export default {
  components: {
    DateTime,
    ListButtonAdd
  },
  data() {
    return {
      descending: true,
      page: 1,
      rowsPerPageItems: [10, 20, 30, 40],
      pagination: {
        sortBy: 'startTime',
        rowsPerPage: 20
      },
      // totalItems: number,
      search: '',
      dialog: false,
      headers: [
        { text: 'Customer', value: 'customer' },
        { text: 'Environment', value: 'environment' },
        { text: 'Service', value: 'service' },
        { text: 'Resource', value: 'resource' },
        { text: 'Event', value: 'event' },
        { text: 'Group', value: 'group' },
        { text: 'Tags', value: 'tags' },
        { text: '', value: 'status' },
        { text: 'Start', value: 'startTime' },
        { text: 'End', value: 'endTime' },
        { text: 'Expires', value: 'remaining' },
        { text: 'User', value: 'user' },
        // { text: 'Created', value: 'createTime' },
        { text: 'Reason', value: 'text' },
        { text: 'Actions', value: 'name', sortable: false }
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
        period: this.defaultTimes(),
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
        period: {
          startDate: null,
          startTime: null,
          endDate: null,
          endTime: null
        },
        text: ''
      },
      rules: {}
    }
  },
  computed: {
    blackouts() {
      return this.$store.state.blackouts.blackouts.map(b => {
        let s = moment(b.startTime)
        let e = moment(b.endTime)
        return Object.assign(b, {
          period: {
            startDate: s.format('YYYY-MM-DD'),
            startTime: s.format('HH:mm'),
            endDate: e.format('YYYY-MM-DD'),
            endTime: e.format('HH:mm')
          }
        })
      })
    },
    allowedCustomers() {
      return this.$store.getters['customers/customers']
    },
    allowedEnvironments() {
      return this.$store.getters['alerts/environments']
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
      return !this.editedId ? 'New Blackout' : 'Edit Blackout'
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
    getNext15mins(date) {
      return moment(
        new Date(
          Math.ceil(date.getTime() / 1000 / 60 / 15) * 1000 * 60 * 15
        ).toISOString()
      )
    },
    defaultTimes() {
      let now = new Date()
      let start = this.getNext15mins(now)
      now.setTime(now.getTime() + 1 * 60 * 60 * 1000) // plus 1 hour
      let end = this.getNext15mins(now)

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
    editItem(item) {
      this.editedId = item.id
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    copyItem(item) {
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    deleteItem(item) {
      confirm('Are you sure you want to delete this item?') &&
        this.$store.dispatch('blackouts/deleteBlackout', item.id)
    },
    close() {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedItem.period = this.defaultTimes()
        this.editedId = null
      }, 300)
    },
    save() {
      if (this.editedId) {
        this.$store.dispatch('blackouts/updateBlackout', [
          this.editedId,
          {
            customer: this.editedItem.customer,
            environment: this.editedItem.environment,
            service: this.editedItem.service,
            resource: this.editedItem.resource,
            event: this.editedItem.event,
            group: this.editedItem.group,
            tags: this.editedItem.tags,
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
