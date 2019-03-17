<template>
  <v-container fluid>
    <v-layout>
      <v-flex xs1 />
      <v-flex xs9>
        <v-form ref="form">
          <v-card flat>
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
                />
              </v-radio-group>
            </v-card-actions>
          </v-card>

          <v-card flat>
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
                <v-flex xs3>
                  <v-select
                    v-model="longDate"
                    :items="dateFormats"
                    label="Long date format"
                  />
                </v-flex>

                <v-flex xs3>
                  <v-select
                    v-model="mediumDate"
                    :items="dateFormats"
                    label="Medium date format"
                  />
                </v-flex>

                <v-flex xs3>
                  <v-select
                    v-model="shortTime"
                    :items="timeFormats"
                    label="Short time format"
                  />
                </v-flex>
              </v-layout>
            </v-card-actions>
          </v-card>

          <v-card flat>
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
                <v-flex xs3>
                  <v-select
                    v-model="refreshInterval"
                    :items="refreshOptions"
                    label="Refresh interval"
                    type="number"
                  />
                </v-flex>

                <v-flex xs3>
                  <v-select
                    v-model="shelveTimeout"
                    :items="shelveTimeoutOptions"
                    label="Shelve timeout"
                    type="number"
                  />
                </v-flex>
              </v-layout>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-flex>
    </v-layout>
  </v-container>
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
    ],
    refreshOptions: [
      {text: '2 seconds', value: 2*1000},
      {text: '5 seconds', value: 5*1000},
      {text: '10 seconds', value: 10*1000},
      {text: '30 seconds', value: 30*1000},
      {text: '60 seconds', value: 60*1000}
    ],
    shelveTimeoutOptions: [
      {text: '2 hours', value: 2*60*60},
      {text: '4 hours', value: 4*60*60},
      {text: '8 hours', value: 8*60*60}
    ]
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
        return !this.$store.getters.getPreference('isMute')
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
          this.$store.getters.getPreference('refreshInterval') ||
          this.$store.getters.getConfig('refresh_interval')
        )
      },
      set(value) {
        this.$store.dispatch('setUserPrefs', {refreshInterval: value})
      }
    },
    shelveTimeout: {
      get() {
        return this.$store.getters.getPreference('shelveTimeout')
      },
      set(value) {
        this.$store.dispatch('setUserPrefs', {shelveTimeout: value})
      }
    }
  },
  mounted() {
    this.$store.dispatch('getUserPrefs')
  }
}
</script>

<style></style>
