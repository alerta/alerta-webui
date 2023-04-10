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
        <div v-show="message">
          <p class="text-center text-h5 font-weight-medium">
            {{ $t('Thanks') }} {{ message }}{{ $t('YouCanNowLogin1') }} <a href="/login">
              {{ $t('YouCanNowLogin2') }}
            </a>
          </p>
        </div>
        <div v-show="error">
          <p class="text-center text-h5 font-weight-medium">
            {{ $t('EmailConfirmFailed') }}
            <a href="/">
              {{ $t('TryAgain') }}
            </a>
          </p>
          <p class="text-center subheading font-weight-medium">
            {{ $t('Error') }}: {{ error }}
          </p>
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
  data: () => ({
    message: null,
    error: null
  }),
  mounted() {
    this.$store
      .dispatch('auth/confirm', this.$route.params.token)
      .then(response => this.message = response.message)
      .catch(error => this.error = error.response.data.message)
  }
}
</script>

<style></style>
