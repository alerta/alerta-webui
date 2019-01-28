<template>
  <v-container grid-list-sm fill-height>
    <v-layout align-center row wrap>
      <v-flex xs12 sm8 offset-xs0 offset-sm2>
        <p class="text-xs-center headline font-weight-medium">
          Please login to continue
        </p>
        <v-form @submit.prevent="login()">
          <v-text-field
            v-model="username"
            name="login"
            type="text"
            label="Username"
            prepend-inner-icon="alternate_email"
            outline
          >
          </v-text-field>
          <v-text-field
            v-model="password"
            name="password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            :append-icon="showPassword ? 'visibility_off' : 'visibility'"
            outline
            @click:append="showPassword = !showPassword"
          >
          </v-text-field>
          <v-btn block color="primary" type="submit">Sign In</v-btn>
        </v-form>
        <div class="text-xs-center">
          <v-btn flat color="primary" to="/signup" :disabled="!signupEnabled"
          >Create Account</v-btn
          >
          <v-btn flat color="primary" to="/forgot">Forgot Password?</v-btn>
        </div>
      </v-flex>
      <v-flex xs12 sm8 offset-xs0 offset-sm2> </v-flex>
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
      return this.$config.provider.startsWith('basic')
    },
    signupEnabled() {
      return this.$store.getters.getConfig('signup_enabled')
    }
  },
  created: function() {
    if (!this.isBasicAuth) {
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
        .dispatch('auth/login', { credentials: credentials })
        .then(() => this.$router.push(this.$route.query.redirect || '/'))
    },
    authenticate() {
      this.$store
        .dispatch('auth/authenticate', { provider: this.$config.provider })
        .then(() => this.$router.push(this.$route.query.redirect || '/'))
    }
  }
}
</script>

<style></style>
