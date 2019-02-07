<template>
  <v-container grid-list-sm fill-height>
    <v-layout align-center row wrap>
      <v-flex xs12 sm8 offset-xs0 offset-sm2>
        <p class="text-xs-center headline font-weight-medium">
          <span v-show="signupEnabled">Create your Alerta account</span>
          <span v-show="!signupEnabled"
          >Sorry, sign up is not currently available</span
          >
        </p>
        <v-form @submit.prevent="signup()">
          <v-text-field
            v-model="name"
            name="name"
            type="text"
            label="Full Name"
            :disabled="!signupEnabled"
            outline
          >
          </v-text-field>
          <v-text-field
            v-model="email"
            name="login"
            type="text"
            label="Username"
            prepend-inner-icon="alternate_email"
            :disabled="!signupEnabled"
            outline
          >
          </v-text-field>
          <v-text-field
            v-model="password"
            name="password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            :append-icon="showPassword ? 'visibility_off' : 'visibility'"
            :disabled="!signupEnabled"
            outline
            @click:append="showPassword = !showPassword"
          >
          </v-text-field>
          <v-text-field
            v-model="confirmPassword"
            name="confirm-password"
            :type="showPassword ? 'text' : 'password'"
            label="Confirm Password"
            :append-icon="showPassword ? 'visibility_off' : 'visibility'"
            :disabled="!signupEnabled"
            outline
            @click:append="showPassword = !showPassword"
          >
          </v-text-field>
          <v-text-field
            v-model="text"
            name="text"
            type="text"
            label="Description"
            :disabled="!signupEnabled"
            outline
          >
          </v-text-field>
          <v-btn
            :loading="isSending"
            :disabled="!signupEnabled || isSending"
            block
            color="primary"
            type="submit"
          >Sign Up</v-btn
          >
        </v-form>
        <div class="text-xs-center">
          <span class="body-2">Already have an account?</span>
          <v-btn flat color="primary" to="/login">Sign In</v-btn>
        </div>
      </v-flex>
      <v-flex xs12 sm8 offset-xs0 offset-sm2></v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { router } from '@/main'

export default {
  props: [],
  data: () => ({
    name: null,
    email: null,
    password: null,
    confirmPassword: null,
    text: null,
    showPassword: false
  }),
  computed: {
    isSending() {
      return this.$store.state.auth.isSending
    },
    signupEnabled() {
      return this.$store.getters.getConfig('signup_enabled')
    },
    emailVerification() {
      return this.$store.getters.getConfig('email_verification')
    }
  },
  methods: {
    signup() {
      this.$store
        .dispatch('auth/signup', {
          name: this.name,
          email: this.email,
          password: this.password,
          text: this.text
        })
        .then(() => {
          if (this.emailVerification) {
            this.$router.push('/login')
          } else {
            this.$router.push(this.$route.query.redirect || '/')
          }
        })
    }
  }
}
</script>

<style></style>
