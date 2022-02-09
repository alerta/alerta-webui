<template>
  <div>
    <v-card flat class="mx-auto" max-width="800">
      <v-form ref="form">
        <v-card>
          <v-card-title>
            <span class="headline">Profile</span>
          </v-card-title>

          <v-layout row wrap>
            <v-flex align-center justify-center layout text-sm-center>
              <v-avatar size="128" color="grey lighten-4">
                <img
                  v-if="avatar && !error"
                  :src="avatar"
                  @error="error = true"
                />
                <v-icon v-else size="148" color="grey lighten-2">
                  mdi-account-circle
                </v-icon>
              </v-avatar>
            </v-flex>
          </v-layout>
          <v-layout row spacer>
            <v-flex align-center justify-center layout text-sm-center>
              <b>{{ profile.name }}</b>
            </v-flex>
          </v-layout>
          <v-layout row spacer>
            <v-flex align-center justify-center layout text-sm-center>
              <span
                v-if="
                  profile.preferred_username &&
                  !profile.preferred_username.includes('@')
                "
                >@</span
              >
              {{ profile.preferred_username }}
            </v-flex>
          </v-layout>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12>
                  <v-text-field
                    v-model="profile.name"
                    :label="$t('FullName')"
                    readonly
                  />
                </v-flex>
                <v-flex xs9>
                  <v-text-field
                    v-model="profile.preferred_username"
                    :label="$t('Username')"
                    readonly
                  />
                </v-flex>

                <v-flex v-if="provider[profile.provider]" xs3>
                  <v-text-field
                    v-model="provider[profile.provider].text"
                    :label="$t('Provider')"
                    readonly
                  />
                </v-flex>

                <v-flex xs12>
                  <v-text-field
                    v-model="profile.sub"
                    :label="$t('UserID')"
                    readonly
                  />
                </v-flex>

                <v-flex xs12>
                  <v-text-field
                    v-if="profile.oid"
                    v-model="profile.oid"
                    :label="$t('PrimaryUserID')"
                    readonly
                  />
                </v-flex>

                <v-flex xs12>
                  <v-text-field
                    v-model="profile.email"
                    :label="$t('Email')"
                    readonly
                    prepend-icon="mdi-email"
                  >
                    <template v-if="profile.email_verified">
                      <v-icon slot="append" color="success">mdi-check</v-icon>
                    </template>
                    <template v-else>
                      <v-icon slot="append" color="error">mdi-close</v-icon>
                    </template>
                  </v-text-field>
                </v-flex>

                <v-flex v-if="$config.customer_views" xs12>
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
                        <strong>{{ data.item }}</strong
                        >&nbsp;(customer)
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-flex>
                <v-flex xs12>
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
                        <strong>{{ data.item }}</strong
                        >&nbsp;(org)
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-flex>
                <v-flex xs12>
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
                        <strong>{{ data.item }}</strong>
                        &nbsp;(group)
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-flex>
                <v-flex xs12>
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
                        <strong>{{ data.item }}</strong
                        >&nbsp;(role)
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-flex>
                <v-flex xs12>
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
                        <strong>{{ data.item }}</strong
                        >&nbsp;(scope)
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn color="blue darken-1" text disabled>
              {{ $t('Cancel') }}
            </v-btn>
            <v-btn color="blue darken-1" text disabled>
              {{ $t('Save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-card>
  </div>
</template>

<script>
export default {
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
  mounted() {},
  methods: {}
}
</script>

<style></style>
