
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
        v-show="$config.provider != 'basic'"
        xs12
        sm6
        offset-xs0
        offset-sm3
      >
        <p class="text-xs-center headline font-weight-medium">
          Please log in to continue.
        </p>
      </v-flex>
      <v-flex
        v-show="$config.provider == 'basic'"
        xs12
        sm6
        offset-xs0
        offset-sm3
      >
        <p
          v-show="!$config.signup_enabled"
          class="text-xs-center headline font-weight-medium"
        >
          Please log in to continue.
        </p>
        <p
          v-show="$config.signup_enabled"
          class="text-xs-center headline font-weight-medium"
        >
          Please sign up or log in to continue.
        </p>
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

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import UserLogin from '@/components/auth/UserLogin.vue'

@Component({
  components: {
    UserLogin
  }
})
export default class Home extends Vue {}
</script>
