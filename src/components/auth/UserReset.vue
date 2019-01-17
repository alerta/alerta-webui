<template>
  <v-container grid-list-sm fill-height>
    <v-layout align-center row wrap>
      <v-flex xs12 sm8 offset-xs0 offset-sm2>
        <p class="text-xs-center headline font-weight-medium">
          <span>Choose a new password</span>
        </p>
        <v-form @submit.prevent="reset()">
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
          <v-text-field
            v-model="confirmPassword"
            name="confirm-password"
            :type="showPassword ? 'text' : 'password'"
            label="Confirm Password"
            :append-icon="showPassword ? 'visibility_off' : 'visibility'"
            outline
            @click:append="showPassword = !showPassword"
          >
          </v-text-field>
          <v-btn
            block
            color="primary"
            type="submit"
          >Reset Password</v-btn>
        </v-form>
        <div class="text-xs-center">
          <span class="body-2">Already have an account?</span> <v-btn flat color="primary" to="/login">Sign In</v-btn>
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
    password: null,
    confirmPassword: null,
    showPassword: false
  }),
  methods: {
    reset() {
      this.$store
        .dispatch('auth/reset', [this.$route.params.token, this.password])
        .then(() => {
          console.log('resetting ...')
        })
    }
  }
}
</script>

<style>
</style>
