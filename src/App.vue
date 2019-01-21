<template>
  <v-app id="alerta" :dark="isDark">

    <v-navigation-drawer
      v-model="drawer"
      :clipped="$vuetify.breakpoint.lgAndUp"
      fixed
      app
    >

      <v-toolbar flat>
        <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>

        <v-toolbar-title class="logo">
          alerta
        </v-toolbar-title>
      </v-toolbar>

      <v-divider></v-divider>
      <v-list dense>
        <template v-for="item in items">
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
            <v-flex xs6 class="text-xs-center">
              <a href="#!" class="body-2 black--text">EDIT</a>
            </v-flex>
          </v-layout>
          <v-list-group
            v-else-if="item.children"
            :key="item.text"
            v-model="item.model"
            :prepend-icon="item.model ? item.icon : item['icon-alt']"
            append-icon=""
          >
            <v-list-tile slot="activator">
              <v-list-tile-content>
                <v-list-tile-title>
                  {{ item.text }}
                </v-list-tile-title>
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
                <v-list-tile-title>
                  {{ child.text }}
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list-group>
          <v-list-tile v-else :key="item.text" v-has-perms="item.perms" :to="item.path">
            <v-list-tile-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>
                {{ item.text }}
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
      </v-list>
    </v-navigation-drawer>


    <v-toolbar>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>

      <v-toolbar-title class="logo">
        alerta
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <!-- 
      <v-btn icon>
        <v-icon>search</v-icon>
      </v-btn>
 -->
      <div>
        <v-tooltip left>
          <v-switch
            slot="activator"
            :input-value="isWatch"
            hide-details
            open-delay="3000"
            @change="toggle('isWatch', $event)"
          >
          </v-switch>
          <span>Watch</span>
        </v-tooltip>
      </div>

      <v-btn icon @click="toggleFullScreen">
        <v-icon>{{ isFullscreen() ? 'fullscreen_exit' : 'fullscreen' }}</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon @click="refresh">refresh</v-icon>
      </v-btn>

      <v-menu
        v-model="menu"
        :close-on-content-click="false"
        :nudge-width="200"
        offset-x
        :disabled="!isLoggedIn"
      >
        <v-btn
          slot="activator"
          :disabled="!isLoggedIn"
          icon
        >
          <v-icon>{{ navbar.signin.icon }}</v-icon>
        </v-btn>

        <profile-me
          v-if="profile"
          :profile="profile"
          @close="menu = false"
        />
      </v-menu>
    </v-toolbar>

    <v-content>
      <banner/>
      <router-view/>
      <snackbar/>
    </v-content>

  </v-app>
</template>

<script>
import Banner from '@/components/Banner.vue'
import ProfileMe from '@/components/ProfileMe.vue'
import Snackbar from '@/components/Snackbar.vue'

export default {
  name: 'App',
  components: {
    Banner,
    ProfileMe,
    Snackbar
  },
  props: [],
  data: () => ({
    menu: false,
    message: false,
    hints: true,
    dialog: false,
    drawer: null,
    navbar: {
      signin: { icon: 'account_circle', text: 'Sign In', path: '/login' }
    },
    items: [
      { icon: 'list', text: 'Alerts', path: '/alerts', perms: 'read:alerts' },
      {
        icon: 'timer',
        text: 'Heartbeats',
        path: '/heartbeats',
        perms: 'read:heartbeats'
      },
      { icon: 'people', text: 'Users', path: '/users', perms: 'read:users' },
      {
        icon: 'domain',
        text: 'Customers',
        path: '/customers',
        perms: 'read:customers'
      },
      {
        icon: 'notifications_off',
        text: 'Blackouts',
        path: '/blackouts',
        perms: 'read:blackouts'
      },
      {
        icon: 'security',
        text: 'Permissions',
        path: '/perms',
        perms: 'read:perms'
      },
      { icon: 'vpn_key', text: 'API Keys', path: '/keys', perms: 'read:keys' },
      {
        icon: 'keyboard_arrow_up',
        'icon-alt': 'keyboard_arrow_down',
        text: 'Labels',
        model: true,
        children: [{ icon: 'add', text: 'Create label' }]
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
      { icon: 'settings', text: 'Settings', path: '/settings' },
      // { icon: 'chat_bubble', text: 'Send feedback' },
      { icon: 'help', text: 'Help', path: 'https://docs.alerta.io' },
      { icon: 'info', text: 'About', path: '/about', perms: 'read:management' }
    ]
  }),
  computed: {
    isDark() {
      return this.$store.getters.getPreference('isDark')
    },
    isWatch() {
      return this.$store.state.alerts.isWatch
    },
    isLoggedIn() {
      return this.$store.getters['auth/isLoggedIn']
    },
    isCustomerViews() {
      return this.$store.getters['auth/isCustomerViews']
    },
    profile() {
      return this.$store.state.auth.payload || {}
    }
  },
  methods: {
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
@font-face {
  font-family: Sintony;
  src: url('assets/fonts/Sintony-Regular.ttf');
}

@font-face {
  font-family: Sintony;
  font-weight: bold;
  src: url('assets/fonts/Sintony-Bold.ttf');
}

@font-face {
  font-family: 'Sonsie One';
  src: url('assets/fonts/SonsieOne-Regular.ttf');
}

.logo {
  font-family: 'Sonsie One';
  font-size: 26px;
}
</style>
