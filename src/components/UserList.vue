<template>
  <div>
    <v-dialog v-model="dialog" max-width="500px">
      <v-form ref="form" autocomplete="off">
        <v-card>
          <v-card-title>
            <span class="headline">
              {{ formTitle }}
            </span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm6 md9>
                  <v-text-field
                    v-model.trim="editedItem.name"
                    :disabled="!isBasicAuth"
                    :label="$t('Name')"
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>
                <v-flex xs12 sm6 md3>
                  <v-switch
                    v-model="editedItem.status"
                    :true-value="'active'"
                    :false-value="'inactive'"
                    :label="$t('Active')"
                  />
                </v-flex>
                <v-flex xs12 sm6 md9>
                  <v-text-field
                    v-model.trim="editedItem.login"
                    :disabled="!isBasicAuth"
                    :label="$t('Login')"
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>
                <v-flex xs12 sm6 md9>
                  <v-text-field
                    v-model.trim="editedItem.email"
                    :disabled="!isBasicAuth"
                    :label="$t('Email')"
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>
                <v-flex xs12 sm6 md3>
                  <v-checkbox
                    v-model="editedItem.email_verified"
                    :label="$t('Verified')"
                  />
                </v-flex>

                <v-flex xs12 sm6>
                  <v-text-field
                    v-show="isBasicAuth"
                    v-model="editedItem.password"
                    :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    :rules="isBasicAuth ? [rules.min] : []"
                    :type="showPassword ? 'text' : 'password'"
                    name="input-10-2"
                    :label="$t('Password')"
                    class="input-group--focused"
                    autocomplete="new-password"
                    @click:append="showPassword = !showPassword"
                  />
                  <v-text-field
                    v-show="!isBasicAuth"
                    disabled
                    append-icon="mdi-eye"
                    :label="$t('Password')"
                  />
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field
                    v-show="isBasicAuth"
                    :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    :rules="isBasicAuth ? [rules.passwordMatch] : []"
                    :type="showPassword ? 'text' : 'password'"
                    name="input-10-2"
                    :label="$t('ConfirmPassword')"
                    :value="editedItem.confirmPassword"
                    autocomplete="new-password"
                    @click:append="showPassword = !showPassword"
                  />
                  <v-text-field
                    v-show="!isBasicAuth"
                    disabled
                    append-icon="mdi-eye"
                    :label="$t('ConfirmPassword')"
                  />
                </v-flex>

                <v-flex xs12 sm6 md12>
                  <v-select
                    v-model="userGroups"
                    :items="allGroups"
                    :label="$t('Groups')"
                    item-text="name"
                    item-value="id"
                    chips
                    solo
                    multiple
                    :disabled="!editedId"
                  >
                    <template slot="selection" slot-scope="data">
                      <v-chip :input-value="data.selected" close>
                        <strong>{{ data.item.name }}</strong
                        >&nbsp;
                        <span>({{ $t('Group') }})</span>
                      </v-chip>
                    </template>
                  </v-select>
                </v-flex>

                <v-flex xs12 sm6 md12>
                  <v-autocomplete
                    v-model="editedItem.roles"
                    :items="allowedRoles"
                    :label="$t('Roles')"
                    chips
                    clearable
                    solo
                    multiple
                  >
                    <template slot="selection" slot-scope="data">
                      <v-chip :input-value="data.selected" close>
                        <strong>{{ data.item }}</strong
                        >&nbsp;
                        <span>({{ $t('role') }})</span>
                      </v-chip>
                    </template>
                  </v-autocomplete>
                </v-flex>
                <v-flex xs12 sm6 md12>
                  <v-text-field
                    v-model.trim="editedItem.text"
                    :label="$t('Comment')"
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
            <v-btn color="blue darken-1" text @click="validate">
              {{ $t('Save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-card>
      <v-card-title class="title">
        {{ $t('Users') }}
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
          <v-btn value="inactive" text>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on">mdi-cancel</v-icon>
              </template>
              <span>{{ $t('Inactive') }}</span>
            </v-tooltip>
          </v-btn>
        </v-btn-toggle>
        <v-spacer />
        <v-flex xs3 class="mr-3 pt-3">
          <v-autocomplete
            v-model="wantRoles"
            :items="allowedRoles"
            :label="$t('Roles')"
            chips
            multiple
            deletable-chips
          />
        </v-flex>
        <v-flex xs6>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            :label="$t('Search')"
            single-line
            hide-details
          />
        </v-flex>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="users"
        :footer-props="{ itemsPerPageOptions }"
        :options.sync="pagination"
        class="px-2"
        :search="search"
        :custom-filter="customFilter"
        :loading="isLoading"
        must-sort
        :header-props="{ sortIcon: 'mdi-chevron-down' }"
      >
        <template v-slot:item.createTime="{ item }">
          <date-time :value="item.createTime" format="mediumDate" />
        </template>
        <template v-slot:item.lastLogin="{ item }">
          <date-time
            v-if="item.lastLogin"
            :value="item.lastLogin"
            format="mediumDate"
          />
        </template>

        <template v-slot:item.roles="{ item }">
          <v-chip v-for="role in item.roles" :key="role">
            <strong>{{ role }}</strong>
            &nbsp;
            <span>({{ $t('role') }})</span>
          </v-chip>
        </template>

        <template v-slot:item.status="{ item }">
          <div class="text-sm-center">
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-icon
                  v-on="on"
                  :color="item.status == 'active' ? 'primary' : ''"
                  @click="toggleUserStatus(item)"
                >
                  {{
                    item.status === 'active'
                      ? 'mdi-toggle-switch'
                      : 'mdi-toggle-switch-off'
                  }}
                </v-icon>
              </template>
              <span>{{ item.status | capitalize }}</span>
            </v-tooltip>
          </div>
        </template>

        <template v-slot:item.email_verified="{ item }">
          <div class="text-sm-center">
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on" @click="toggleEmailVerified(item)">
                  {{
                    item.email_verified
                      ? 'mdi-checkbox-marked'
                      : 'mdi-checkbox-blank-outline'
                  }}
                </v-icon>
              </template>
              <span>
                {{
                  item.email_verified
                    ? $t('EmailVerified')
                    : $t('EmailNotVerified')
                }}
              </span>
            </v-tooltip>
          </div>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            v-has-perms.disable="'admin:users'"
            icon
            class="btn--plain mr-0"
            @click="editItem(item)"
          >
            <v-icon small>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            v-has-perms.disable="'admin:users'"
            icon
            class="btn--plain mx-0"
            @click="deleteItem(item)"
          >
            <v-icon small>mdi-delete</v-icon>
          </v-btn>
        </template>

        <template slot="no-data">
          <v-alert :value="true" color="error" icon="mdi-alert">
            {{ $t('NoDisplay') }}
          </v-alert>
        </template>
        <v-alert slot="no-results" :value="true" color="error" icon="mdi-alert">
          {{ $t('SearchNoResult1') }} "{{ search }}"
          {{ $t('SearchNoResult2') }}.
        </v-alert>
      </v-data-table>
    </v-card>

    <list-button-add
      v-show="isBasicAuth"
      perms="admin:users"
      @add-to-list="dialog = true"
    />
  </div>
</template>

<script>
import DateTime from './lib/DateTime'
import ListButtonAdd from './lib/ListButtonAdd'
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
      sortBy: ['name'],
      sortDesc: [true],
      itemsPerPage: 20
    },
    status: ['active', 'inactive'],
    search: '',
    wantRoles: [],
    dialog: false,
    headers: [
      { text: i18n.t('Name'), value: 'name' },
      { text: i18n.t('Status'), value: 'status' },
      { text: i18n.t('Login'), value: 'login' },
      { text: i18n.t('Email'), value: 'email' },
      { text: i18n.t('VerifiedOrNot'), value: 'email_verified' },
      { text: i18n.t('Roles'), value: 'roles' },
      { text: i18n.t('Created'), value: 'createTime' },
      { text: i18n.t('LastLogin'), value: 'lastLogin' },
      { text: i18n.t('Comment'), value: 'text' },
      { text: i18n.t('Actions'), value: 'actions', sortable: false }
    ],
    editedId: null,
    editedItem: {
      name: '',
      status: vm.editedId ? null : 'active',
      login: '',
      email: '',
      email_verified: false,
      password: '',
      confirmPassword: '',
      roles: [],
      text: ''
    },
    editedGroups: null,
    defaultItem: {
      name: '',
      status: vm.editedId ? null : 'active',
      login: '',
      email: '',
      email_verified: false,
      password: '',
      confirmPassword: '',
      roles: [],
      text: ''
    },
    showPassword: false,
    rules: {
      required: (v) => !!v || i18n.t('Required'),
      min: (v) =>
        (vm.editedId && v == null) ||
        (v && v.length >= 6) ||
        i18n.t('Min6Char'),
      passwordMatch: (v) =>
        (vm.editedId && v == null) ||
        (v && v == vm.editedItem.password) ||
        i18n.t('PasswordNotMatch')
    }
  }),
  computed: {
    isBasicAuth() {
      return this.$config.provider == 'basic'
    },
    users() {
      return this.$store.state.users.users.filter(
        (u) => !this.status || this.status.includes(u.status)
      )
    },
    allGroups() {
      return this.$store.state.groups.groups
    },
    userGroups: {
      get() {
        return this.$store.state.users.groups
      },
      set(value) {
        this.editedGroups = value
      }
    },
    allowedRoles() {
      return this.$store.getters['perms/roles']
    },
    isLoading() {
      return this.$store.state.users.isLoading
    },
    formTitle() {
      return !this.editedId ? i18n.t('NewUser') : i18n.t('EditUser')
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
      val || this.getUsers()
    }
  },
  created() {
    this.getUsers()
    this.getGroups()
    this.getPerms()
    this.editedItem = Object.assign({}, this.defaultItem)
  },
  methods: {
    getUsers() {
      this.$store.dispatch('users/getUsers')
    },
    getGroups() {
      this.$store.dispatch('groups/getGroups')
    },
    getUserGroups(userId) {
      this.$store.dispatch('users/getUserGroups', userId)
    },
    getPerms() {
      this.$store.dispatch('perms/getPerms')
    },
    filterByRoles(roles) {
      this.wantRoles = roles
    },
    customFilter(items, search, filter) {
      items = items.filter((item) =>
        this.wantRoles.length > 0
          ? item.roles.some((x) => this.wantRoles.includes(x))
          : item
      )

      if (search.trim() === '') return items

      return items.filter((i) =>
        Object.keys(i).some((j) => filter(i[j], search))
      )
    },
    toggleUserStatus(item) {
      this.$store.dispatch('users/setUserStatus', [
        item.id,
        item.status === 'active' ? 'inactive' : 'active'
      ])
    },
    toggleEmailVerified(item) {
      this.$store.dispatch('users/setEmailVerified', [
        item.id,
        !item.email_verified
      ])
    },
    editItem(item) {
      this.editedId = item.id
      this.editedItem = Object.assign({}, item)
      this.getUserGroups(item.id)
      this.editedGroups = null
      this.$refs.form.resetValidation()
      this.dialog = true
    },
    deleteItem(item) {
      confirm(i18n.t('ConfirmDelete')) &&
        this.$store.dispatch('users/deleteUser', item.id)
    },
    close() {
      this.dialog = false
      setTimeout(() => {
        this.$refs.form.resetValidation()
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedId = null
      }, 300)
    },
    validate() {
      if (this.$refs.form.validate()) {
        this.$refs.form.resetValidation()
        this.save()
      }
    },
    save() {
      if (this.editedId) {
        this.$store.dispatch('users/updateUser', [
          this.editedId,
          {
            name: this.editedItem.name,
            email: this.editedItem.email,
            password: this.editedItem.password,
            status: this.editedItem.status,
            roles: this.editedItem.roles,
            text: this.editedItem.text,
            email_verified: this.editedItem.email_verified
          }
        ])
        if (this.editedGroups) {
          const addedGroups = this.editedGroups.filter(
            (g) => !this.userGroups.map((g) => g.id).includes(g)
          )
          const removedGroups = this.userGroups
            .map((g) => g.id)
            .filter((g) => !this.editedGroups.includes(g))
          addedGroups.map((groupId) =>
            this.$store.dispatch('groups/addUserToGroup', [
              groupId,
              this.editedId
            ])
          )
          removedGroups.map((groupId) =>
            this.$store.dispatch('groups/removeUserFromGroup', [
              groupId,
              this.editedId
            ])
          )
        }
      } else {
        this.$store.dispatch('users/createUser', this.editedItem)
      }
      this.close()
    }
  }
}
</script>

<style></style>
