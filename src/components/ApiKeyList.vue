<template>
  <div>
    <v-dialog v-model="dialog" max-width="500px">
      <v-form ref="form">
        <v-card>
          <v-card-title>
            <span class="headline">
              {{ formTitle }}
            </span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12>
                  <v-tooltip :key="copyIconText" right>
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        v-if="editedItem.key"
                        v-on="on"
                        v-model="editedItem.key"
                        :label="$t('APIKey')"
                        readonly
                        monospace
                        append-icon="mdi-copy"
                        @click:append="clipboardCopy(editedItem.key)"
                      />
                    </template>
                    <span>{{ copyIconText }}</span>
                  </v-tooltip>
                </v-flex>
                <v-flex v-if="!isAdmin" xs12>
                  <v-text-field
                    v-model="editedItem.user"
                    :label="$t('User')"
                    readonly
                  />
                </v-flex>
                <v-flex v-if="isAdmin" xs12>
                  <v-select
                    v-model="editedItem.user"
                    :items="users"
                    :label="$t('User')"
                  />
                </v-flex>
                <v-flex v-if="$config.customer_views" xs12>
                  <v-select
                    v-model="editedItem.customer"
                    :items="allowedCustomers"
                    :label="$t('Customer')"
                  />
                </v-flex>
                <v-flex xs12>
                  <v-autocomplete
                    v-model="editedItem.scopes"
                    :items="allowedScopes"
                    :label="$t('Scopes')"
                    chips
                    clearable
                    solo
                    multiple
                  >
                    <template slot="selection" slot-scope="data">
                      <v-chip :selected="data.selected" close>
                        <strong>{{ data.item }}</strong
                        >&nbsp;
                        <span>({{ $t('scope') }})</span>
                      </v-chip>
                    </template>
                  </v-autocomplete>
                </v-flex>
                <v-flex xs12>
                  <v-menu
                    v-model="menu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        v-on="on"
                        v-model="pickerDate"
                        :label="$t('Expires')"
                        prepend-icon="mdi-calendar"
                        readonly
                      />
                    </template>
                    <v-date-picker
                      v-model="pickerDate"
                      :min="new Date().toISOString().slice(0, 10)"
                      @input="menu = false"
                    />
                  </v-menu>
                </v-flex>
                <v-flex xs12>
                  <v-text-field
                    v-model.trim="editedItem.text"
                    label="Comment"
                  />
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn color="blue darken-1" text @click="close">
              {{ $t('Cancel') }}
            </v-btn>
            <v-btn color="blue darken-1" text @click="save">
              {{ $t('Save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-card>
      <v-card-title class="title">
        {{ $t('APIKeys') }}
        <v-spacer />
        <v-btn-toggle v-model="status" class="transparent" multiple>
          <v-btn value="active" text>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on">mdi-check-circle</v-icon>
              </template>
              <span>{{ $t('Active') }}</span>
            </v-tooltip>
          </v-btn>
          <v-btn value="expired" text>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on">mdi-alert-circle-outline</v-icon>
              </template>
              <span>{{ $t('Expired') }}</span>
            </v-tooltip>
          </v-btn>
        </v-btn-toggle>
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          :label="$t('Search')"
          single-line
          hide-details
        />
      </v-card-title>

      <v-data-table
        :headers="computedHeaders"
        :items="keys"
        :footer-props="{ itemsPerPageOptions }"
        :options.sync="pagination"
        class="px-2"
        :search="search"
        :loading="isLoading"
        must-sort
        :header-props="{ sortIcon: 'mdi-chevron-down' }"
      >
        <template slot="items" slot-scope="props">
          <td class="text-no-wrap" monospace>
            {{ props.item.key }}
            <v-tooltip :key="copyIconText" top>
              <template v-slot:activator="{ on }">
                <v-icon
                  v-on="on"
                  :value="props.item.key"
                  style="font-size: 16px"
                  @click="clipboardCopy(props.item.key)"
                >
                  mdi-copy
                </v-icon>
              </template>
              <span>{{ copyIconText }}</span>
            </v-tooltip>
          </td>
          <td>
            <v-tooltip v-if="!isExpired(props.item.expireTime)" top>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on" color="primary" small>
                  mdi-check-circle
                </v-icon>
              </template>
              <span>{{ $t('Active') }}</span>
            </v-tooltip>
            <v-tooltip v-if="isExpired(props.item.expireTime)" top>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on" color="error" small>
                  mdi-alert-circle-outline
                </v-icon>
              </template>
              <span>{{ $t('Expired') }}</span>
            </v-tooltip>
          </td>
          <td>{{ props.item.user }}</td>
          <td>
            <v-chip v-for="scope in props.item.scopes" :key="scope" small>
              <strong>{{ scope }}</strong>
              &nbsp;
              <span>({{ $t('scope') }})</span>
            </v-chip>
          </td>
          <td>{{ props.item.text }}</td>
          <td>
            <date-time :value="props.item.expireTime" format="mediumDate" />
          </td>
          <td class="text-sm-center">
            {{ props.item.count }}
          </td>
          <td>{{ props.item.lastUsedTime | timeago }}</td>
          <td v-if="$config.customer_views">
            {{ props.item.customer }}
          </td>
          <td class="text-no-wrap">
            <v-btn
              v-has-perms.disable="'write:keys'"
              icon
              class="btn--plain mr-0"
              @click="editItem(props.item)"
            >
              <v-icon small color="grey darken-3">mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              v-has-perms.disable="'admin:keys'"
              icon
              class="btn--plain mx-0"
              @click="deleteItem(props.item)"
            >
              <v-icon small color="grey darken-3">mdi-delete</v-icon>
            </v-btn>
            <v-btn
              v-has-perms.disable="'admin:keys'"
              :href="`data:text/plain;base64,${toData(props.item)}`"
              :download="`key_${props.item.id}.json`"
              icon
              class="btn--plain mx-0"
            >
              <v-icon small color="grey darken-3">mdi-download</v-icon>
            </v-btn>
          </td>
        </template>
        <template slot="no-data">
          <v-alert :value="true" color="error" icon="mdi-alert">
            {{ $t('NoDisplay') }}
          </v-alert>
        </template>
        <v-alert slot="no-results" :value="true" color="error" icon="mdi-alert">
          {{ $t('SearchNoResult1') }} "{{ search }}" {{ $t('SearchNoResult2') }}
        </v-alert>
      </v-data-table>
    </v-card>

    <list-button-add perms="write:keys" @add-to-list="dialog = true" />
  </div>
</template>

<script>
import DateTime from './lib/DateTime'
import ListButtonAdd from './lib/ListButtonAdd'
import utils from '@/common/utils'
import moment from 'moment'
import i18n from '@/plugins/i18n'

export default {
  components: {
    DateTime,
    ListButtonAdd
  },
  data: (vm) => ({
    itemsPerPageOptions: [10, 20, 30, 40, 50],
    pagination: {
      page: 1,
      sortBy: ['lastUsedTime'],
      sortDesc: [true],
      itemsPerPage: 20
    },
    status: ['active', 'expired'],
    search: '',
    dialog: false,
    headers: [
      { text: i18n.t('APIKey'), value: 'key', sortable: false },
      { text: '', value: 'expireTime' },
      { text: i18n.t('User'), value: 'user' },
      { text: i18n.t('Scopes'), value: 'scopes' },
      { text: i18n.t('Description'), value: 'text' },
      { text: i18n.t('Expires'), value: 'expireTime' },
      { text: i18n.t('Count'), value: 'count' },
      { text: i18n.t('LastUsed'), value: 'lastUsedTime' },
      { text: i18n.t('Customer'), value: 'customer' },
      { text: i18n.t('Actions'), value: 'name', sortable: false }
    ],
    editedId: null,
    editedItem: {
      key: '',
      user: vm.editedId ? null : vm.username(),
      text: '',
      customer: null,
      scopes: [],
      expireTime: null
    },
    menu: false,
    pickerDate: vm.defaultExpireTime(),
    defaultItem: {
      user: vm.editedId ? null : vm.username(),
      text: '',
      customer: null,
      scopes: [],
      expireTime: null
    },
    copyIconText: i18n.t('Copy')
  }),
  computed: {
    computedHeaders() {
      return this.headers.filter((h) =>
        !this.$config.customer_views ? h.value != 'customer' : true
      )
    },
    keys() {
      return this.$store.state.keys.keys.filter(
        (k) =>
          !this.status || this.status.includes(this.statusFromExpireTime(k))
      )
    },
    users() {
      return this.$store.state.users.users.map((u) => u.login)
    },
    allowedScopes() {
      return utils.getAllowedScopes(
        this.$store.getters['auth/scopes'],
        this.$store.state.perms.scopes
      )
    },
    allowedCustomers() {
      return this.$store.getters['customers/customers']
    },
    isAdmin() {
      return this.$store.getters['auth/isAdmin']
    },
    isLoading() {
      return this.$store.state.keys.isLoading
    },
    formTitle() {
      return !this.editedId ? i18n.t('NewApiKey') : i18n.t('EditApiKey')
    },
    refresh() {
      return this.$store.state.refresh
    }
  },
  watch: {
    dialog(val) {
      val || this.close()
    },
    refresh(val) {
      val || this.getApiKeys()
    }
  },
  created() {
    this.getApiKeys()
    this.getUsers()
    this.getScopes()
    this.getCustomers()
  },
  methods: {
    getApiKeys() {
      this.$store.dispatch('keys/getKeys')
    },
    getUsers() {
      this.$store.dispatch('users/getUsers')
    },
    getScopes() {
      this.$store.dispatch('perms/getScopes')
    },
    getCustomers() {
      this.$store.dispatch('customers/getCustomers')
    },
    defaultExpireTime() {
      return moment().add(1, 'Year').endOf('day').toISOString().slice(0, 10)
    },
    username() {
      return this.$store.getters['auth/getUsername']
    },
    endOfDay(date) {
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      return endOfDay.toISOString()
    },
    editItem(item) {
      this.editedId = item.id
      this.editedItem = Object.assign({}, item)
      this.pickerDate = item.expireTime.slice(0, 10)
      this.dialog = true
    },
    deleteItem(item) {
      confirm(i18n.t('ConfirmDelete')) &&
        this.$store.dispatch('keys/deleteKey', item.id)
    },
    close() {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.pickerDate = this.defaultExpireTime()
        this.editedId = null
      }, 300)
    },
    save() {
      if (this.editedId) {
        this.$store.dispatch('keys/updateKey', [
          this.editedId,
          {
            user: this.editedItem.user,
            scopes: this.editedItem.scopes,
            text: this.editedItem.text,
            expireTime: this.endOfDay(this.pickerDate),
            customer: this.editedItem.customer
          }
        ])
      } else {
        this.$store.dispatch(
          'keys/createKey',
          Object.assign(this.editedItem, {
            expireTime: this.endOfDay(this.pickerDate)
          })
        )
      }
      this.close()
    },
    isExpired(date) {
      return new Date().getTime() > new Date(date).getTime()
    },
    statusFromExpireTime(key) {
      return this.isExpired(key.expireTime) ? 'expired' : 'active'
    },
    clipboardCopy(text) {
      if (!window.isSecureContext || !navigator.clipboard) return
      navigator.clipboard.writeText(text)

      this.copyIconText = i18n.t('Copied')
      setTimeout(() => {
        this.copyIconText = i18n.t('Copy')
      }, 2000)
    },
    toData(item) {
      return btoa(JSON.stringify(item))
    }
  }
}
</script>

<style>
input[monospace],
td[monospace] {
  font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier,
    monospace;
}
</style>
