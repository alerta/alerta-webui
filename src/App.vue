<template>
  <v-app
    id="alerta"
    :dark="isDark"
  >
    <div v-if="!isKiosk">
      <v-navigation-drawer
        v-if="isLoggedIn || !isAuthRequired"
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
            <v-layout
              v-if="item.heading"
              :key="item.heading"
              row
              align-center
            >
              <v-flex xs6>
                <v-subheader v-if="item.heading">
                  {{ item.heading }}
                </v-subheader>
              </v-flex>
              <v-flex
                xs6
                class="text-xs-center"
              >
                <a
                  href="#!"
                  class="body-2 black--text"
                >
                  EDIT
                </a>
              </v-flex>
            </v-layout>
            <v-list-group
              v-else-if="item.children"
              :key="item.text"
              v-model="item.model"
              :prepend-icon="item.model ? item.icon : item['icon-alt']"
              append-icon
            >
              <v-list-tile slot="activator">
                <v-list-tile-content>
                  <v-list-tile-title>{{ item.text }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile
                v-for="(child, i) in item.children"
                :key="i"
              >
                <v-list-tile-action v-if="child.icon">
                  <v-icon>{{ child.icon }}</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title>{{ child.text }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list-group>
            <v-list-tile
              v-else-if="item.icon && item.show"
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
          label="Search"
          prepend-inner-icon="search"
          solo
          clearable
          height="44"
          class="pt-2 mr-3 hidden-sm-and-down"
          @focus="hasFocus = true"
          @blur="hasFocus = false"
          @change="submitSearch"
          @click:clear="clearSearch"
        />

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
            <span>Watch</span>
          </v-tooltip>
        </div>

        <v-spacer class="hidden-sm-and-down" />

        <v-tooltip bottom>
          <v-btn
            v-show="isLoggedIn || !isAuthRequired"
            slot="activator"
            icon
            @click="toggleFullScreen"
          >
            <v-icon>{{ isFullscreen() ? 'fullscreen_exit' : 'fullscreen' }}</v-icon>
          </v-btn>
          <span>Full screen</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            v-show="isLoggedIn || !isAuthRequired"
            slot="activator"
            icon
          >
            <v-icon @click="refresh">
              refresh
            </v-icon>
          </v-btn>
          <span>Refresh</span>
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

        <v-btn
          v-show="!isLoggedIn && isSignupEnabled"
          round
          outline
          color="primary"
          to="/signup"
        >
          Sign Up
        </v-btn>
        <v-btn
          v-show="!isLoggedIn"
          round
          color="primary"
          to="/login"
        >
          Log In
        </v-btn>
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
        <v-toolbar-title>
          Back
        </v-toolbar-title>

        <v-spacer />

        <span class="subheading">
          {{ selected.length }}<span class="hidden-xs-only"> selected</span>
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
          <span>Watch</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            slot="activator"
            icon
            class="btn--plain"
            @click="takeBulkAction('ack')"
          >
            <v-icon>
              check
            </v-icon>
          </v-btn>
          <span>Ack</span>
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
          <span>Shelve</span>
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
          <span>Close</span>
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
          <span>Delete</span>
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
            v-show="isLoggedIn || !isAuthRequired"
            slot="activator"
            icon
            @click="toggleFullScreen"
          >
            <v-icon>{{ isFullscreen() ? 'fullscreen_exit' : 'fullscreen' }}</v-icon>
          </v-btn>
          <span>Full screen</span>
        </v-tooltip>

        <v-tooltip bottom>
          <v-btn
            v-show="isLoggedIn || !isAuthRequired"
            slot="activator"
            icon
          >
            <v-icon @click="refresh">
              refresh
            </v-icon>
          </v-btn>
          <span>Refresh</span>
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

        <v-btn
          v-show="!isLoggedIn && isSignupEnabled"
          round
          outline
          color="primary"
          disabled
        >
          Sign Up
        </v-btn>
        <v-btn
          v-show="!isLoggedIn"
          round
          color="primary"
          disabled
        >
          Log In
        </v-btn>
      </v-toolbar>
    </div>

    <v-content>
      <banner />
      <router-view />
      <snackbar />
    </v-content>
  </v-app>
</template>

<script>
import Banner from '@/components/lib/Banner.vue'
import ProfileMe from '@/components/ProfileMe.vue'
import Snackbar from '@/components/lib/Snackbar.vue'

export default {
  name: 'App',
  components: {
    Banner,
    ProfileMe,
    Snackbar
  },
  props: [],
  data: vm => ({
    hasFocus: false,
    menu: false,
    message: false,
    hints: true,
    dialog: false,
    drawer: false,
    navbar: {
      signin: { icon: 'account_circle', text: 'Sign In', path: '/login' }
    },
    error: false
  }),
  computed: {
    items() {
      return [
        {
          icon: 'list',
          text: 'Alerts',
          path: '/alerts',
          perms: 'read:alerts',
          show: true
        },
        {
          icon: 'timer',
          text: 'Heartbeats',
          path: '/heartbeats',
          perms: 'read:heartbeats',
          show: true
        },
        {
          icon: 'person',
          text: 'Users',
          path: '/users',
          perms: 'admin:users',
          show: true
        },
        {
          icon: 'people',
          text: 'Groups',
          path: '/groups',
          perms: 'read:groups',
          show: this.$config.provider == 'basic'
        },
        {
          icon: 'domain',
          text: 'Customers',
          path: '/customers',
          perms: 'read:customers',
          show: this.$config.customer_views
        },
        {
          icon: 'notifications_off',
          text: 'Blackouts',
          path: '/blackouts',
          perms: 'read:blackouts',
          show: true
        },
        {
          icon: 'security',
          text: 'Permissions',
          path: '/perms',
          perms: 'read:perms',
          show: true
        },
        {
          icon: 'vpn_key',
          text: 'API Keys',
          path: '/keys',
          perms: 'read:keys',
          show: true
        },
        // {
        //   icon: 'keyboard_arrow_up',
        //   'icon-alt': 'keyboard_arrow_down',
        //   text: 'Labels',
        //   model: true,
        //   children: [{ icon: 'add', text: 'Create label' }]
        // },
        {
          icon: 'assessment',
          text: 'Reports',
          path: '/reports',
          perms: 'read:alerts',
          show: true
        },
        // {
        //   icon: 'keyboard_arrow_up',
        //   'icon-alt': 'keyboard_arrow_down',
        //   text: 'More',
        //   model: false,
        //   children: [
        //     { text: 'Import' },
        //     { text: 'Export' },
        //     { text: 'Print' },
        //     { text: 'Undo changes' },
        //     { text: 'Other contacts' }
        //   ]
        // },
        { divider: true},
        {
          icon: 'settings',
          text: 'Settings',
          path: '/settings',
          perms: null,
          show: this.isLoggedIn
        },
        // { icon: 'chat_bubble', text: 'Send feedback' },
        {
          icon: 'help',
          text: 'Help',
          path: '/help',
          appendIcon: 'open_in_new',
          perms: null,
          show: true
        },
        {
          icon: 'info',
          text: 'About',
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
    isKiosk() {
      return this.$store.state.alerts.isKiosk
    },
    isLoggedIn() {
      return this.$store.getters['auth/isLoggedIn']
    },
    isAuthRequired() {
      return this.$config.auth_required
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
    actions() {
      return this.$config.actions
    },
    selected() {
      return this.$store.state.alerts.selected
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
    }
  },
  mounted() {
    if (this.isLoggedIn) {
      this.$store.dispatch('getUserPrefs')
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
      this.$store.dispatch('alerts/updateQuery', null)
      this.$router.push({
        query: { ...this.$router.query, q: undefined },
        hash: this.$store.getters['alerts/getHash']
      })
      this.refresh()
    },
    clearSelected() {
      this.$store.dispatch('alerts/updateSelected', [])
    },
    takeBulkAction(action) {
      this.selected.map(a => this.$store.dispatch('alerts/takeAction', [a.id, action, 'operator bulk action']))
        .reduce(() => this.clearSelected())
    },
    bulkShelveAlert() {
      this.selected.map(a => {
        this.$store
          .dispatch('alerts/takeAction', [
            a.id,
            'shelve',
            'operator shelve short-cut',
            this.shelveTimeout
          ])
      })
        .reduce(() => this.clearSelected())
    },
    isWatched(tags) {
      const tag = `watch:${this.username}`
      return tags ? tags.indexOf(tag) > -1 : false
    },
    toggleWatch() {
      if (this.selected.some(x => !this.isWatched(x.tags))) {
        this.selected.map(a => this.watchAlert(a.id))
          .reduce(() => this.clearSelected())
      } else {
        this.selected.map(a => this.unwatchAlert(a.id))
          .reduce(() => this.clearSelected())
      }
    },
    watchAlert(id) {
      this.$store.dispatch('alerts/watchAlert', id)
    },
    unwatchAlert(id) {
      this.$store.dispatch('alerts/unwatchAlert', id)
    },
    bulkDeleteAlert() {
      confirm('Are you sure you want to delete these items?') &&
        this.selected.map(a => this.$store.dispatch('alerts/deleteAlert', a.id))
          .reduce(() => this.clearSelected())
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
