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
            {{ $t('ApplicationSettings') }}
          </div>
        </div>
      </v-card-title>
      <v-card-actions>
        <v-radio-group
          class="mt-0"
        >
          <v-checkbox
            v-model="isDark"
            :label="$t('DarkTheme')"
            hide-details
            class="my-0"
          />
          <v-checkbox
            v-model="isPlaySounds"
            :label="$t('PlayNotif')"
            hide-details
            class="my-0"
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
              {{ $t('LanguagesSettings') }}
            </div>
          </div>       
        </v-card-title>
        <v-card-actions>
          <v-layout column>
            <v-select
              v-model="isLanguages"
              :items="languages"
              :label="$t('Languages')"
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
              {{ $t('DateTimeSettings') }}
            </div>
          </div>
        </v-card-title>
        <v-card-actions>
          <v-layout column>
            <v-select
              v-model="longDate"
              :items="computedDateFormats"
              :label="$t('LongDate')"
            />

            <v-select
              v-model="mediumDate"
              :items="computedDateFormats"
              :label="$t('MediumDate')"
            />

            <v-select
              v-model="shortTime"
              :items="computedTimeFormats"
              :label="$t('ShortDate')"
            />

            <v-select
              v-model="timezone"
              :items="timezoneOptions"
              :label="$t('DisplayMode')"
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
              {{ $t('AlertSettings') }}
            </div>
          </div>
        </v-card-title>
        <v-card-actions>
          <v-layout column>
            <v-combobox
              v-model.number="rowsPerPage"
              :items="rowsPerPageItems"
              :label="$t('RowsPage')"
              type="number"
              :suffix="$t('Rows')"
            />

            <v-combobox
              v-model.number="refreshInterval"
              :items="refreshOptions"
              :label="$t('RefreshInterval')"
              type="number"
              :suffix="$t('Seconds')"
            />

            <v-combobox
              v-model.number="shelveTimeout"
              :items="shelveTimeoutOptions"
              :label="$t('ShelveTimeout')"
              type="number"
              :suffix="$t('Hours')"
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
            {{ $t('Reset') }}
          </v-btn>
        </v-card-actions>
      </v-flex>
    </v-card>
  </v-form>
</template>

<script>
import moment from 'moment'
import i18n from '@/plugins/i18n'


export default {
  data: vm => ({
    mediumDateFormats: [
      'l',
      'L',
      'll',
      'LL',
      'ddd D MMM HH:mm',
      'lll',
      'llll',
      'LLL',
      'LLLL',
    ],
    longDateFormats: [
      'ddd D MMM, YYYY HH:mm:ss.SSS Z',
      'l hh:mm:ss.SSS A',
      'YYYY-MM-DD HH:mm:ss.SSS Z',
      'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]',
    ],
    timeFormats: [
      'LT',
      'LTS',
      'hh:mm:ss.SSS A',
      'HH:mm',
      'HH:mm:ss',
      'HH:mm:ss.SSS',
      'HH:mm:ss.SSS Z',
    ],
    refreshOptions: [2, 5, 10, 30, 60],  // seconds
    shelveTimeoutOptions: [1, 2, 4, 8, 24]  // hours
  }),
  computed: {
    languages: function() {
      return [
        { text: i18n.t('English'), value: 'en' },
        { text: i18n.t('French'), value: 'fr' }
      ]
    },
    timezoneOptions: function() {
      return [
        { text: i18n.t('UseLocal'), value: 'local' },
        { text: i18n.t('UseUTC'), value: 'utc' }
      ]
    },
    isLanguages: {
      get() {
        return this.$store.getters.getPreference('languagePref')
      },
      set(value) {
        this.$store.dispatch('setUserPrefs', {languagePref: value})
      }
    },
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
    computedDateFormats() {
      moment.locale(i18n.locale)
      let allDateFormats = [...new Set([
        this.$store.getters.getConfig('dates').mediumDate,
        ...this.mediumDateFormats,
        this.$store.getters.getConfig('dates').longDate,
        ...this.longDateFormats
      ])]
      return allDateFormats.map(f => ({text: moment().format(f), value: f}))
    },
    computedTimeFormats() {
      moment.locale(i18n.locale)
      let allTimeFormats = [...new Set([
        this.$store.getters.getConfig('dates').shortTime,
        ...this.timeFormats,
      ])]
      return allTimeFormats.map(f => ({text: moment().format(f), value: f}))
    },
    longDate: {
      get() {
        return (
          (this.$store.getters.getPreference('dates').longDate ||
            this.$store.getters.getConfig('dates').longDate)
        )
      },
      set(value) {
        this.$store.dispatch('setUserPrefs', {
          dates: {longDate: value}
        })
      }
    },
    mediumDate: {
      get() {
        return (
          (this.$store.getters.getPreference('dates').mediumDate ||
            this.$store.getters.getConfig('dates').mediumDate)
        )
      },
      set(value) {
        this.$store.dispatch('setUserPrefs', {
          dates: {mediumDate: value}
        })
      }
    },
    shortTime: {
      get() {
        return (
          (this.$store.getters.getPreference('dates').shortTime ||
            this.$store.getters.getConfig('dates').shortTime)
        )
      },
      set(value) {
        this.$store.dispatch('setUserPrefs', {
          dates: {shortTime: value}
        })
      }
    },
    timezone: {
      get() {
        return this.$store.state.prefs.timezone
      },
      set(value) {
        this.$store.dispatch('setUserPrefs', {
          timezone: value
        })
      }
    },
    rowsPerPageItems() {
      return this.$store.state.alerts.pagination.rowsPerPageItems
    },
    rowsPerPage: {
      get() {
        return (this.$store.getters.getPreference('rowsPerPage') || this.$store.state.alerts.pagination.rowsPerPage)
      },
      set(value) {
        this.$store.dispatch('setUserPrefs', {rowsPerPage: value})
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
