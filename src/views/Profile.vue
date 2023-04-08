<template>
  <div>
    <v-card
      class="mx-auto"
      max-width="800"
    >
      <v-form ref="form">
        <v-card>
          <v-card-title>
            <span class="text-h5">
              Profile
            </span>
          </v-card-title>

          <v-row
            row
            wrap
          >
            <v-col
              class="d-flex justify-center align-center"
            >
              <v-avatar
                size="128"
                color="grey-lighten-4"
              >
                <img
                  v-if="avatar && !error"
                  :src="avatar"
                  @error="error = true"
                >
                <v-icon
                  v-else
                  size="148"
                  color="grey-lighten-2"
                >
                  account_circle
                </v-icon>
              </v-avatar>
            </v-col>
          </v-row>
          <v-row
            row
            spacer
          >
            <v-col
              align-center
              justify-center
              layout
              text-xs-center
            >
              <b>{{ profile.name }}</b>
            </v-col>
          </v-row>
          <v-row
            row
            spacer
          >
            <v-col
              align-center
              justify-center
              layout
              text-xs-center
            >
              <span
                v-if="profile.preferred_username && !profile.preferred_username.includes('@')"
              >@</span>
              {{ profile.preferred_username }}
            </v-col>
          </v-row>
          
          <v-card-text>
            <v-container grid-list-md >
              <v-row wrap>
                <v-col
                  xs="12"
                  sm="12"
                  style=" padding-top: 0; padding-bottom: 0;"
                >
                  <v-text-field
                    v-model="profile.name"
                    dirty
                    :label="$t('FullName')"
                    readonly
                    variant="outlined"

                  />
                </v-col>
                <v-col
                  xs="12"
                  sm="9"
                  style=" padding-top: 0;
  padding-bottom: 0;"
                >
                  <v-text-field
                    v-model="profile.preferred_username"
                    dirty
                    :label="$t('Username')"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <v-col
                  v-if="provider[profile.provider]"
                  xs="3"
                  sm="3"
                  style=" padding-top: 0;
  padding-bottom: 0;"
                >
                  <v-text-field
                    v-model="provider[profile.provider].text"
                    dirty
                    :label="$t('Provider')"
                    readonly
                  />
                </v-col>

                <v-col
                  xs="12"
                  sm="12"
                  style=" padding-top: 0;
  padding-bottom: 0;"
                  
                >
                  <v-text-field
                    v-model="profile.sub"
                    dirty
                    :label="$t('UserID')"
                    readonly
                    variant="outlined"

                  />
                </v-col>

                <v-col
                  xs="12"
                  sm="12"
                  style=" padding-top: 0;
  padding-bottom: 0;"
                >
                  <v-text-field
                    v-if="profile.oid"
                    v-model="profile.oid"
                    dirty
                    :label="$t('PrimaryUserID')"
                    readonly
                  />
                </v-col>

                <v-col
                  xs="12"
                  sm="12"
                  style=" padding-top: 0;
  padding-bottom: 0;"
                >
                  <v-text-field
                    v-model="profile.email"
                    dirty
                    :label="$t('Email')"
                    readonly
                    prepend-inner-icon="email"
                    variant="outlined"

                  >
                    <template 
                      v-if="profile.email_verified" 
                      #append
                    >
                      <v-icon
                        color="success"
                      >
                        check
                      </v-icon>
                    </template>
                    <template 
                      v-else
                      #append-inner
                    >
                      <v-icon
                        
                        color="error"
                      >
                        clear
                      </v-icon>
                    </template>
                  </v-text-field>
                </v-col>

                <v-col
                  v-if="$config.customer_views"
                  xs="12"
                  sm="12"
                >
                  <v-combobox
                    v-model="customers"
                    dirty
                    :label="$t('Customers')"
                    chips
                    multiple
                    readonly
                  >
                    <template #selection="data">
                      <v-chip>
                        <strong>{{ data.item }}</strong>&nbsp;(customer)
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-col>
                <v-col
                  xs="12"
                  sm="12"
                  style=" padding-top: 0;
  padding-bottom: 0;"
                >
                  <v-combobox
                    v-model="profile.orgs"
                    dirty
                    :label="$t('Organizations')"
                    chips
                    multiple
                    readonly
                    variant="outlined"
                  >
                    <template #selection="data">
                      <v-chip>
                        <strong>{{ data.item }}</strong>&nbsp;(org)
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-col>
                <v-col
                  xs="12"
                  sm="12"
                  style=" padding-top: 0;
  padding-bottom: 0;"
                >
                  <v-combobox
                    v-model="profile.groups"
                    dirty
                    :label="$t('Groups')"
                    chips
                    multiple
                    readonly
                    variant="outlined"

                  >
                    <template #selection="data">
                      <v-chip>
                        <strong>{{ data.item }}</strong>&nbsp;(group)
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-col>
                <v-col
                  xs="12"
                  sm="12"
                  style=" padding-top: 0;
  padding-bottom: 0;"
                >
                  <v-combobox
                    v-model="profile.roles"
                    dirty
                    :label="$t('Roles')"
                    chips
                    multiple
                    readonly
                    variant="outlined"

                  >
                    <template #selection="data">
                      <v-chip>
                        <strong>{{ data.item }}</strong>&nbsp;(role)
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-col>
                <v-col
                  xs="12"
                  sm="12"
                  style=" padding-top: 0;
  padding-bottom: 0;"
                >
                  <v-combobox
                    v-model="scopes"
                    dirty
                    :label="$t('Scopes')"
                    chips
                    multiple
                    readonly
                    variant="outlined"
                    :append-icon="$vuetify.icons.dropdown"
                  >
                    <template #selection="data">
                      <v-chip>
                        <strong>{{ data.item }}</strong>&nbsp;(scope)
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              variant="fab"
              disabled
            >
              {{ $t('Cancel') }}
            </v-btn>
            <v-btn
              variant="fab"
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
