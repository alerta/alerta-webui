<template>
  <v-container
    grid-list-sm
    fill-height
  >
    <v-row
      v-show="!sent"
      align-center
      row
      wrap
    >
      <v-col
        xs="12"
        sm="8"
        offset-xs0
        offset-sm2
      >
        <p class="text-center text-h5 font-weight-medium">
          <span>{{ $t('ResetLink') }}</span>
        </p>
        <v-form @submit.prevent="forgot()">
          <v-text-field
            v-model.trim="email"
            name="login"
            type="text"
            :label="$t('Username')"
            prepend-inner-icon="alternate_email"
            variant="outlined"
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
        <div class="text-center">
          <span class="text-body-2">
            {{ $t('AlreadyHaveAccount') }}
          </span>
          <v-btn
            variant="flat"
            color="primary"
            to="/login"
          >
            {{ $t('SignIn') }}
          </v-btn>
        </div>
      </v-col>
      <v-col
        xs="12"
        sm="8"
        offset-xs0
        offset-sm2
      />
    </v-row>

    <v-row
      v-show="sent"
      align-center
      row
      wrap
    >
      <v-col
        xs="12"
        sm="8"
        offset-xs0
        offset-sm2
      >
        <p class="text-center text-h5 font-weight-medium">
          <span>{{ $t('CheckEmail') }}</span>
        </p>
        <v-form>
          <v-text-field
            v-model.trim="email"
            name="login"
            type="text"
            :label="$t('Username')"
            prepend-inner-icon="alternate_email"
            variant="outlined"
            readonly
          />
          <v-btn
            block
            color="primary"
            to="/login"
          >
            {{ $t('ReturnSignIn') }}
          </v-btn>
        </v-form>
        <div class="text-center">
          <span class="text-body-2">
            {{ $t('AlreadyHaveAccount') }}
          </span>
          <v-btn
            variant="flat"
            color="primary"
            to="/login"
          >
            {{ $t('SignIn') }}
          </v-btn>
        </div>
      </v-col>
      <v-col
        xs="12"
        sm="8"
        offset-xs0
        offset-sm2
      />
    </v-row>
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
          i18n.global.t('ResetEmailSent'),
          { root: true }
        )
        this.sent = true
      })
    }
  }
}
</script>

<style></style>
