<template>
  <v-form ref="form">
    <v-card
      flat
      class="pl-3"
    >
      <v-card-title
        class="pb-0"
      >
        <div>
          <div class="headline">
            Application settings
          </div>
        </div>
      </v-card-title>
      <v-card-actions>
        <v-radio-group
          class="mt-0"
        >
          <v-checkbox
            v-model="isDark"
            label="Dark theme"
            hide-details
            class="my-0"
          />
          <v-checkbox
            v-model="isPlaySounds"
            label="Play notification sounds"
            hide-details
            class="my-0"
            :disabled="!$config.audio.new"
          />
        </v-radio-group>
      </v-card-actions>
    </v-card>

    <v-card
      flat
      class="pl-3"
    >
      <v-flex
        sm6
        md4
      >
        <v-card-title
          class="pb-0"
        >
          <div>
            <div class="headline">
              Date and time settings
            </div>
          </div>
        </v-card-title>
        <v-card-actions>
          <v-layout column>
            <v-select
              v-model="longDate"
              :items="dateFormats"
              label="Long date format"
            />

            <v-select
              v-model="mediumDate"
              :items="dateFormats"
              label="Medium date format"
            />

            <v-select
              v-model="shortTime"
              :items="timeFormats"
              label="Short time format"
            />
          </v-layout>
        </v-card-actions>
      </v-flex>
    </v-card>

    <v-card
      flat
      class="pl-3"
    >
      <v-flex
        sm6
        md4
      >
        <v-card-title
          class="pb-0"
        >
          <div>
            <div class="headline">
              Alert summary settings
            </div>
          </div>
        </v-card-title>
        <v-card-actions>
          <v-layout column>
            <v-combobox
              v-model.number="refreshInterval"
              :items="refreshOptions"
              label="Refresh interval"
              type="number"
              suffix="seconds"
            />

            <v-combobox
              v-model.number="shelveTimeout"
              :items="shelveTimeoutOptions"
              label="Shelve timeout"
              type="number"
              suffix="hours"
            />
          </v-layout>
        </v-card-actions>
      </v-flex>
    </v-card>

    <v-card flat>
      <v-flex
        sm6
        md4
      >
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="blue darken-1"
            flat
            @click="reset"
          >
            Reset
          </v-btn>
        </v-card-actions>
      </v-flex>
    </v-card>
  </v-form>
</template>

<script>
import moment from 'moment'

export default {
  data: () => ({
    dateFormats: [
      {text: moment().format('L'), value: 'L'},
      {text: moment().format('l'), value: 'l'},
      {text: moment().format('LL'), value: 'LL'},
      {text: moment().format('ll'), value: 'll'},
      {text: moment().format('ddd D MMM HH:mm'), value: 'ddd D MMM HH:mm'},
      {text: moment().format('LLL'), value: 'LLL'},
      {text: moment().format('lll'), value: 'lll'},
      {text: moment().format('LLLL'), value: 'LLLL'},
      {text: moment().format('llll'), value: 'llll'},
      {text: moment().format('ddd D MMM, YYYY HH:mm:ss.SSS Z'), value: 'ddd D MMM, YYYY HH:mm:ss.SSS Z'},
      {text: moment().format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'), value: 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'},

    ],
    timeFormats: [
      {text: moment().format('LT'), value: 'LT'},
      {text: moment().format('LTS'), value: 'LTS'},
      {text: moment().format('HH:mm:ss'), value: 'HH:mm:ss'},
      {text: moment().format('HH:mm:ss.SSS Z'), value: 'HH:mm:ss.SSS Z'},
    ],
    refreshOptions: [2, 5, 10, 30, 60],  // seconds
    shelveTimeoutOptions: [1, 2, 4, 8, 24]  // hours
  }),
  computed: {
    isDark: {
      get() {
        return this.$store.getters.getPreference('isDark')
      },
      set(value) {
        this.$store.dispatch('toggle', ['isDark', value])
      }
    },
    isPlaySounds: {
      get() {
        return this.$config.audio.new ? !this.$store.getters.getPreference('isMute') : false
      },
      set(value) {
        this.$store.dispatch('toggle', ['isMute', !value])
      }
    },
    longDate: {
      get() {
        return this.$store.state.prefs.dates.longDate
      },
      set(value) {
        this.$store.dispatch('setUserPrefs', {
          dates: {longDate: value}
        })
      }
    },
    mediumDate: {
      get() {
        return this.$store.state.prefs.dates.mediumDate
      },
      set(value) {
        this.$store.dispatch('setUserPrefs', {
          dates: {mediumDate: value}
        })
      }
    },
    shortTime: {
      get() {
        return this.$store.state.prefs.dates.shortTime
      },
      set(value) {
        this.$store.dispatch('setUserPrefs', {
          dates: {shortTime: value}
        })
      }
    },
    refreshInterval: {
      get() {
        return (
          (this.$store.getters.getPreference('refreshInterval') ||
            this.$store.getters.getConfig('refresh_interval')) / 1000
        )
      },
      set(value) {
        this.$store.dispatch('setUserPrefs', {refreshInterval: value * 1000})
      }
    },
    shelveTimeout: {
      get() {
        return this.$store.getters.getPreference('shelveTimeout') / 60 / 60
      },
      set(value) {
        this.$store.dispatch('setUserPrefs', {shelveTimeout: value * 60 * 60})
      }
    }
  },
  mounted() {
    this.$store.dispatch('getUserPrefs')
  },
  methods: {
    reset() {
      this.$store.dispatch('resetUserPrefs')
    }
  }
}
</script>

<style></style>
