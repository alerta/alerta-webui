<template>
  <v-container
    grid-list-sm
    fill-height
  >
    <v-layout
      align-center
      row
      wrap
    >
      <v-flex
        v-show="!isBasicAuth"
        xs12
        sm8
        offset-xs0
        offset-sm2
      >
        <p
          v-if="authProvider"
          class="headline text-xs-center font-weight-medium"
        >
          Authenticating with {{ authProvider }} ...
        </p>
        <p
          v-else
          class="headline text-xs-center font-weight-medium"
        >
          Unknown authentication provider ({{ $config.provider || 'none' }}).
        </p>
      </v-flex>
      <v-flex
        v-show="isBasicAuth"
        xs12
        sm6
        offset-xs0
        offset-sm3
      >
        <p class="text-xs-center headline font-weight-medium">
          Log in to Alerta to continue
        </p>
        <v-form @submit.prevent="login()">
          <v-text-field
            v-model="username"
            name="login"
            type="text"
            label="Username"
            prepend-inner-icon="alternate_email"
            outline
          />
          <v-text-field
            v-model="password"
            name="password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            :append-icon="showPassword ? 'visibility_off' : 'visibility'"
            outline
            @click:append="showPassword = !showPassword"
          />
          <v-btn
            block
            color="primary"
            type="submit"
          >
            Log In
          </v-btn>
        </v-form>
        <div class="text-xs-center">
          <v-btn
            flat
            color="primary"
            to="/signup"
            :disabled="!signupEnabled"
          >
            Create Account
          </v-btn>
          <v-btn
            flat
            color="primary"
            to="/forgot"
          >
            Forgot Password?
          </v-btn>
        </div>
      </v-flex>
      <v-flex
        xs12
        sm6
        offset-xs0
        offset-sm3
      />
    </v-layout>
  </v-container>
</template>

<script>
import { router } from '@/main'

export default {
  props: [],
  data: () => ({
    username: null,
    password: null,
    showPassword: false
  }),
  computed: {
    isBasicAuth() {
      return this.$config.provider == 'basic'
    },
    authProvider() {
      let providers = this.$store.getters['auth/getOptions']['providers']
      return providers[this.$config.provider] ? providers[this.$config.provider].name : null
    },
    signupEnabled() {
      return this.$store.getters.getConfig('signup_enabled')
    }
  },
  created() {
    if (this.authProvider) {
      this.authenticate()
    }
  },
  methods: {
    login() {
      let credentials = {
        username: this.username,
        password: this.password
      }
      this.$store
        .dispatch('auth/login', credentials)
        .then(() => this.$router.push(this.$route.query.redirect || '/alerts'))
    },
    authenticate() {
      this.$store
        .dispatch('auth/authenticate', this.$config.provider)
        .then(() => this.$router.push(this.$route.query.redirect || '/alerts'))
    }
  }
}
</script>

<style></style>
