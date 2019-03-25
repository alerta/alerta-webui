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
        sm6
        offset-xs0
        offset-sm3
      >
        <p class="text-xs-center headline font-weight-medium">
          <span v-show="signupEnabled">
            Create your Alerta account
          </span>
          <span
            v-show="!signupEnabled"
          >
            Sorry, sign up is not currently available
          </span>
        </p>
        <v-form ref="form">
          <v-text-field
            v-model="name"
            name="name"
            type="text"
            label="Full Name"
            :disabled="!signupEnabled"
            outline
            :rules="[rules.required]"
            required
          />
          <v-text-field
            v-model="email"
            name="login"
            type="text"
            label="Username"
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
            label="Password"
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
            label="Confirm Password"
            :disabled="!signupEnabled"
            outline
            :rules="[rules.passwordMatch]"
            required
            @click:append="showPassword = !showPassword"
          />
          <v-text-field
            v-model="text"
            name="text"
            type="text"
            label="Description"
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
            Sign Up
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
        sm6
        offset-xs0
        offset-sm3
      />
    </v-layout>
  </v-container>
</template>

<script>
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
      required: v => !!v || 'Required.',
      min: v => (v && v.length >= 6) || 'Min 6 characters',
      passwordMatch: v =>
        (v && v == vm.password) || 'Passwords entered don\'t match'
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
        .then(() => this.$router.push(this.$route.query.redirect || '/alerts'))
        .catch(error => {
          if (error.response.status === 403 && this.emailVerification) {
            this.$router.push('/login')
          }
        })
    }
  }
}
</script>

<style></style>
