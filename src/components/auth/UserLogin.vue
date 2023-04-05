<template>
  <v-container
    grid-list-sm
    fill-height
    class="d-flex align-center" style="height: 70vh;"
  >
    <v-row
      align-center
      row
      wrap
      class="justify-center"
    >
      <v-col
        v-if="isBasicAuth"
        xs="12"
        sm="8"
        offset-xs0
        offset-sm2
      >
        <p class="text-center text-h5 font-weight-medium">
          {{ $t('LoginToContinue') }}
        </p>
        <br/>
        <v-form @submit.prevent="login()">
          <v-text-field
            v-model.trim="username"
            name="login"
            type="text"
            :label="$t('Username')"
            prepend-inner-icon="alternate_email"
            variant="outlined"
          />
          <v-text-field
            v-model="password"
            name="password"
            :type="showPassword ? 'text' : 'password'"
            :label="$t('Password')"
            :append-icon="showPassword ? 'visibility_off' : 'visibility'"
            variant="outlined"
            @click:append="showPassword = !showPassword"
          />
          <v-btn
            block
            color="primary"
            type="submit"
          >
            {{ $t('LogIn') }}
          </v-btn>
        </v-form>
        <br/>
        <div class="text-center">
          <v-btn
            class="theme--light text-primary"
            variant="flat"
            to="/signup"
            :disabled="!signupEnabled"
          >
            {{ $t('CreateAccount') }}
          </v-btn>
          <v-btn
            class="theme--light text-primary"
            variant="flat"
            to="/forgot"
          >
            {{ $t('ForgotPassword') }}
          </v-btn>
        </div>
      </v-col>

      <v-col
        v-else-if="$config.provider == 'saml2'"
        xs="12"
        sm="8"
        offset-xs0
        offset-sm2
      >
        <div>
          <p class="text-center text-h5 font-weight-medium">
            SAML2 Authentication uses pop-up windows.
          </p>
          <p class="text-center subheading font-weight-medium">
            Please allow pop-ups from <kbd>{{ host }}</kbd>
          </p>
        </div>
        <div v-show="message && !error">
          <p class="text-center text-h5 font-weight-medium">
            {{ message }}
          </p>
        </div>
        <div v-show="error">
          <p class="text-center text-h5 font-weight-medium">
            {{ $t('UnspecifiedProblem') }}
            <a
              href="#"
              @click="authenticateUsingSAML"
            >
              {{ $t('TryAgain') }}
            </a>
          </p>
          <p class="text-center subheading font-weight-medium">
            {{ $t('Error') }}: {{ error }}
          </p>
        </div>
      </v-col>

      <v-col
        v-else
        xs="12"
        sm="8"
        offset-xs0
        offset-sm2
      >
        <div v-show="message && !error">
          <p class="text-center text-h5 font-weight-medium">
            {{ message }}
          </p>
        </div>
        <div v-show="error">
          <p class="text-center text-h5 font-weight-medium">
            {{ $t('UnspecifiedProblem') }}
            <a
              href="#"
              @click="authenticate"
            >
              {{ $t('TryAgain') }}
            </a>
          </p>
          <p class="text-center subheading font-weight-medium">
            {{ $t('Error') }}: {{ error }}
          </p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import i18n from '@/plugins/i18n'

export default {
  props: [],
  data: () => ({
    host: window.location.origin,
    username: null,
    password: null,
    showPassword: false,
    message: null,
    error: null
  }),
  computed: {
    isBasicAuth() {
      return this.$config.provider == 'basic' || this.$config.provider == 'ldap'
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
    if (this.$config.provider == 'saml2') {
      this.authenticateUsingSAML()
    } else if (this.authProvider) {
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
        .then(() => this.$router.push({ path: this.$route.query.redirect || '/' }))
        .catch(error => this.error = error.response.data.message)
    },
    authenticate() {
      if (this.authProvider) {
        this.message = `Authenticating with ${this.authProvider} ...`
        this.$store
          .dispatch('auth/authenticate', this.$config.provider)
          .then(() => this.$router.push({ path: this.$route.query.redirect || '/' }))
          .catch(error => this.error = error.response.data.message)
      } else {
        this.message = i18n.global.t('AuthNotPossible')
        this.error = `Unknown authentication provider (${this.$config.provider})`
      }
    },
    authenticateUsingSAML() {
      let auth_win
      window.addEventListener('message', event => {
        if (event.source === auth_win) {
          if (event.data && event.data.status && event.data.status === 'ok' && event.data.token) {
            this.$store
              .dispatch('auth/setToken', event.data)
              .then(() => this.$router.push({ path: this.$route.query.redirect || '/' }))
              .catch(error => this.error = error.response.data.message)
          } else {
            this.message = i18n.global.t('AuthNotPossible')
            this.error = event.data.message ? event.data.message : JSON.stringify(event)
          }
        }
        return
      })
      auth_win = window.open(this.$config.endpoint + '/auth/saml', i18n.global.t('AuthInProgress'))
    }
  }
}
</script>

<style></style>
