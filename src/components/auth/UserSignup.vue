<template>
  <v-container
    grid-list-sm
    fill-height
  >
    <v-row
      row
      wrap
      class="justify-center"
    >
      <v-col
        xs="12"
        sm="8"
        offset-xs0
        offset-sm2
      >
        <p class="text-center text-h5 font-weight-medium">
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
            variant="outlined"
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
            variant="outlined"
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
            variant="outlined"
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
            variant="outlined"
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
            variant="outlined"
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
        <br/>
        <div class="text-center">
          <span class="text-body-2">
            {{ $t('AlreadyHaveAccount') }}
          </span>
          <v-btn
            class="theme--light text-primary"
            variant="flat"
            to="/login"
            style="padding-left: 16px; margin-left: 8px;"
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
      this.$refs.form.validate().then((status) => {
        if(status){
          this.$refs.form.resetValidation()
          this.signup()
        }
      })
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

<style>
</style>
