<template>
  <v-container
    grid-list-sm
    fill-height
  >
    <v-layout
      v-show="!sent"
      align-center
      row
      wrap
    >
      <v-flex
        xs12
        sm8
        offset-xs0
        offset-sm2
      >
        <p class="text-xs-center headline font-weight-medium">
          <span>Enter your email and we'll send you a reset link</span>
        </p>
        <v-form @submit.prevent="forgot()">
          <v-text-field
            v-model="email"
            name="login"
            type="text"
            label="Username"
            prepend-inner-icon="alternate_email"
            outline
          />
          <v-btn
            :loading="isSending"
            :disabled="isSending"
            block
            color="primary"
            type="submit"
          >
            Send
          </v-btn>
        </v-form>
        <div class="text-xs-center">
          <span class="body-2">
            Already have an account?
          </span>
          <v-btn
            flat
            color="primary"
            to="/login"
          >
            Sign In
          </v-btn>
        </div>
      </v-flex>
      <v-flex
        xs12
        sm8
        offset-xs0
        offset-sm2
      />
    </v-layout>

    <v-layout
      v-show="sent"
      align-center
      row
      wrap
    >
      <v-flex
        xs12
        sm8
        offset-xs0
        offset-sm2
      >
        <p class="text-xs-center headline font-weight-medium">
          <span>Check your email for a reset link...</span>
        </p>
        <v-form @submit.prevent="forgot()">
          <v-text-field
            v-model="email"
            name="login"
            type="text"
            label="Username"
            prepend-inner-icon="alternate_email"
            outline
            readonly
          />
          <v-btn
            block
            color="primary"
            to="/login"
          >
            Return to Sign In
          </v-btn>
        </v-form>
        <div class="text-xs-center">
          <span class="body-2">
            Already have an account?
          </span>
          <v-btn
            flat
            color="primary"
            to="/login"
          >
            Sign In
          </v-btn>
        </div>
      </v-flex>
      <v-flex
        xs12
        sm8
        offset-xs0
        offset-sm2
      />
    </v-layout>
  </v-container>
</template>

<script>
import { router } from '@/main'

export default {
  props: [],
  data: () => ({
    email: null,
    message: null,
    sent: false
  }),
  computed: {
    isSending() {
      return this.$store.state.auth.isSending
    }
  },
  methods: {
    forgot() {
      this.$store.dispatch('auth/forgot', this.email).then(() => {
        this.$store.dispatch(
          'notifications/success',
          'Reset email sent successfully!',
          { root: true }
        )
        this.sent = true
      })
    }
  }
}
</script>

<style></style>
