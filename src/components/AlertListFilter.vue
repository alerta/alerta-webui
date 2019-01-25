<template>
  <v-navigation-drawer
    :value="sidesheet"
    clipped
    absolute
    hide-overlay
    width="300"
    right
  >
    <v-card
      tile
    >
      <v-toolbar card dense>
        <v-toolbar-title class="body-2 grey--text">Filters</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <!-- <v-btn flat @click="dialog = false">Reset</v-btn> -->
        </v-toolbar-items>
        <v-menu bottom right offset-y>
          <v-btn slot="activator" icon @click="close">
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
          <v-flex>
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
            ></v-select>
          </v-flex>

          <v-flex xs12 sm6 md12>
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
            ></v-select>
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
      text: null,
      statusList: [
        'open',
        'assign',
        'ack',
        'shelved',
        'blackout',
        'closed',
        'expired'
      ],
      selectedStatus: this.filter.status || [],
      selectedService: this.filter.service || []
    }
  },
  computed: {
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
    }
  },
  watch: {
    value(val) {
      this.sidesheet = val
    }
  },
  created() {
    this.getServices()
  },
  methods: {
    takeAction(action) {
      this.$store.dispatch('alerts/takeAction', [
        this.item.id,
        action,
        this.text
      ])
    },
    shelveAlert() {
      this.$store.dispatch('alerts/takeAction', [
        this.item.id,
        'shelve',
        this.text,
        this.shelveTimeout
      ])
    },
    watchAlert() {
      let user = this.$store.getters['auth/getPayload'].name
      this.$store.dispatch('alerts/tagAlert', [
        this.item.id,
        { tags: [`watch:${user}`] }
      ])
    },
    unwatchAlert() {
      let user = this.$store.getters['auth/getPayload'].name
      this.$store.dispatch('alerts/untagAlert', [
        this.item.id,
        { tags: [`watch:${user}`] }
      ])
    },
    deleteAlert() {
      confirm('Are you sure you want to delete this item?') &&
        this.$store.dispatch('alerts/deleteAlert', this.item.id)
    },
    getServices() {
      this.$store.dispatch('alerts/getServices')
    },
    setStatus(status) {
      this.$emit('set-status', status)
    },
    setService(service) {
      this.$emit('set-service', service)
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style>
</style>
