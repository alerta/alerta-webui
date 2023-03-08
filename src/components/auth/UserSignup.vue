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
        xs12
        sm8
        offset-xs0
        offset-sm2
      >
        <p class="text-xs-center headline font-weight-medium">
          <span v-show="signupEnabled">
            {{ $t('CreateAlertaAccount') }}
          </span>
          <span
            v-show="!signupEnabled"
          >
            {{ $t('SignUpNotAvailable') }}
          </span>
        </p>
        <v-form ref="form">
          <v-text-field
            v-model.trim="name"
            name="name"
            type="text"
            :label="$t('FullName')"
            :disabled="!signupEnabled"
            outline
            :rules="[rules.required]"
            required
          />
          <v-text-field
            v-model.trim="email"
            name="login"
            type="text"
            :label="$t('Username')"
            prepend-inner-icon="alternate_email"
            :disabled="!signupEnabled"
            outline
            :rules="[rules.required]"
            required
          />
          <v-text-field
            v-model="password"
            name="password"
            :type="showPassword ? 'text' : 'password'"
            :label="$t('Password')"
            :append-icon="showPassword ? 'visibility_off' : 'visibility'"
            :disabled="!signupEnabled"
            outline
            :rules="[rules.min]"
            required
            @click:append="showPassword = !showPassword"
          />
          <v-text-field
            v-model="confirmPassword"
            name="confirm-password"
            :append-icon="showPassword ? 'visibility_off' : 'visibility'"
            :type="showPassword ? 'text' : 'password'"
            :label="$t('ConfirmPassword')"
            :disabled="!signupEnabled"
            outline
            :rules="[rules.passwordMatch]"
            required
            @click:append="showPassword = !showPassword"
          />
          <v-text-field
            v-model.trim="text"
            name="text"
            type="text"
            :label="$t('Description')"
            :disabled="!signupEnabled"
            outline
          />
          <v-btn
            :loading="isSending"
            :disabled="!signupEnabled || isSending"
            block
            color="primary"
            @click="validate"
          >
            {{ $t('SignUp') }}
          </v-btn>
        </v-form>
        <div class="text-xs-center">
          <span class="body-2">
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
import i18n from '@/plugins/i18n'

export default {
  props: [],
  data: vm => ({
    name: null,
    email: null,
    password: '',
    confirmPassword: '',
    showPassword: false,
    text: null,
    rules: {
      required: v => !!v || i18n.global.t('Required'),
      min: v => (v && v.length >= 6) || i18n.global.t('Min6Char'),
      passwordMatch: v =>
        (v && v == vm.password) || i18n.global.t('PasswordNotMatch')
    }
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
    validate() {
      if (this.$refs.form.validate()) {
        this.$refs.form.resetValidation()
        this.signup()
      }
    },
    signup() {
      let credentials = {
        name: this.name,
        email: this.email,
        password: this.password,
        text: this.text
      }
      this.$store
        .dispatch('auth/signup', credentials)
        .then(() => this.$router.push({ path: this.$route.query.redirect || '/' }))
        .catch(error => {
          if (error.response.status === 403 && this.emailVerification) {
            this.$router.push({ name: 'login' })
          }
        })
    }
  }
}
</script>

<style></style>
