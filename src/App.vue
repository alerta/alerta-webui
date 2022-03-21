<template>
  <v-app id="alerta">
    <div v-if="!isKiosk">
      <v-navigation-drawer
        v-if="isLoggedIn || !isAuthRequired || isAllowReadonly"
        v-model="drawer"
        :clipped="$vuetify.breakpoint.lgAndUp"
        disable-resize-watcher
        fixed
        app
      >
        <v-toolbar flat>
          <v-app-bar-nav-icon @click.stop="drawer = !drawer" />

          <router-link to="/" class="toolbar-title">
            <img
              v-if="$config.site_logo_url"
              :src="$config.site_logo_url"
              height="48"
            />
            <v-toolbar-title v-else class="logo">alerta</v-toolbar-title>
          </router-link>
        </v-toolbar>

        <v-divider />
        <v-list dense>
          <template v-for="(item, index) in items">
            <v-list-item
              v-if="item.icon && item.show"
              :key="item.text"
              v-has-perms="item.perms"
              :to="item.path"
            >
              <v-list-item-action>
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>
                  {{ item.text }}
                  <v-icon v-if="item.appendIcon" small>
                    {{ item.appendIcon }}
                  </v-icon>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-group
              v-else-if="item.queries && item.queries.length > 0"
              :key="item.text"
              :prepend-icon="item.model ? item.icon : item['icon-alt']"
              sub-group
              no-action
              color="neutral"
            >
              <template v-slot:activator>
                <v-list-item>
                  <v-list-item-title>
                    {{ item.text }}
                  </v-list-item-title>
                </v-list-item>
              </template>
              <v-list-item
                v-for="(q, i) in item.queries"
                :key="i"
                @click="submitSearch(q.query)"
              >
                <v-list-item-title v-text="q.text" />
                <v-list-item-action>
                  <v-icon small @click.stop="deleteSearch(q)" v-text="q.icon" />
                </v-list-item-action>
              </v-list-item>
            </v-list-group>

            <v-divider v-else-if="item.divider" :key="index" />
          </template>
        </v-list>
      </v-navigation-drawer>

      <v-toolbar
        v-if="selected.length == 0 || $route.name !== 'alerts'"
        flat
        class="mb-1"
      >
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" />

        <router-link to="/" class="toolbar-title">
          <img
            v-if="$config.site_logo_url"
            :src="$config.site_logo_url"
            height="48"
          />
          <v-toolbar-title v-else class="logo">alerta</v-toolbar-title>
        </router-link>

        <v-spacer />

        <v-text-field
          v-if="$route.name === 'alerts' || $route.name === 'incidents'"
          v-model="query"
          :flat="!hasFocus"
          :label="$t('Search')"
          prepend-inner-icon="mdi-magnify"
          solo
          clearable
          dense
          hide-details
          class="mr-3 hidden-sm-and-down"
          @focus="hasFocus = true"
          @blur="hasFocus = false"
          @change="submitSearch"
          @click:clear="clearSearch"
        >
          <template v-slot:append-outer>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on" @click="saveSearch">mdi-pin</v-icon>
              </template>
              <span>{{ $t('Save') }}</span>
            </v-tooltip>
          </template>
        </v-text-field>

        <div v-if="$route.name === 'alerts'" v-show="isLoggedIn">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <div v-on="on" class="switch-wrapper">
                <v-switch
                  :input-value="isWatch"
                  hide-details
                  open-delay="3000"
                  @change="toggle('isWatch', $event)"
                />
              </div>
            </template>
            <span>{{ $t('Watch') }}</span>
          </v-tooltip>
        </div>

        <v-spacer class="hidden-sm-and-down" />

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              v-show="isLoggedIn || !isAuthRequired || isAllowReadonly"
              v-on="on"
              icon
              @click="toggleFullScreen"
            >
              <v-icon>{{
                isFullscreen() ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'
              }}</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('FullScreen') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              v-show="isLoggedIn || !isAuthRequired || isAllowReadonly"
              v-on="on"
              icon
            >
              <v-icon @click="refresh">mdi-refresh</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('Refresh') }}</span>
        </v-tooltip>

        <v-menu
          v-show="isLoggedIn"
          v-model="menu"
          :close-on-content-click="false"
          :nudge-bottom="15"
          offset-y
          bottom
        >
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" icon>
              <v-avatar size="32px">
                <img
                  v-if="avatar && !error"
                  :src="avatar"
                  @error="error = true"
                />
                <v-icon v-else v-text="navbar.signin.icon" />
              </v-avatar>
            </v-btn>
          </template>

          <profile-me v-if="profile" :profile="profile" @close="menu = false" />
        </v-menu>

        <span class="hidden-xs-only" v-show="!isLoggedIn">
          <v-btn
            v-show="isSignupEnabled"
            rounded
            outlined
            color="primary"
            to="/signup"
          >
            {{ $t('SignUp') }}
          </v-btn>
          <v-btn rounded color="primary" to="/login">
            {{ $t('LogIn') }}
          </v-btn>
        </span>
      </v-toolbar>

      <v-toolbar
        v-if="selected.length > 0 && $route.name === 'alerts'"
        class="mb-1"
      >
        <v-btn icon @click="clearSelected">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <span class="hidden-sm-and-down">
          <v-toolbar-title>Back</v-toolbar-title>
        </span>
        <v-spacer />

        <span class="subheading">
          {{ selected.length }}&nbsp;<span class="hidden-sm-and-down">{{
            $t('selected')
          }}</span>
        </span>

        <v-spacer />

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" icon plain @click="toggleWatch()">
              <v-icon>mdi-eye</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('Watch') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" icon plain @click="bulkAckAlert()">
              <v-icon>mdi-check</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('Ack') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" icon plain @click="bulkShelveAlert()">
              <v-icon>mdi-clock-outline</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('Shelve') }}</span>
        </v-tooltip>

        <grouping :selected="selected">
          <template v-slot:activator="{ on: openModal, attrs }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  @click="openModal.click"
                  v-bind="attrs"
                  icon
                  plain
                >
                  <v-icon>mdi-group</v-icon>
                </v-btn>
              </template>
              <span>{{ $t('AddToIncident') }}</span>
            </v-tooltip>
          </template>
        </grouping>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" icon plain @click="takeBulkAction('close')">
              <v-icon>mdi-close-circle-outline</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('Close') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              v-on="on"
              v-has-perms="'admin:alerts'"
              icon
              plain
              @click="bulkDeleteAlert()"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('Delete') }}</span>
        </v-tooltip>

        <v-menu bottom left>
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" text icon small class="btn--plain px-1 mx-0">
              <v-icon small>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list subheader>
            <v-subheader>Actions</v-subheader>
            <v-divider />
            <v-list-item
              v-for="(action, i) in actions"
              :key="i"
              @click="takeBulkAction(action)"
            >
              <v-list-item-title>{{ action | splitCaps }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-spacer />

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              v-show="isLoggedIn || !isAuthRequired || isAllowReadonly"
              v-on="on"
              icon
              @click="toggleFullScreen"
            >
              <v-icon>{{
                isFullscreen() ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'
              }}</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('FullScreen') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              v-show="isLoggedIn || !isAuthRequired || isAllowReadonly"
              v-on="on"
              icon
            >
              <v-icon @click="refresh">mdi-refresh</v-icon>
            </v-btn>
          </template>
          <span>{{ $t('Refresh') }}</span>
        </v-tooltip>

        <v-menu
          v-show="isLoggedIn"
          v-model="menu"
          :close-on-content-click="false"
          :nudge-width="200"
          offset-y
          bottom
        >
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" icon>
              <v-avatar size="32px">
                <img
                  v-if="avatar && !error"
                  :src="avatar"
                  @error="error = true"
                />
                <v-icon v-else v-text="navbar.signin.icon" />
              </v-avatar>
            </v-btn>
          </template>

          <profile-me v-if="profile" :profile="profile" @close="menu = false" />
        </v-menu>

        <span class="hidden-xs-only">
          <v-btn
            v-show="!isLoggedIn && isSignupEnabled"
            rounded
            outlined
            color="primary"
            disabled
          >
            {{ $t('SignUp') }}
          </v-btn>
          <v-btn v-show="!isLoggedIn" rounded color="primary" disabled>
            {{ $t('LogIn') }}
          </v-btn>
        </span>
      </v-toolbar>
    </div>

    <v-main>
      <banner />
      <router-view />
      <snackbar />
    </v-main>

    <div v-if="!isKiosk">
      <span class="hidden-sm-and-up">
        <v-btn
          v-show="!isLoggedIn && isSignupEnabled"
          block
          rounded
          outlined
          color="primary"
          to="/signup"
          :disabled="selected.length > 0"
        >
          {{ $t('SignUp') }}
        </v-btn>
        <v-btn
          v-show="!isLoggedIn"
          block
          rounded
          color="primary"
          to="/login"
          :disabled="selected.length > 0"
        >
          {{ $t('LogIn') }}
        </v-btn>
      </span>
    </div>
  </v-app>
</template>

<script lang="ts">
import ProfileMe from '@/components/auth/ProfileMe.vue'
import Banner from '@/components/lib/Banner.vue'
import Snackbar from '@/components/lib/Snackbar.vue'
import Grouping from '@/components/Grouping.vue'
import i18n from '@/plugins/i18n'
import Vue from 'vue'
import * as Sentry from '@sentry/vue'
import { isUndefined, omitBy } from 'lodash'

export default Vue.extend({
  name: 'App',
  components: {
    Banner,
    ProfileMe,
    Snackbar,
    Grouping
  },
  props: [],
  data: () => ({
    hasFocus: false,
    menu: false,
    message: false,
    hints: true,
    dialog: false,
    drawer: false,
    navbar: {
      signin: {
        icon: 'mdi-account-circle',
        text: i18n.t('SignIn'),
        path: '/login'
      }
    },
    error: false
  }),
  computed: {
    items() {
      return [
        {
          icon: 'mdi-format-list-bulleted',
          text: i18n.t('Alerts'),
          path: '/alerts',
          perms: 'read:alerts',
          show: true
        },
        {
          icon: 'mdi-collapse-all',
          'icon-alt': 'mdi-expand-all',
          text: i18n.t('Searches'),
          model: false,
          queries: this.queries
        },
        {
          icon: 'mdi-group',
          text: i18n.t('Incidents'),
          path: '/incidents',
          perms: 'read:alerts',
          show: true
        },
        {
          icon: 'mdi-timer',
          text: i18n.t('Heartbeats'),
          path: '/heartbeats',
          perms: 'read:heartbeats',
          show: true
        },
        {
          icon: 'mdi-account',
          text: i18n.t('Users'),
          path: '/users',
          perms: 'admin:users',
          show: true
        },
        {
          icon: 'mdi-account-multiple',
          text: i18n.t('Groups'),
          path: '/groups',
          perms: 'read:groups',
          show: this.$config.provider == 'basic'
        },
        {
          icon: 'mdi-domain',
          text: i18n.t('Customers'),
          path: '/customers',
          perms: 'read:customers',
          show: this.$config.customer_views
        },
        {
          icon: 'mdi-bell-off',
          text: i18n.t('Blackouts'),
          path: '/blackouts',
          perms: 'read:blackouts',
          show: true
        },
        {
          icon: 'mdi-security',
          text: i18n.t('Permissions'),
          path: '/perms',
          perms: 'read:perms',
          show: true
        },
        {
          icon: 'mdi-key',
          text: i18n.t('APIKeys'),
          path: '/keys',
          perms: 'read:keys',
          show: this.isLoggedIn || !this.isAuthRequired
        },
        {
          icon: 'mdi-chart-box',
          text: i18n.t('Reports'),
          path: '/reports',
          perms: 'read:alerts',
          show: true
        },
        { divider: true },
        {
          icon: 'mdi-account-circle',
          text: i18n.t('Profile'),
          path: '/profile',
          perms: null,
          show: this.isLoggedIn
        },
        {
          icon: 'mdi-cog',
          text: i18n.t('Settings'),
          path: '/settings',
          perms: null,
          show: this.isLoggedIn
        },
        {
          icon: 'mdi-help-circle',
          text: i18n.t('Help'),
          path: '/help',
          appendIcon: 'mdi-open-in-new',
          perms: null,
          show: true
        },
        {
          icon: 'mdi-information',
          text: i18n.t('About'),
          path: '/about',
          perms: 'read:management',
          show: true
        }
      ]
    },
    isWatch() {
      return this.$store.state.alerts.isWatch
    },
    languagePref() {
      return this.$store.getters.getPreference('languagePref')
    },
    isKiosk() {
      return this.$store.state.alerts.isKiosk
    },
    isLoggedIn() {
      return this.$store.getters['auth/isLoggedIn']
    },
    isAuthRequired() {
      return this.$config.auth_required
    },
    isAllowReadonly() {
      return this.$config.allow_readonly
    },
    isSignupEnabled() {
      return this.$config.signup_enabled
    },
    profile() {
      return this.$store.state.auth.payload || {}
    },
    alertsOrIncidents() {
      if (this.$route.name == 'alerts') return 'alerts'
      if (this.$route.name == 'incidents') return 'incidents'
      return ''
    },
    query: {
      get() {
        return this.$store.state[this.alertsOrIncidents].query?.q || ''
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      set(value) {
        // FIXME: offer query suggestions to user here, in future
      }
    },
    queries() {
      return this.$store.getters.getUserQueries.map((query) => ({
        icon: 'mdi-minus-circle-outline',
        text: query.text,
        path: '/alerts',
        query: query.q,
        perms: 'read:alerts',
        show: true
      }))
    },
    actions() {
      return this.$config.actions
    },
    selected() {
      return this.$store.state.alerts.selected
    },
    ackTimeout() {
      return this.$store.getters.getPreference('ackTimeout')
    },
    shelveTimeout() {
      return this.$store.getters.getPreference('shelveTimeout')
    },
    username() {
      return this.$store.getters['auth/getUsername']
    },
    avatar() {
      return this.$store.getters['auth/getAvatar']
    }
  },
  watch: {
    isKiosk(val) {
      val && this.toggleFullScreen()
    },
    languagePref(val) {
      i18n.locale = val
    }
  },
  mounted() {
    if (this.isLoggedIn) {
      this.$store.dispatch('getUserPrefs')
      this.$store.dispatch('getUserQueries')

      Sentry.setUser({
        email: this.$store.state.auth.payload.email,
        username:
          this.$store.state.auth.payload.preferred_username ??
          this.$store.state.auth.payload.name
      })
    }
  },
  methods: {
    submitSearch(query: string | null) {
      if (!query) return this.clearSearch()

      this.$store.dispatch(`${this.alertsOrIncidents}/updateQuery`, {
        q: query
      })
      this.$router
        .replace({
          query: { ...this.$route.query, q: query },
          hash: this.$store.getters[`${this.alertsOrIncidents}/getHash`]
        })
        .catch(() => {})
      this.refresh()
    },
    clearSearch() {
      this.query = null
      this.$store.dispatch(`${this.alertsOrIncidents}/updateQuery`, {})
      this.$router
        .replace({
          query: omitBy({ ...this.$route.query, q: undefined }, isUndefined),
          hash: this.$store.getters[`${this.alertsOrIncidents}/getHash`]
        })
        .catch(() => {})
      this.refresh()
    },
    clearSelected() {
      this.$store.dispatch('alerts/updateSelected', [])
    },
    saveSearch() {
      if (this.query) {
        this.$store.dispatch('addUserQuery', {
          text: this.query,
          q: this.query
        })
      }
    },
    deleteSearch(query) {
      this.$store.dispatch('removeUserQuery', query)
    },
    takeBulkAction(action) {
      Promise.all(
        this.selected.map((a) =>
          this.$store.dispatch('alerts/takeAction', [a.id, action, ''])
        )
      ).then(() => {
        this.clearSelected()
        this.$store.dispatch('alerts/getAlerts')
      })
    },
    bulkAckAlert() {
      this.selected
        .map((a) => {
          this.$store.dispatch('alerts/takeAction', [
            a.id,
            'ack',
            '',
            this.ackTimeout
          ])
        })
        .reduce(() => this.clearSelected())
    },
    bulkShelveAlert() {
      Promise.all(
        this.selected.map((a) => {
          this.$store.dispatch('alerts/takeAction', [
            a.id,
            'shelve',
            '',
            this.shelveTimeout
          ])
        })
      ).then(() => {
        this.clearSelected()
        this.$store.dispatch('alerts/getAlerts')
      })
    },
    isWatched(tags) {
      const tag = `watch:${this.username}`
      return tags ? tags.indexOf(tag) > -1 : false
    },
    toggleWatch() {
      var map
      if (this.selected.some((x) => !this.isWatched(x.tags))) {
        map = this.selected.map((a) => this.watchAlert(a.id))
      } else {
        map = this.selected.map((a) => this.unwatchAlert(a.id))
      }

      Promise.all(map).then(() => {
        this.clearSelected()
        this.$store.dispatch('alerts/getAlerts')
      })
    },
    watchAlert(id) {
      this.$store.dispatch('alerts/watchAlert', id)
    },
    unwatchAlert(id) {
      this.$store.dispatch('alerts/unwatchAlert', id)
    },
    bulkDeleteAlert() {
      confirm(i18n.t('ConfirmDelete') as string) &&
        Promise.all(
          this.selected.map((a) =>
            this.$store.dispatch('alerts/deleteAlert', a.id)
          )
        ).then(() => {
          this.clearSelected()
          this.$store.dispatch('alerts/getAlerts')
        })
    },
    toggle(sw, value) {
      this.$store.dispatch('alerts/toggle', [sw, value])
    },
    toggleFullScreen() {
      this.isFullscreen()
        ? document.exitFullscreen()
        : document.getElementById('alerta')?.requestFullscreen()
    },
    isFullscreen() {
      return document.fullscreenElement
    },
    refresh() {
      this.$store.dispatch('set', ['refresh', true])
      setTimeout(() => {
        this.$store.dispatch('set', ['refresh', false])
      }, 300)
    }
  }
})
</script>

<style>
.switch-wrapper {
  width: min-content;
}

.toolbar-title {
  color: inherit;
  text-decoration: inherit;
}

.logo {
  font-family: 'Sonsie One', cursive;
  font-size: 26px;
}

.btn--plain {
  padding: 0;
  opacity: 0.6;
}
.btn--plain:before {
  background-color: transparent !important;
  transition: none !important;
}
.btn--plain:hover {
  opacity: 1;
}
</style>
