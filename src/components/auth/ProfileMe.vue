<template>
  <v-card
    max-width="350"
  >
    <v-list>
      <v-list-tile>
        <v-list-tile-content>
          <v-list-tile-title>{{ profile.name }}</v-list-tile-title>
          <v-list-tile-sub-title>
            <span>
              <span
                v-if="profile.preferred_username && !profile.preferred_username.includes('@')"
              >@</span>{{ profile.preferred_username }}
            </span>
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
            <span>({{ $t('EmailVerified') }})</span>
          </v-tooltip>
          <v-tooltip
            v-else
            top
          >
            <v-icon slot="activator">
              fas fa-user-times
            </v-icon>
            <span>{{ $t('EmailNotVerified') }}</span>
          </v-tooltip>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>

    <v-divider />

    <v-list>
      <v-list-tile
        v-if="$config.customer_views"
      >
        <v-list-tile-content>
          <v-list-tile-title>
            <span
              v-for="(customer, index) in customers"
              :key="index"
            >
              <v-chip
                v-if="index < 3"
                outline
                small
              >
                <span>{{ customer }}</span>
              </v-chip>
              <span
                v-if="index === 3"
                class="grey--text caption"
              >(+{{ customers.length - 1 }} {{ $t('others') }})</span>
            </span>
          </v-list-tile-title>
          <v-list-tile-sub-title>{{ $t('Customers') }}</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile v-if="profile.orgs">
        <v-list-tile-content>
          <v-list-tile-title>
            <span
              v-for="(org, index) in profile.orgs"
              :key="index"
            >
              <v-chip
                v-if="index < 3"
                small
              >
                <span>{{ org }}</span>
              </v-chip>
              <span
                v-if="index === 3"
                class="grey--text caption"
              >(+{{ profile.orgs.length - 1 }} {{ $t('others') }})</span>
            </span>
          </v-list-tile-title>
          <v-list-tile-sub-title>{{ $t('Organizations') }}</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile v-if="profile.groups">
        <v-list-tile-content>
          <v-list-tile-title>
            <span
              v-for="(group, index) in profile.groups"
              :key="index"
            >
              <v-chip
                v-if="index < 3"
                small
              >
                <span>{{ group }}</span>
              </v-chip>
              <span
                v-if="index === 3"
                class="grey--text caption"
              >(+{{ profile.groups.length - 1 }} {{ $t('others') }})</span>
            </span>
          </v-list-tile-title>
          <v-list-tile-sub-title>{{ $t('Groups') }}</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile v-if="profile.roles">
        <v-list-tile-content>
          <v-list-tile-title>
            <span
              v-for="(role, index) in profile.roles"
              :key="index"
            >
              <v-chip
                v-if="index < 3"
                small
              >
                <span>{{ role }}</span>
              </v-chip>
              <span
                v-if="index === 3"
                class="grey--text caption"
              >(+{{ profile.roles.length - 1 }} {{ $t('others') }})</span>
            </span>
          </v-list-tile-title>
          <v-list-tile-sub-title>{{ $t('Roles') }}</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile>
        <v-list-tile-content>
          <v-list-tile-title>
            <span
              v-for="(scope, index) in scopes"
              :key="index"
            >
              <v-chip
                v-if="index < 3"
                small
              >
                <span>{{ scope }}</span>
              </v-chip>
              <span
                v-if="index === 3"
                class="grey--text caption"
              >(+{{ scopes.length - 1 }} {{ $t('others') }})</span>
            </span>
          </v-list-tile-title>
          <v-list-tile-sub-title>{{ $t('Scopes') }}</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>

    <v-card-actions>
      <v-spacer />

      <v-btn
        flat
        @click="close"
      >
        {{ $t('Cancel') }}
      </v-btn>
      <v-btn
        color="primary"
        flat
        @click="logout()"
      >
        {{ $t('LogOut') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import i18n from '@/plugins/i18n'

export default {
  props: {
    profile: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    provider: {
      basic: { icon: 'fas fa-id-card', text: 'BasicAuth' },
      ldap: { icon: 'fas fa-id-card', text: 'LDAP' },
      azure: { icon: 'fab fa-windows', text: 'Azure OAuth2' },
      cognito: { icon: 'fab fa-aws', text: 'Amazon Cognito' },
      github: { icon: 'fab fa-github', text: 'GitHub OAuth2' },
      gitlab: { icon: 'fab fa-gitlab', text: 'GitLab OAuth2' },
      google: { icon: 'fab fa-google', text: 'Google OAuth2' },
      keycloak: { icon: 'fas fa-key', text: 'Keycloak' },
      openid: { icon: 'fab fa-openid', text: 'OpenID Connect' },
      pingfederate: { icon: 'fas fa-id-badge', text: 'PingFederate' },
      saml2: { icon: 'fas fa-id-badge', text: 'SAML2' }
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
      this.$store
        .dispatch('auth/logout')
        .then(response => {
          if (response.data.logoutUrl) {
            let redirectUrl =
              (this.$config.provider == 'keycloak'
                ? 'redirect_uri='
                : 'post_logout_redirect_url=') +
              window.location.origin +
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
