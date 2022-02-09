<template>
  <v-container grid-list-sm fill-height>
    <v-layout v-show="!sent" align-center row wrap>
      <v-flex xs12 sm8 offset-xs0 offset-sm2>
        <p class="text-sm-center headline font-weight-medium">
          <span>{{ $t('ResetLink') }}</span>
        </p>
        <v-form @submit.prevent="forgot()">
          <v-text-field
            v-model.trim="email"
            name="login"
            type="text"
            :label="$t('Username')"
            prepend-inner-icon="mdi-at"
            outlined
          />
          <v-btn
            :loading="isSending"
            :disabled="isSending"
            block
            color="primary"
            type="submit"
          >
            {{ $t('Send') }}
          </v-btn>
        </v-form>
        <div class="text-sm-center">
          <span class="body-2">
            {{ $t('AlreadyHaveAccount') }}
          </span>
          <v-btn flat color="primary" to="/login">
            {{ $t('SignIn') }}
          </v-btn>
        </div>
      </v-flex>
      <v-flex xs12 sm8 offset-xs0 offset-sm2 />
    </v-layout>

    <v-layout v-show="sent" align-center row wrap>
      <v-flex xs12 sm8 offset-xs0 offset-sm2>
        <p class="text-sm-center headline font-weight-medium">
          <span>{{ $t('CheckEmail') }}</span>
        </p>
        <v-form>
          <v-text-field
            v-model.trim="email"
            name="login"
            type="text"
            :label="$t('Username')"
            prepend-inner-icon="mdi-at"
            outlined
            readonly
          />
          <v-btn block color="primary" to="/login">
            {{ $t('ReturnSignIn') }}
          </v-btn>
        </v-form>
        <div class="text-sm-center">
          <span class="body-2">
            {{ $t('AlreadyHaveAccount') }}
          </span>
          <v-btn flat color="primary" to="/login">
            {{ $t('SignIn') }}
          </v-btn>
        </div>
      </v-flex>
      <v-flex xs12 sm8 offset-xs0 offset-sm2 />
    </v-layout>
  </v-container>
</template>

<script>
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
          i18n.t('ResetEmailSent'),
          { root: true }
        )
        this.sent = true
      })
    }
  }
}
</script>

<style></style>
