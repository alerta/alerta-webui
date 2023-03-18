<template>
  <div>
    <v-dialog
      v-model="dialog"
      max-width="500px"
    >
      <v-form ref="form">
        <v-card>
          <v-card-title>
            <span class="text-h5">
              {{ formTitle }}
            </span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-row wrap>
                <v-col
                  xs="12"
                >
                  <v-tooltip
                    :key="copyIconText"
                    end
                  >
                    <template #activator>
                      <v-text-field
                        v-if="editedItem.key"
                        v-model="editedItem.key"
                        :label="$t('APIKey')"
                        readonly
                        monospace
                        append-icon="content_copy"
                        @click:append="clipboardCopy(editedItem.key)"
                      />
                    </template>
                    <span>{{ copyIconText }}</span>
                  </v-tooltip>
                </v-col>
                <v-col
                  v-if="!isAdmin"
                  xs="12"
                >
                  <v-text-field
                    v-model="editedItem.user"
                    :label="$t('User')"
                    readonly
                  />
                </v-col>
                <v-col
                  v-if="isAdmin"
                  xs="12"
                >
                  <v-select
                    v-model="editedItem.user"
                    :items="users"
                    :label="$t('User')"
                  />
                </v-col>
                <v-col
                  v-if="$config.customer_views"
                  xs="12"
                >
                  <v-select
                    v-model="editedItem.customer"
                    :items="allowedCustomers"
                    :label="$t('Customer')"
                  />
                </v-col>
                <v-col
                  xs="12"
                >
                  <v-autocomplete
                    v-model="editedItem.scopes"
                    :items="allowedScopes"
                    :label="$t('Scopes')"
                    chips
                    clearable
                    variant="solo"
                    multiple
                  >
                    <template
                      #selection="data"
                    >
                      <v-chip
                        :value="data.selected"
                        closable
                      >
                        <strong>{{ data.item }}</strong>&nbsp;
                        <span>({{ $t('scope') }})</span>
                      </v-chip>
                    </template>
                  </v-autocomplete>
                </v-col>
                <v-col
                  xs="12"
                >
                  <v-menu
                    v-model="menu"
                    :close-on-content-click="false"
                    :offset="40"
                    lazy
                    transition="scale-transition"
                    full-width
                    min-width="290px"
                  >
                    <template #activator>
                      <v-text-field
                        v-model="pickerDate"
                        :label="$t('Expires')"
                        prepend-icon="event"
                        readonly
                      />
                    </template>

                    <v-date-picker
                      v-model="pickerDate"
                      :min="new Date().toISOString().slice(0, 10)"
                      @update:model-value="menu = false"
                    />
                  </v-menu>
                </v-col>
                <v-col
                  xs="12"
                >
                  <v-text-field
                    v-model.trim="editedItem.text"
                    label="Comment"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="blue-darken-1"
              variant="flat"
              @click="close"
            >
              {{ $t('Cancel') }}
            </v-btn>
            <v-btn
              color="blue-darken-1"
              variant="flat"
              @click="save"
            >
              {{ $t('Save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-card>
      <v-card-title class="text-h6">
        {{ $t('APIKeys') }}
        <v-spacer />
        <v-btn-toggle
          v-model="status"
          class="bg-transparent"
          multiple
        >
          <v-btn
            value="active"
            variant="flat"
          >
            <v-tooltip location="bottom">
              <template #activator="{props}">
                <v-icon v-bind="props">
                  check_circle
                </v-icon>
              </template>
              <span>{{ $t('Active') }}</span>
            </v-tooltip>
          </v-btn>
          <v-btn
            value="expired"
            variant="flat"
          >
            <v-tooltip location="bottom">
              <template #activator="{props}">
                <v-icon v-bind="props">
                  error_outline
                </v-icon>
              </template>
              <span>{{ $t('Expired') }}</span>
            </v-tooltip>
          </v-btn>
        </v-btn-toggle>
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="search"
          :label="$t('Search')"
          single-line
          hide-details
        />
      </v-card-title>

      <v-data-table
        :headers="computedHeaders"
        :items="keys"
        :rows-per-page-items="rowsPerPageItems"
        v-model:pagination="pagination"
        class="px-2"
        :search="search"
        :loading="isLoading"
        must-sort
        sort-icon="arrow_drop_down"
        item-props
      >
        <template #item="{item}">
          <tr>
            <td
              class="text-no-wrap"
              monospace
            >
              {{ item.props.key }}
              <v-tooltip
                :key="copyIconText"
                location="top"
              >
                <template #activator="{props}">
                  <v-icon
                    v-bind="props"
                    :value="item.props.key"
                    style="font-size: 16px;"
                    @click="clipboardCopy(item.props.key)"
                  >
                    content_copy
                  </v-icon>
                </template>
                <span>{{ copyIconText }}</span>
              </v-tooltip>
            </td>
            <td>
              <v-tooltip
                v-if="!isExpired(item.props.expireTime)"
                location="top"
              >
                <template #activator="{props}">
                  <v-icon
                    v-bind="props"
                    color="primary"
                    size="small"
                  >
                    check_circle
                  </v-icon>
                </template>
                <span>{{ $t('Active') }}</span>
              </v-tooltip>
              <v-tooltip
                v-if="isExpired(item.props.expireTime)"
                location="top"
              >
                <template #activator="{props}">
                  <v-icon
                    v-bind="props"
                    color="error"
                    size="small"
                  >
                    error_outline
                  </v-icon>
                </template>
                <span>{{ $t('Expired') }}</span>
              </v-tooltip>
            </td>
            <td>{{ item.props.user }}</td>
            <td>
              <v-chip
                v-for="scope in item.props.scopes"
                :key="scope"
                small
              >
                <strong>{{ scope }}</strong>&nbsp;
                <span>({{ $t('scope') }})</span>
              </v-chip>
            </td>
            <td>{{ item.props.text }}</td>
            <td>
              <date-time
                :value="item.props.expireTime"
                format="mediumDate"
              />
            </td>
            <td
              class="text-center"
            >
              {{ item.props.count }}
            </td>
            <td>{{ this.$filters.timeago(item.props.lastUsedTime) }}</td> 
            <td
              v-if="$config.customer_views"
            >
              {{ item.props.customer }}
            </td>
            <td class="text-no-wrap">
              <v-btn
                v-has-perms.disable="'write:keys'"
                icon
                class="btn--plain mr-0"
                @click="editItem(item.props)"
              >
                <v-icon
                  size="small"
                  color="grey-darken-3"
                >
                  edit
                </v-icon>
              </v-btn>
              <v-btn
                v-has-perms.disable="'admin:keys'"
                icon
                class="btn--plain mx-0"
                @click="deleteItem(item.props)"
              >
                <v-icon
                  size="small"
                  color="grey-darken-3"
                >
                  delete
                </v-icon>
              </v-btn>
              <v-btn
                v-has-perms.disable="'admin:keys'"
                :href="`data:text/plain;base64,${toData(item.props)}`"
                :download="`key_${item.props.id}.json`"
                icon
                class="btn--plain mx-0"
              >
                <v-icon
                  size="small"
                  color="grey-darken-3"
                >
                  get_app
                </v-icon>
              </v-btn>
            </td>
          </tr>
        </template>
        <template #no-data>
          <v-alert
            :value="true"
            color="error"
            icon="warning"
          >
            {{ $t('NoDisplay') }}
          </v-alert>
        </template>
        <template #no-results>
          <v-alert
            :value="true"
            color="error"
            icon="warning"
          >
            {{ $t('SearchNoResult1') }} "{{ search }}" {{ $t('SearchNoResult2') }}
          </v-alert>
        </template>
      </v-data-table>
    </v-card>

    <list-button-add
      perms="write:keys"
      @add-to-list="dialog = true"
    />
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
  data: vm => ({
    descending: true,
    page: 1,
    rowsPerPageItems: [10, 20, 30, 40, 50],
    pagination: {
      sortBy: 'lastUsedTime',
      rowsPerPage: 20
    },
    status: ['active', 'expired'],
    search: '',
    dialog: false,
    headers: [
      { text: i18n.global.t('APIKey'), value: 'key', sortable: false },
      { text: '', value: 'expireTime' },
      { text: i18n.global.t('User'), value: 'user' },
      { text: i18n.global.t('Scopes'), value: 'scopes' },
      { text: i18n.global.t('Description'), value: 'text' },
      { text: i18n.global.t('Expires'), value: 'expireTime' },
      { text: i18n.global.t('Count'), value: 'count' },
      { text: i18n.global.t('LastUsed'), value: 'lastUsedTime' },
      { text: i18n.global.t('Customer'), value: 'customer' },
      { text: i18n.global.t('Actions'), value: 'name', sortable: false }
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
    copyIconText: i18n.global.t('Copy')
  }),
  computed: {
    computedHeaders() {
      return this.headers.filter(h => !this.$config.customer_views ? h.value != 'customer' : true)
    },
    keys() {
      return this.$store.state.keys.keys.filter(k => !this.status || this.status.includes(this.statusFromExpireTime(k)))
    },
    users() {
      return this.$store.state.users.users.map(u => u.login)
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
      return !this.editedId ? i18n.global.t('NewApiKey') : i18n.global.t('EditApiKey')
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
    debug: obj => console.log(obj),
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
      let endOfDay = new Date(date)
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
      confirm(i18n.global.t('ConfirmDelete')) &&
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
      this.copyIconText = i18n.global.t('Copied')
      let textarea = document.createElement('textarea')
      textarea.textContent = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setTimeout(() => {
        this.copyIconText = i18n.global.t('Copy')
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
