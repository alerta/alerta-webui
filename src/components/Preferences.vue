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
            :label="$t('PlaySounds')"
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
              {{ $t('LanguageSettings') }}
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
              :label="$t('ShortTime')"
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
          <v-radio-group
            class="mt-0"
          >
            <v-checkbox
              v-model="showAllowedEnvs"
              :label="$t('ShowAllowedEnvs')"
              hide-details
              class="my-0"
            />
            <v-checkbox
              v-model="showNotesIcon"
              :label="$t('ShowNotesIcon')"
              :hint="$t('ShowNotesHint')"
              persistent-hint
              class="my-0"
            />
          </v-radio-group>
        </v-card-actions>
        <v-card-actions>
          <v-layout column>
            <v-select
              v-model="fontFamily"
              :items="computedFontFamilies"
              :label="$t('Font')"
            />
            <v-slider
              v-model="fontSize"
              min="10"
              max="30"
              step="1"
              always-dirty
              ticks="always"
              thumb-label
              :label="$t('FontSize')"
              :tick-labels="fontSizeLabels"
            />

            <v-slider
              v-model="fontWeight"
              min="100"
              max="900"
              step="100"
              always-dirty
              ticks="always"
              tick-size="2"
              thumb-label
              :label="$t('FontWeight')"
              :tick-labels="fontWeightLabels"
            />

            <v-combobox
              v-model.number="rowsPerPage"
              :items="rowsPerPageItems"
              :label="$t('PageRows')"
              type="number"
              :suffix="$t('rows')"
            />

            <v-combobox
              v-model.number="valueWidth"
              :items="valueWidthOptions"
              :label="$t('ValueWidth')"
              type="number"
              suffix="px"
            />

            <v-combobox
              v-model.number="textWidth"
              :items="textWidthOptions"
              :label="$t('DescriptionWidth')"
              type="number"
              suffix="px"
            />

            <v-combobox
              v-model.number="refreshInterval"
              :items="refreshOptions"
              :label="$t('RefreshInterval')"
              type="number"
              :suffix="$t('seconds')"
            />

            <v-combobox
              v-model.number="ackTimeout"
              :items="ackTimeoutOptions"
              :label="$t('AckTimeout')"
              type="number"
              :suffix="$t('minutes')"
            />

            <v-combobox
              v-model.number="shelveTimeout"
              :items="shelveTimeoutOptions"
              :label="$t('ShelveTimeout')"
              type="number"
              :suffix="$t('minutes')"
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
              {{ $t('BlackoutSettings') }}
            </div>
          </div>
        </v-card-title>
        <v-card-actions>
          <v-radio-group
            class="mt-0"
          >
            <v-checkbox
              v-model="blackoutStartNow"
              :label="$t('BlackoutStartNow')"
              hide-details
              class="my-0"
            />
          </v-radio-group>
        </v-card-actions>
        <v-card-actions>
          <v-layout column>
            <v-combobox
              v-model.number="blackoutPeriod"
              :items="blackoutPeriodOptions"
              :label="$t('BlackoutPeriod')"
              type="number"
              :suffix="$t('hours')"
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
import debounce from 'lodash/debounce'

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
    webSafeFontFamilies: [
      {text: 'Sintony', value: '"Sintony", Arial, sans-serif'},
      {text: 'Helvetica', value: '"Helvetica", Arial, sans-serif'},
      {text: 'Verdana', value: '"Verdana", Arial, sans-serif'},
      {text: 'Courier New', value: '"Courier New", Courier, monospace'},
      {text: 'Consolas', value: '"Consolas", Courier, monospace'},
      {text: 'Lucida Console', value: '"Lucida Console", Monaco, monospace'},
      {text: 'Andale Mono', value: '"Andale Mono", Courier, monospace'}
    ],
    fontSizeLabels: ['tiny', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'huge'],
    fontWeightLabels: [ 'thin', '', '', 'normal', '', '', 'bold', '', 'heavy'],
    valueWidthOptions: [50, 100, 150, 200],  // px
    textWidthOptions: [200, 400, 600, 800],  // px
    refreshOptions: [2, 5, 10, 30, 60],  // seconds
    ackTimeoutOptions: [0, 60, 120, 240, 480, 1440],  // minutes
    shelveTimeoutOptions: [60, 120, 240, 480, 1440],  // minutes
    blackoutPeriodOptions: [1, 2, 8, 24, 48],  // hours
  }),
  computed: {
    languages() {
      return [
        { text: i18n.t('English'), value: 'en' },
        { text: i18n.t('French'), value: 'fr' },
        { text: i18n.t('German'), value: 'de' },
        { text: i18n.t('Turkish'), value: 'tr' },
        { text: i18n.t('Russian'), value: 'ru' }
      ]
    },
    timezoneOptions() {
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
    showAllowedEnvs: {
      get() {
        return this.$store.getters.getPreference('showAllowedEnvs')
      },
      set(value) {
        this.$store.dispatch('toggle', ['showAllowedEnvs', value])
      }
    },
    showNotesIcon: {
      get() {
        return this.$store.getters.getPreference('showNotesIcon')
      },
      set(value) {
        this.$store.dispatch('toggle', ['showNotesIcon', value])
      }
    },
    computedFontFamilies() {
      const defaultFontFamily = this.$store.getters.getConfig('font')['font-family']
      return [
        {text: defaultFontFamily.split(',')[0].replace(/"/g, ''), value: defaultFontFamily},
        ...this.webSafeFontFamilies
      ]
    },
    fontFamily: {
      get() {
        return (
          (this.$store.getters.getPreference('font')['font-family'] ||
            this.$store.getters.getConfig('font')['font-family'])
        )
      },
      set (value) {
        this.$store.dispatch('setUserPrefs', {
          font: {'font-family': value}
        })
      }
    },
    fontSize: {
      get() {
        return (
          (this.$store.getters.getPreference('font')['font-size'] ||
            this.$store.getters.getConfig('font')['font-size']).replace('px', '')
        )
      },
      set: debounce(function (value) {
        this.$store.dispatch('setUserPrefs', {
          font: {'font-size': value + 'px'}
        })
      }, 2000)
    },
    fontWeight: {
      get() {
        return (
          (this.$store.getters.getPreference('font')['font-weight'] ||
            this.$store.getters.getConfig('font')['font-weight'])
        )
      },
      set: debounce(function (value) {
        this.$store.dispatch('setUserPrefs', {
          font: {'font-weight': value}
        })
      }, 2000)
    },
    rowsPerPageItems() {
      return this.$store.state.alerts.pagination.rowsPerPageItems
    },
    rowsPerPage: {
      get() {
        return (
          (this.$store.getters.getPreference('rowsPerPage') ||
            this.$store.state.alerts.pagination.rowsPerPage))
      },
      set(value) {
        this.$store.dispatch('setUserPrefs', {rowsPerPage: value})
      }
    },
    valueWidth: {
      get() {
        return (
          (this.$store.getters.getPreference('valueWidth') ||
            this.$store.getters.getConfig('value_Width')))
      },
      set(value) {
        this.$store.dispatch('setUserPrefs', {
          valueWidth: value
        })
      }
    },
    textWidth: {
      get() {
        return (
          (this.$store.getters.getPreference('textWidth') ||
            this.$store.getters.getConfig('text_Width')))
      },
      set(value) {
        this.$store.dispatch('setUserPrefs', {
          textWidth: value
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
    ackTimeout: {
      get() {
        return (
          (this.$store.getters.getPreference('ackTimeout') ||
            this.$store.getters.getConfig('timeouts').ack) / 60
        )
      },
      set(value) {
        this.$store.dispatch('setUserPrefs', {ackTimeout: value * 60})
      }
    },
    shelveTimeout: {
      get() {
        return (
          (this.$store.getters.getPreference('shelveTimeout') ||
            this.$store.getters.getConfig('timeouts').shelve) / 60
        )
      },
      set(value) {
        this.$store.dispatch('setUserPrefs', {shelveTimeout: value * 60})
      }
    },
    blackoutStartNow: {
      get() {
        return this.$store.getters.getPreference('blackoutStartNow')
      },
      set(value) {
        this.$store.dispatch('toggle', ['blackoutStartNow', value])
      }
    },
    blackoutPeriod: {
      get() {
        return (
          (this.$store.getters.getPreference('blackoutPeriod') ||
            this.$store.getters.getConfig('blackouts').duration) / 60 / 60
        )
      },
      set(value) {
        this.$store.dispatch('setUserPrefs', {blackoutPeriod: value * 60 * 60})
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
