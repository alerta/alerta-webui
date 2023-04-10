<template>
  <v-container
    grid-list-sm
    fill-height
  >
    <v-row
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
          <span>{{ $t('ChooseNewPassword') }}</span>
        </p>
        <v-form @submit.prevent="reset()">
          <v-text-field
            v-model="password"
            name="password"
            :type="showPassword ? 'text' : 'password'"
            :label="$t('Password')"
            :append-icon="showPassword ? 'visibility_off' : 'visibility'"
            variant="outlined"
            @click:append="showPassword = !showPassword"
          />
          <v-text-field
            v-model="confirmPassword"
            name="confirm-password"
            :type="showPassword ? 'text' : 'password'"
            :label="$t('ConfirmPassword')"
            :append-icon="showPassword ? 'visibility_off' : 'visibility'"
            variant="outlined"
            @click:append="showPassword = !showPassword"
          />
          <v-btn
            block
            color="primary"
            type="submit"
          >
            {{ $t('ResetPassword') }}
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
    password: null,
    confirmPassword: null,
    showPassword: false
  }),
  methods: {
    reset() {
      this.$store
        .dispatch('auth/reset', [this.$route.params.token, this.password])
        .then(() => {
          /* give feedback to user that it worked, and auto-redirect? */
        })
    }
  }
}
</script>

<style></style>
