<template>
  <v-card max-width="350">
    <v-list>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>{{ profile.name }}</v-list-item-title>
          <v-list-item-subtitle>
            <span>
              <span
                v-if="
                  profile.preferred_username &&
                  !profile.preferred_username.includes('@')
                "
                >@</span
              >{{ profile.preferred_username }}
            </span>
          </v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-action>
          <v-tooltip v-if="profile.provider && profile.provider != 'basic'" top>
            <template v-slot:activator="{ on }">
              <v-icon v-on="on">
                {{ provider[profile.provider].icon }}
              </v-icon>
            </template>
            <span>{{ provider[profile.provider].text }}</span>
          </v-tooltip>
          <v-tooltip v-else-if="profile.email_verified" top>
            <template v-slot:activator="{ on }">
              <v-icon v-on="on">mdi-shield-check</v-icon>
            </template>
            <span>({{ $t('EmailVerified') }})</span>
          </v-tooltip>
          <v-tooltip v-else top>
            <template v-slot:activator="{ on }">
              <v-icon v-on="on">mdi-account-remove</v-icon>
            </template>
            <span>{{ $t('EmailNotVerified') }}</span>
          </v-tooltip>
        </v-list-item-action>
      </v-list-item>
    </v-list>

    <v-divider />

    <v-list dense>
      <v-list-item v-if="$config.customer_views">
        <v-list-item-content>
          <v-list-item-title>
            <span v-for="(customer, index) in customers" :key="index">
              <v-chip v-if="index < 3" outlined small>
                <span>{{ customer }}</span>
              </v-chip>
              <span v-if="index === 3" class="grey--text caption"
                >(+{{ customers.length - 1 }} {{ $t('others') }})</span
              >
            </span>
          </v-list-item-title>
          <v-list-item-subtitle>{{ $t('Customers') }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-list-item v-if="profile.orgs">
        <v-list-item-content>
          <v-list-item-title>
            <v-chip-group column>
              <v-chip v-for="org in profile.orgs.slice(0, 3)" :key="org" small>
                {{ org }}
              </v-chip>
            </v-chip-group>
            <span v-if="profile.orgs.length > 3" class="grey--text caption">
              (+{{ profile.orgs.length - 1 }} {{ $t('others') }})
            </span>
          </v-list-item-title>
          <v-list-item-subtitle>{{ $t('Organizations') }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-if="profile.groups">
        <v-list-item-content>
          <v-list-item-title>
            <span v-for="(group, index) in profile.groups" :key="index">
              <v-chip v-if="index < 3" small>
                <span>{{ group }}</span>
              </v-chip>
              <span v-if="index === 3" class="grey--text caption"
                >(+{{ profile.groups.length - 1 }} {{ $t('others') }})</span
              >
            </span>
          </v-list-item-title>
          <v-list-item-subtitle>{{ $t('Groups') }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-if="profile.roles">
        <v-list-item-content>
          <v-list-item-title>
            <v-chip-group column>
              <v-chip
                v-for="role in profile.roles.slice(0, 3)"
                :key="role"
                small
              >
                {{ role }}
              </v-chip>
            </v-chip-group>
            <span v-if="profile.roles.length > 3" class="grey--text caption">
              (+{{ profile.roles.length - 1 }} {{ $t('others') }})
            </span>
          </v-list-item-title>
          <v-list-item-subtitle>{{ $t('Roles') }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>
            <v-chip-group column>
              <v-chip v-for="scope in scopes.slice(0, 3)" :key="scope" small>
                {{ scope }}
              </v-chip>
            </v-chip-group>
            <span v-if="scopes.length > 3" class="grey--text caption">
              (+{{ scopes.length - 1 }} {{ $t('others') }})
            </span>
          </v-list-item-title>
          <v-list-item-subtitle>{{ $t('Scopes') }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-card-actions>
      <v-spacer />

      <v-btn text @click="close">
        {{ $t('Cancel') }}
      </v-btn>
      <v-btn color="primary" text @click="logout()">
        {{ $t('LogOut') }}
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
      basic: { icon: 'mdi-card-account-details', text: 'BasicAuth' },
      ldap: { icon: 'mdi-card-account-details', text: 'LDAP' },
      azure: { icon: 'mdi-microsoft-azure', text: 'Azure OAuth2' },
      cognito: { icon: 'mdi-aws', text: 'Amazon Cognito' },
      github: { icon: 'mdi-github', text: 'GitHub OAuth2' },
      gitlab: { icon: 'mdi-gitlab', text: 'GitLab OAuth2' },
      google: { icon: 'mdi-google', text: 'Google OAuth2' },
      keycloak: { icon: 'mdi-key', text: 'Keycloak' },
      openid: { icon: 'mdi-openid', text: 'OpenID Connect' },
      pingfederate: { icon: 'mdi-badge-account', text: 'PingFederate' },
      saml2: { icon: 'mdi-badge-account', text: 'SAML2' }
    }
  }),
  computed: {
    scopes() {
      return this.$store.getters['auth/scopes']
    },
    customers() {
      return this.$store.getters['auth/customers']
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('clearUserPrefs')
      this.$store.dispatch('auth/logout').then((response) => {
        if (response.data.logoutUrl) {
          const redirectUrl =
            (this.$config.provider == 'keycloak'
              ? 'redirect_uri='
              : 'post_logout_redirect_url=') +
            this.$store.getters['auth/getOptions']['providers'][
              this.$config.provider
            ]['redirectUri'] +
            '/logout'
          window.location.href = response.data.logoutUrl + '?' + redirectUrl
        } else {
          this.$router.push({ name: 'logout' })
        }
      })
      this.close()
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.v-list__tile__title {
  height: 40px;
}
</style>
