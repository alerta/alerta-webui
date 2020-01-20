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
        <div v-show="message">
          <p class="text-xs-center headline font-weight-medium">
            {{ $t('Thanks') }} {{ message }}{{ $t('YouCanNow') }} <a href="/login">
              {{ $t('LogIn') }}
            </a>
          </p>
        </div>
        <div v-show="error">
          <p class="text-xs-center headline font-weight-medium">
            {{ $t('ProblemEmail') }}
            <a href="/">
              {{ $t('TryAgain') }}
            </a>
          </p>
          <p class="text-xs-center subheading font-weight-medium">
            {{ $t('Error') }} {{ error }}
          </p>
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
