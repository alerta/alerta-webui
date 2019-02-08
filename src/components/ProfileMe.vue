<template>
  <v-card>
    <v-list>
      <v-list-tile>
        <v-list-tile-content>
          <v-list-tile-title>{{ profile.name }}</v-list-tile-title>
          <v-list-tile-sub-title>
            {{
              profile.preferred_username
            }}
          </v-list-tile-sub-title>
        </v-list-tile-content>

        <v-list-tile-action>
          <v-tooltip
            v-if="profile.provider && profile.provider != 'basic'"
            top
          >
            <v-icon slot="activator">
              {{
                provider[profile.provider].icon
              }}
            </v-icon>
            <span>{{ provider[profile.provider].text }}</span>
          </v-tooltip>
          <v-tooltip
            v-else-if="profile.email_verified"
            top
          >
            <v-icon slot="activator">
              verified_user
            </v-icon>
            <span>Email verified</span>
          </v-tooltip>
          <v-tooltip
            v-else
            top
          >
            <v-icon slot="activator">
              fas fa-user-times
            </v-icon>
            <span>Email not verified</span>
          </v-tooltip>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>

    <v-divider />

    <v-list>
      <v-list-tile v-if="isCustomerViews">
        <v-list-tile-content>
          <v-list-tile-title>
            {{ profile.customers }}
          </v-list-tile-title>
          <v-list-tile-sub-title>Customers</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile v-if="profile.orgs">
        <v-list-tile-content>
          <v-list-tile-title>{{ profile.orgs }}</v-list-tile-title>
          <v-list-tile-sub-title>Organizations</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile v-if="profile.groups">
        <v-list-tile-content>
          <v-list-tile-title>{{ profile.groups }}</v-list-tile-title>
          <v-list-tile-sub-title>Groups</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile v-if="profile.roles">
        <v-list-tile-content>
          <v-list-tile-title>{{ profile.roles }}</v-list-tile-title>
          <v-list-tile-sub-title>Roles</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile>
        <v-list-tile-content>
          <v-list-tile-title>
            {{ scopes }}
          </v-list-tile-title>
          <v-list-tile-sub-title>Scopes</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>

    <v-card-actions>
      <v-spacer />

      <v-btn
        flat
        @click="close"
      >
        Cancel
      </v-btn>
      <v-btn
        color="primary"
        flat
        @click="logout()"
      >
        Sign Out
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    profile: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    provider: {
      basic: { icon: 'fas fa-id-card', text: 'BasicAuth' }, // FIXME
      basic_ldap: { icon: 'fas fa-id-card', text: 'LDAP' },
      github: { icon: 'fab fa-github', text: 'GitHub OAuth2' },
      gitlab: { icon: 'fab fa-gitlab', text: 'GitLab OAuth2' },
      google: { icon: 'fab fa-google', text: 'Google OAuth2' },
      keycloak: { icon: 'fas fa-key', text: 'Keycloak' },
      pingfederate: { icon: 'fas fa-id-badge', text: 'PingFederate' },
      saml2: { icon: 'fas fa-id-badge', text: 'SAML2' }
    }
  }),
  computed: {
    scopes() {
      return this.$store.getters['auth/scopes']
    },
    isCustomerViews() {
      return this.$store.getters['auth/isCustomerViews']
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('auth/logout')
      this.$router.go('/')
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style></style>
