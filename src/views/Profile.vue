<template>
  <div>
    <v-card
      flat
      class="mx-auto"
      max-width="800"
    >
      <v-form ref="form">
        <v-card>
          <v-card-title>
            <span class="headline">
              Profile
            </span>
          </v-card-title>

          <v-layout
            row
            wrap
          >
            <v-flex
              align-center
              justify-center
              layout
              text-xs-center
            >
              <v-avatar
                size="128"
                color="grey lighten-4"
              >
                <img
                  v-if="avatar && !error"
                  :src="avatar"
                  @error="error = true"
                >
                <v-icon
                  v-else
                  size="148"
                  color="grey lighten-2"
                >
                  account_circle
                </v-icon>
              </v-avatar>
            </v-flex>
          </v-layout>
          <v-layout
            row
            spacer
          >
            <v-flex
              align-center
              justify-center
              layout
              text-xs-center
            >
              <b>{{ profile.name }}</b>
            </v-flex>
          </v-layout>
          <v-layout
            row
            spacer
          >
            <v-flex
              align-center
              justify-center
              layout
              text-xs-center
            >
              <span v-if="!profile.preferred_username.includes('@')">@</span>{{ profile.preferred_username }}
            </v-flex>
          </v-layout>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex
                  xs12
                >
                  <v-text-field
                    v-model="profile.name"
                    :label="$t('FullName')"
                    readonly
                  />
                </v-flex>
                <v-flex
                  xs10
                >
                  <v-text-field
                    v-model="profile.preferred_username"
                    :label="$t('Username')"
                    readonly
                  />
                </v-flex>

                <v-flex
                  xs2
                >
                  <v-text-field
                    v-model="provider[profile.provider].text"
                    :label="$t('Provider')"
                    readonly
                  />
                </v-flex>

                <v-flex
                  xs12
                >
                  <v-text-field
                    v-model="profile.sub"
                    :label="$t('UserID')"
                    readonly
                  />
                </v-flex>

                <v-flex
                  xs12
                >
                  <v-text-field
                    v-model="profile.email"
                    :label="$t('Email')"
                    readonly
                    prepend-icon="email"
                  >
                    <template v-if="profile.email_verified">
                      <v-icon
                        slot="append"
                        color="success"
                      >
                        check
                      </v-icon>
                    </template>
                    <template v-else>
                      <v-icon
                        slot="append"
                        color="error"
                      >
                        clear
                      </v-icon>
                    </template>
                  </v-text-field>
                </v-flex>

                <v-flex
                  xs12
                >
                  <v-combobox
                    v-model="customers"
                    :label="$t('Customers')"
                    chips
                    multiple
                    readonly
                    placeholder="(none)"
                  >
                    <template v-slot:selection="data">
                      <v-chip>
                        <strong>{{ data.item }}</strong>&nbsp;(customer)
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-flex>
                <v-flex
                  xs12
                >
                  <v-combobox
                    v-model="profile.orgs"
                    :label="$t('Organizations')"
                    chips
                    multiple
                    readonly
                    placeholder="(none)"
                  >
                    <template v-slot:selection="data">
                      <v-chip>
                        <strong>{{ data.item }}</strong>&nbsp;(org)
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-flex>
                <v-flex
                  xs12
                >
                  <v-combobox
                    v-model="profile.groups"
                    :label="$t('Groups')"
                    chips
                    multiple
                    readonly
                    placeholder="(none)"
                  >
                    <template v-slot:selection="data">
                      <v-chip>
                        <strong>{{ data.item }}</strong>&nbsp;(group)
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-flex>
                <v-flex
                  xs12
                >
                  <v-combobox
                    v-model="profile.roles"
                    :label="$t('Roles')"
                    chips
                    multiple
                    readonly
                    placeholder="(none)"
                  >
                    <template v-slot:selection="data">
                      <v-chip>
                        <strong>{{ data.item }}</strong>&nbsp;(role)
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-flex>
                <v-flex
                  xs12
                >
                  <v-combobox
                    v-model="scopes"
                    :label="$t('Scopes')"
                    chips
                    multiple
                    readonly
                    placeholder="(none)"
                  >
                    <template v-slot:selection="data">
                      <v-chip>
                        <strong>{{ data.item }}</strong>&nbsp;(scope)
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="blue darken-1"
              flat
              disabled
            >
              {{ $t('Cancel') }}
            </v-btn>
            <v-btn
              color="blue darken-1"
              flat
              disabled
            >
              {{ $t('Save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import i18n from '@/plugins/i18n'

export default {
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
    },
    error: false
  }),
  computed: {
    profile() {
      return this.$store.getters['auth/getPayload'] || {}
    },
    avatar() {
      return this.$store.getters['auth/getAvatar']
    },
    scopes() {
      return this.$store.getters['auth/scopes']
    },
    customers() {
      return this.$store.getters['auth/customers']
    }
  },
  mounted() {
  },
  methods: {
  }
}
</script>

<style></style>
