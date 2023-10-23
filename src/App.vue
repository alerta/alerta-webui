<template>
  <v-app
    id="alerta"
    :dark="isDark"
  >
    <div v-if="!isKiosk">
      <v-navigation-drawer
        v-if="isLoggedIn || !isAuthRequired || isAllowReadonly"
        v-model="drawer"
        :clipped="$vuetify.breakpoint.lgAndUp"
        disable-resize-watcher
        fixed
        app
      >
        <v-toolbar
          :color="isDark ? '#616161' : '#eeeeee'"
          flat
        >
          <v-toolbar-side-icon @click.stop="drawer = !drawer" />

          <router-link
            to="/"
            class="toolbar-title"
          >
            <img
              v-if="$config.site_logo_url"
              :src="$config.site_logo_url"
              height="48"
            >
            <v-toolbar-title
              v-else
              class="logo"
            >
              alerta
            </v-toolbar-title>
          </router-link>
        </v-toolbar>

        <v-divider />
        <v-list dense>
          <template v-for="(item, index) in items">
            <v-list-tile
              v-if="item.icon && item.show"
              :key="item.text"
              v-has-perms="item.perms"
              :to="item.path"
            >
              <v-list-tile-action>
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>
                  {{ item.text }}
                  <v-icon
                    v-if="item.appendIcon"
                    small
                  >
                    {{ item.appendIcon }}
                  </v-icon>
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>

            <v-list-group
              v-else-if="item.queries && item.queries.length > 0"
              :key="item.text"
              :prepend-icon="item.model ? item.icon : item['icon-alt']"
              sub-group
              no-action
            >
              <template v-slot:activator>
                <v-list-tile>
                  <v-list-tile-title>
                    {{ item.text }}
                  </v-list-tile-title>
                </v-list-tile>
              </template>
              <v-list-tile
                v-for="(q, i) in item.queries"
                :key="i"
                @click="submitSearch(q.query)"
              >
                <v-list-tile-title v-text="q.text" />
                <v-list-tile-action>
                  <v-icon
                    small
                    @click.stop="deleteSearch(q)"
                    v-text="q.icon"
                  />
                </v-list-tile-action>
              </v-list-tile>
            </v-list-group>

            <v-divider
              v-else-if="item.divider"
              :key="index"
            />
          </template>
        </v-list>
      </v-navigation-drawer>

      <v-toolbar
        v-if="selected.length == 0"
        :color="isDark ? '#616161' : '#eeeeee'"
        flat
        class="mb-1"
      >
        <v-toolbar-side-icon
          @click.stop="drawer = !drawer"
        />

        <router-link
          to="/"
          class="toolbar-title"
        >
          <img
            v-if="$config.site_logo_url"
            :src="$config.site_logo_url"
            height="48"
          >
          <v-toolbar-title
            v-else
            class="logo"
          >
            alerta
          </v-toolbar-title>
        </router-link>

        <v-spacer />

        <v-text-field
          v-if="$route.name === 'alerts'"
          v-model="query"
          :flat="!hasFocus"
          :label="$t('Search')"
          prepend-inner-icon="search"
          solo
          clearable
          height="44"
          class="pt-2 mr-3 hidden-sm-and-down"
          @focus="hasFocus = true"
          @blur="hasFocus = false"
          @change="submitSearch"
          @click:clear="clearSearch"
        >
          <template v-slot:append-outer>
            <v-tooltip
              bottom
            >
              <template v-slot:activator="{ on }">
                <v-icon
                  v-on="on"
                  @click="saveSearch"
                >
                  push_pin
                </v-icon>
              </template>
              <span>{{ $t('Save') }}</span>
            </v-tooltip>
          </template>
        </v-text-field>

        <div
          v-if="$route.name === 'alerts'"
          v-show="isLoggedIn"
        >
          <v-tooltip bottom>
            <v-switch
              slot="activator"
              :input-value="isWatch"
              hide-details
              open-delay="3000"
              @change="toggle('isWatch', $event)"
            />
            <span>{{ $t('Watch') }}</span>
          </v-tooltip>
        </div>

        <v-spacer class="hidden-sm-and-down" />

        <v-tooltip bottom>
          <v-btn
            v-show="isLoggedIn || !isAuthRequired || isAllowReadonly"
            slot="activator"
            icon
            @click="toggleFullScreen"
          >
            <v-icon>{{ isFullscreen() ? 'fullscreen_exit' : 'fullscreen' }}</v-icon>
          </v-btn>
          <span>{{ $t('FullScreen') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            v-show="isLoggedIn || !isAuthRequired || isAllowReadonly"
            slot="activator"
            icon
          >
            <v-icon @click="refresh">
              refresh
            </v-icon>
          </v-btn>
          <span>{{ $t('Refresh') }}</span>
        </v-tooltip>

        <v-menu
          v-show="isLoggedIn"
          v-model="menu"
          :close-on-content-click="false"
          :nudge-width="200"
          offset-x
        >
          <v-btn
            slot="activator"
            icon
          >
            <v-avatar
              size="32px"
            >
              <img
                v-if="avatar && !error"
                :src="avatar"
                @error="error = true"
              >
              <v-icon
                v-else
                v-text="navbar.signin.icon"
              />
            </v-avatar>
          </v-btn>

          <profile-me
            v-if="profile"
            :profile="profile"
            @close="menu = false"
          />
        </v-menu>

        <span class="hidden-xs-only">
          <v-btn
            v-show="!isLoggedIn && isSignupEnabled"
            round
            outline
            color="primary"
            to="/signup"
          >
            {{ $t('SignUp') }}
          </v-btn>
          <v-btn
            v-show="!isLoggedIn"
            round
            color="primary"
            to="/login"
          >
            {{ $t('LogIn') }}
          </v-btn>
        </span>
      </v-toolbar>

      <v-toolbar
        v-if="selected.length > 0"
        :color="isDark ? '#8e8e8e' : '#bcbcbc'"
        class="mb-1"
      >
        <v-btn
          icon
          @click="clearSelected"
        >
          <v-icon>arrow_back</v-icon>
        </v-btn>
        <span class="hidden-sm-and-down">
          <v-toolbar-title>
            Back
          </v-toolbar-title>
        </span>
        <v-spacer />

        <span class="subheading">
          {{ selected.length }}<span class="hidden-sm-and-down"> {{ $t('selected') }}</span>
        </span>

        <v-spacer />

        <v-tooltip bottom>
          <v-btn
            slot="activator"
            icon
            class="btn--plain"
            @click="toggleWatch()"
          >
            <v-icon>
              visibility
            </v-icon>
          </v-btn>
          <span>{{ $t('Watch') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            slot="activator"
            icon
            class="btn--plain"
            @click="bulkAckAlert()"
          >
            <v-icon>
              check
            </v-icon>
          </v-btn>
          <span>{{ $t('Ack') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            slot="activator"
            icon
            class="btn--plain"
            @click="bulkShelveAlert()"
          >
            <v-icon>
              schedule
            </v-icon>
          </v-btn>
          <span>{{ $t('Shelve') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            slot="activator"
            icon
            class="btn--plain"
            @click="takeBulkAction('close')"
          >
            <v-icon>
              highlight_off
            </v-icon>
          </v-btn>
          <span>{{ $t('Close') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            slot="activator"
            icon
            class="btn--plain"
            @click="bulkDeleteAlert()"
          >
            <v-icon>
              delete
            </v-icon>
          </v-btn>
          <span>{{ $t('Delete') }}</span>
        </v-tooltip>

        <v-menu
          bottom
          left
        >
          <v-btn
            slot="activator"
            flat
            icon
            small
            class="btn--plain px-1 mx-0"
          >
            <v-icon small>
              more_vert
            </v-icon>
          </v-btn>

          <v-list
            subheader
          >
            <v-subheader>Actions</v-subheader>
            <v-divider />
            <v-list-tile
              v-for="(action, i) in actions"
              :key="i"
              @click="takeBulkAction(action)"
            >
              <v-list-tile-title>{{ action | splitCaps }}</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>

        <v-spacer />

        <v-tooltip bottom>
          <v-btn
            v-show="isLoggedIn || !isAuthRequired || isAllowReadonly"
            slot="activator"
            icon
            @click="toggleFullScreen"
          >
            <v-icon>{{ isFullscreen() ? 'fullscreen_exit' : 'fullscreen' }}</v-icon>
          </v-btn>
          <span>{{ $t('FullScreen') }}</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            v-show="isLoggedIn || !isAuthRequired || isAllowReadonly"
            slot="activator"
            icon
          >
            <v-icon @click="refresh">
              refresh
            </v-icon>
          </v-btn>
          <span>{{ $t('Refresh') }}</span>
        </v-tooltip>

        <v-menu
          v-show="isLoggedIn"
          v-model="menu"
          :close-on-content-click="false"
          :nudge-width="200"
          offset-x
        >
          <v-btn
            slot="activator"
            icon
          >
            <v-avatar
              size="32px"
            >
              <img
                v-if="avatar && !error"
                :src="avatar"
                @error="error = true"
              >
              <v-icon
                v-else
                v-text="navbar.signin.icon"
              />
            </v-avatar>
          </v-btn>

          <profile-me
            v-if="profile"
            :profile="profile"
            @close="menu = false"
          />
        </v-menu>

        <span class="hidden-xs-only">
          <v-btn
            v-show="!isLoggedIn && isSignupEnabled"
            round
            outline
            color="primary"
            disabled
          >
            {{ $t('SignUp') }}
          </v-btn>
          <v-btn
            v-show="!isLoggedIn"
            round
            color="primary"
            disabled
          >
            {{ $t('LogIn') }}
          </v-btn>
        </span>
      </v-toolbar>
    </div>

    <v-content>
      <banner />
      <router-view />
      <snackbar />
    </v-content>

    <div v-if="!isKiosk">
      <span class="hidden-sm-and-up">
        <v-btn
          v-show="!isLoggedIn && isSignupEnabled"
          block
          round
          outline
          color="primary"
          to="/signup"
          :disabled="selected.length > 0"
        >
          {{ $t('SignUp') }}
        </v-btn>
        <v-btn
          v-show="!isLoggedIn"
          block
          round
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

<script>
import Banner from '@/components/lib/Banner.vue'
import ProfileMe from '@/components/auth/ProfileMe.vue'
import Snackbar from '@/components/lib/Snackbar.vue'

import i18n from '@/plugins/i18n'

export default {
  name: 'App',
  components: {
    Banner,
    ProfileMe,
    Snackbar
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
      signin: { icon: 'account_circle', text: i18n.t('SignIn'), path: '/login' }
    },
    error: false
  }),
  computed: {
    items() {
      return [
        {
          icon: 'list',
          text: i18n.t('Alerts'),
          path: '/alerts',
          perms: 'read:alerts',
          show: true
        },
        {
          icon: 'arrow_upward',
          text: i18n.t('EscalationRules'),
          path: '/escalationrules',
          perms: 'read:escalation_rules',
          show: true
        },
        {
          icon: 'expand_less',
          'icon-alt': 'expand_more',
          text: i18n.t('Searches'),
          model: false,
          queries: this.queries
        },
        {
          icon: 'timer',
          text: i18n.t('Heartbeats'),
          path: '/heartbeats',
          perms: 'read:heartbeats',
          show: true
        },
        {
          icon: 'person',
          text: i18n.t('Users'),
          path: '/users',
          perms: 'admin:users',
          show: true
        },
        {
          icon: 'people',
          text: i18n.t('Groups'),
          path: '/groups',
          perms: 'read:groups',
          show: this.$config.provider == 'basic'
        },
        {
          icon: 'domain',
          text: i18n.t('Customers'),
          path: '/customers',
          perms: 'read:customers',
          show: this.$config.customer_views
        },
        {
          icon: 'notifications_off',
          text: i18n.t('Blackouts'),
          path: '/blackouts',
          perms: 'read:blackouts',
          show: true
        },
        {
          icon: 'notifications',
          text: i18n.t('NotificationChannels'),
          path: '/notificationchannels',
          perms: 'read:notification_channels',
          show: true
        },
        {
          icon: 'notifications',
          text: i18n.t('NotificationRules'),
          path: '/notificationrules',
          perms: 'read:notification_rules',
          show: true
        },
        {
          icon: 'notifications',
          text: i18n.t('OnCall'),
          path: '/oncall',
          perms: 'read:notification_rules',
          show: true
        },
        {
          icon: 'security',
          text: i18n.t('Permissions'),
          path: '/perms',
          perms: 'read:perms',
          show: true
        },
        {
          icon: 'vpn_key',
          text: i18n.t('APIKeys'),
          path: '/keys',
          perms: 'read:keys',
          show: this.isLoggedIn || !this.isAuthRequired
        },
        {
          icon: 'assessment',
          text: i18n.t('Reports'),
          path: '/reports',
          perms: 'read:alerts',
          show: true
        },
        { divider: true},
        {
          icon: 'account_circle',
          text: i18n.t('Profile'),
          path: '/profile',
          perms: null,
          show: this.isLoggedIn
        },
        {
          icon: 'settings',
          text: i18n.t('Settings'),
          path: '/settings',
          perms: null,
          show: this.isLoggedIn
        },
        // { icon: 'chat_bubble', text: 'Send feedback' },
        {
          icon: 'help',
          text: i18n.t('Help'),
          path: '/help',
          appendIcon: 'open_in_new',
          perms: null,
          show: true
        },
        {
          icon: 'info',
          text: i18n.t('About'),
          path: '/about',
          perms: 'read:management',
          show: true
        }
      ]
    },
    isDark() {
      return this.$store.getters.getPreference('isDark')
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
    query: {
      get() {
        return this.$store.state.alerts.query
          ? this.$store.state.alerts.query.q
          : null
      },
      set(value) {
        // FIXME: offer query suggestions to user here, in future
      }
    },
    queries() {
      return this.$store.getters.getUserQueries.map(query => (
        {
          icon: 'remove_circle_outline',
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
      if (val) {
        this.toggleFullScreen()
      }
    },
    languagePref(val) {
      i18n.locale = val
    }
  },
  mounted() {
    if (this.isLoggedIn) {
      this.$store.dispatch('getUserPrefs')
      this.$store.dispatch('getUserQueries')
    }
  },
  methods: {
    submitSearch(query) {
      this.$store.dispatch('alerts/updateQuery', { q: query })
      this.$router.push({
        query: { ...this.$router.query, q: query },
        hash: this.$store.getters['alerts/getHash']
      })
      this.refresh()
    },
    clearSearch() {
      this.query = null
      this.$store.dispatch('alerts/updateQuery', {})
      this.$router.push({
        query: { ...this.$router.query, q: undefined },
        hash: this.$store.getters['alerts/getHash']
      })
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
      Promise.all(this.selected.map(a => this.$store.dispatch('alerts/takeAction', [a.id, action, '']))).then(() => {
        this.clearSelected()
        this.$store.dispatch('alerts/getAlerts')
      })
    },
    bulkAckAlert() {
      this.selected.map(a => {
        this.$store
          .dispatch('alerts/takeAction', [
            a.id,
            'ack',
            '',
            this.ackTimeout
          ])
      })
        .reduce(() => this.clearSelected())
    },
    bulkShelveAlert() {
      Promise.all(this.selected.map(a => {
        this.$store
          .dispatch('alerts/takeAction', [
            a.id,
            'shelve',
            '',
            this.shelveTimeout
          ])
      })).then(() => {
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
      if (this.selected.some(x => !this.isWatched(x.tags))) {
        map = this.selected.map(a => this.watchAlert(a.id))
      } else {
        map = this.selected.map(a => this.unwatchAlert(a.id))
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
      confirm(i18n.t('ConfirmDelete')) &&
        Promise.all(this.selected.map(a => this.$store.dispatch('alerts/deleteAlert', a.id, false))).then(() => {
          this.clearSelected()
          this.$store.dispatch('alerts/getAlerts')
        })
    },
    toggle(sw, value) {
      this.$store.dispatch('alerts/toggle', [sw, value])
    },
    toggleFullScreen() {
      let elem = document.getElementById('alerta')
      if (!this.isFullscreen()) {
        elem.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
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
}
</script>

<style>

@import "./assets/css/fonts.css";

.toolbar-title {
  color: inherit;
  text-decoration: inherit;
}

.logo {
  font-family: "Sonsie One", cursive;
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
