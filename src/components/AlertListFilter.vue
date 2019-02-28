<template>
  <v-navigation-drawer
    :value="sidesheet"
    clipped
    disable-resize-watcher
    absolute
    hide-overlay
    width="300"
    right
  >
    <v-card tile>
      <v-toolbar
        :color="isDark ? '#616161' : '#eeeeee'"
        card
        dense
      >
        <v-toolbar-title>
          Filters
        </v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <!-- <v-btn flat @click="dialog = false">Reset</v-btn> -->
        </v-toolbar-items>
        <v-menu
          bottom
          right
          offset-y
        >
          <v-btn
            slot="activator"
            icon
            @click="close"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-menu>
      </v-toolbar>

      <v-container
        fluid
        grid-list-xl
      >
        <v-layout
          align-center
          wrap
        >
          <v-flex
            xs12
            sm6
            md12
          >
            <v-text-field
              v-model="filterText"
              label="Search"
              prepend-inner-icon="search"
              outline
              dense
              clearable
              hint="Filter results by text search"
              persistent-hint
              @input="setText"
            />
          </v-flex>

          <v-flex
            xs12
            sm6
            md12
          >
            <v-select
              v-model="selectedStatus"
              :items="statusList"
              small-chips
              placeholder="All statuses"
              label="Status"
              multiple
              outline
              dense
              hint="Choose one or more status"
              persistent-hint
              @change="setStatus"
            />
          </v-flex>

          <v-flex
            xs12
            sm6
            md12
          >
            <v-select
              v-model="selectedService"
              :items="currentServices"
              :menu-props="{ maxHeight: '400' }"
              placeholder="All services"
              label="Service"
              multiple
              outline
              dense
              hint="Choose one or more service"
              persistent-hint
              @change="setService"
            />
          </v-flex>

          <v-flex
            xs12
            sm6
            md12
          >
            <v-select
              v-model="selectedGroup"
              :items="currentGroups"
              :menu-props="{ maxHeight: '400' }"
              placeholder="All groups"
              label="Group"
              multiple
              outline
              dense
              hint="Choose one or more group"
              persistent-hint
              @change="setGroup"
            />
          </v-flex>

          <v-flex
            xs12
            sm6
            md12
          >
            <v-select
              v-model="selectedDateRange"
              :items="dateRanges"
              name="dateRange"
              label="Date/Time"
              outline
              item-text="text"
              item-value="range"
              @input="setDateRange"
            />
          </v-flex>
        </v-layout>
      </v-container>
    </v-card>
  </v-navigation-drawer>
</template>

<script>
export default {
  components: {},
  props: {
    value: {
      type: Boolean,
      default: false
    },
    filter: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      sidesheet: this.value,
      active: null,
      pagination: {
        rowsPerPage: 10,
        sortBy: 'updateTime'
      },
      headers: [
        { text: 'Alert ID', value: 'id' },
        { text: 'Update Time', value: 'updateTime' },
        { text: 'Severity', value: 'severity' },
        { text: 'Status', value: 'status' },
        { text: 'Type', value: 'type' },
        { text: 'Event', value: 'event' },
        { text: 'Value', value: 'value' },
        { text: 'Text', value: 'text' }
      ],
      statusList: [
        'open',
        'assign',
        'ack',
        'shelved',
        'blackout',
        'closed',
        'expired'
      ],
      dateRanges: [
        { text: 'Latest', range: [null, null] },
        { text: '1 hour', range: [3600, null] },
        { text: '6 hours', range: [3600 * 6, null] },
        { text: '12 hours', range: [3600 * 12, null] }
      ],
      filterText: this.filter.text || null,
      selectedStatus: this.filter.status || [],
      selectedService: this.filter.service || [],
      selectedGroup: this.filter.group || [],
      selectedDateRange: this.filter.dateRange || [null, null]
    }
  },
  computed: {
    isDark() {
      return this.$store.getters.getPreference('isDark')
    },
    history() {
      return this.item.history.map((h, index) => ({ index: index, ...h }))
    },
    shelveTimeout() {
      return this.$store.getters.getPreference('shelveTimeout')
    },
    isWatched() {
      let user = this.$store.getters['auth/getPayload'].name
      return this.item.tags.indexOf(`watch:${user}`) > -1
    },
    currentServices() {
      return this.$store.getters['alerts/services']
    },
    currentGroups() {
      return this.$store.getters['alerts/groups']
    }
  },
  watch: {
    value(val) {
      this.sidesheet = val
    }
  },
  created() {
    this.getServices()
    this.getGroups()
  },
  methods: {
    getServices() {
      this.$store.dispatch('alerts/getServices')
    },
    getGroups() {
      this.$store.dispatch('alerts/getGroups')
    },
    setText(text) {
      this.$emit('set-text', text)
    },
    setStatus(status) {
      this.$emit('set-status', status)
    },
    setService(service) {
      this.$emit('set-service', service)
    },
    setGroup(group) {
      this.$emit('set-group', group)
    },
    setDateRange() {
      this.$emit('set-date', this.selectedDateRange)
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style></style>
