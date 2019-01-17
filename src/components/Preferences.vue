<template>
  <div>

    <v-switch
      label="Dark theme"
      :input-value="editedItem.isDark"
      hint="Enable dark theme throughout the app"
      persistent-hint
      @change="toggle('isDark', $event)"
    >
    </v-switch>
    <v-switch
      label="Mute"
      :input-value="editedItem.isMute"
      hint="Audible sound for new alerts"
      persistent-hint
      @change="toggle('isMute', $event)"
    >
    </v-switch>

    dates => <pre>{{ dates }}</pre>

    <v-form>
      <v-container>
        <v-layout>
          <v-flex
            xs12
            md4
          >
            <v-text-field
              v-model="editedItem.shortTime"
              label="Short Time"
              :hint="shortTimeHint"
            ></v-text-field>
            <v-text-field
              v-model="editedItem.mediumDate"
              label="Medium Date"
              :hint="mediumDateHint"
            ></v-text-field>
            <v-text-field
              v-model="editedItem.longDate"
              label="Long Date"
              :hint="longDateHint"
            ></v-text-field>
            <v-text-field
              v-model.number="editedItem.shelveTimeout"
              label="Shelve Timeout"
              hint="Hours"
            ></v-text-field>
            <v-text-field
              v-model.number="editedItem.refreshInterval"
              label="Refresh Interval"
              hint="Seconds"
            ></v-text-field>
            <v-btn
              @click="save"
            >
              Save
            </v-btn>

          </v-flex>
        </v-layout>
      </v-container>
    </v-form>

  </div>
</template>

<script>
export default {
  data: () => ({
    editedItem: {
      shortTime: null,
      mediumDate: null,
      longDate: null,
      shelveTimeout: null,
      refreshInterval: null
    }
  }),
  computed: {
    isDark() {
      return this.$store.getters.getPreference('isDark')
    },
    isMute() {
      return this.$store.getters.getPreference('isMute')
    },
    dates() {
      return this.$store.getters.getPreference('dates')
    },
    shortTimeHint() {
      return `Example ${this.$options.filters.date(
        new Date().toISOString(),
        this.dates.shortTime
      )}`
    },
    mediumDateHint() {
      return `Example ${this.$options.filters.date(
        new Date().toISOString(),
        this.dates.mediumDate
      )}`
    },
    longDateHint() {
      return `Example ${this.$options.filters.date(
        new Date().toISOString(),
        this.dates.longDate
      )}`
    },
    shelveTimeout() {
      return this.$store.getters.getPreference('shelveTimeout')
    },
    refreshInterval() {
      return (
        this.$store.getters.getPreference('refreshInterval') ||
        this.$store.getters.getConfig('refresh_interval')
      )
    }
  },
  mounted() {
    this.$store.dispatch('getUserPrefs')
  },
  methods: {
    toggle(sw, value) {
      console.log('toggle', sw, value)
      this.$store.dispatch('toggle', [sw, value])
    },
    save() {
      this.$store.dispatch('setUserPrefs', {
        isDark: this.editedItem.isDark,
        isMute: this.editedItem.isMute,
        dates: this.editedItem.dates,
        refreshInterval: this.editedItem.refreshInterval,
        shelveTimeout: this.editedItem.shelveTimeout
      })
    }
  }
}
</script>

<style>
</style>
