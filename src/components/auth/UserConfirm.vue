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
        <div v-show="message">
          <span class="text-xs-center headline font-weight-medium">
            Thanks! {{ message }}. You can now <a href="/login">
              log in
            </a>
          </span>
        </div>
        <div v-show="error">
          <p class="text-xs-center headline font-weight-medium">
            Sorry, there was a problem confirming your email address
            <a href="/">
              Please try again
            </a>
          </p>
          <p class="text-xs-center subheading font-weight-medium">
            Error: {{ error }}
          </p>
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
  data: () => ({
    message: null,
    error: null
  }),
  mounted() {
    this.$store
      .dispatch('auth/confirm', this.$route.params.token)
      .then(response => (this.message = response.message))
      .catch(error => (this.error = error.response.data.message))
  }
}
</script>

<style></style>
