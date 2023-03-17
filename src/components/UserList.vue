<template>
  <div>
    <v-dialog
      v-model="dialog"
      max-width="550px"
    >
      <v-form
        ref="form"
        autocomplete="off"
      >
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
                  sm="6"
                  md="9"
                >
                  <v-text-field
                    v-model.trim="editedItem.name"
                    :disabled="!isBasicAuth"
                    :label="$t('Name')"
                    :rules="[rules.required]"
                    required
                  />
                </v-col>
                <v-col
                  xs="12"
                  sm="6"
                  md="3"
                >
                  <v-switch
                    v-model="editedItem.status"
                    :true-value="'active'"
                    :false-value="'inactive'"
                    :label="$t('Active')"
                  />
                </v-col>
                <v-col
                  xs="12"
                  sm="6"
                  md="9"
                >
                  <v-text-field
                    v-model.trim="editedItem.login"
                    :disabled="!isBasicAuth"
                    :label="$t('Login')"
                    :rules="[rules.required]"
                    required
                  />
                </v-col>
                <v-col
                  xs="12"
                  sm="6"
                  md="9"
                >
                  <v-text-field
                    v-model.trim="editedItem.email"
                    :disabled="!isBasicAuth"
                    :label="$t('Email')"
                    :rules="[rules.required]"
                    required
                  />
                </v-col>
                <v-col
                  xs="12"
                  sm="6"
                  md="3"
                >
                  <v-checkbox
                    v-model="editedItem.email_verified"
                    :label="$t('Verified')"
                  />
                </v-col>

                <v-col
                  xs="12"
                  sm="6"
                >
                  <v-text-field
                    v-show="isBasicAuth"
                    v-model="editedItem.password"
                    :append-icon="
                      showPassword ? 'visibility_off' : 'visibility'
                    "
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
                    append-icon="visibility"
                    :label="$t('Password')"
                  />
                </v-col>
                <v-col
                  xs="12"
                  sm="6"
                >
                  <v-text-field
                    v-show="isBasicAuth"
                    :append-icon="
                      showPassword ? 'visibility_off' : 'visibility'
                    "
                    :rules="isBasicAuth ? [rules.passwordMatch] : []"
                    :type="showPassword ? 'text' : 'password'"
                    name="input-10-2"
                    :label="$t('ConfirmPassword')"
                    :model-value="editedItem.confirmPassword"
                    autocomplete="new-password"
                    @click:append="showPassword = !showPassword"
                  />
                  <v-text-field
                    v-show="!isBasicAuth"
                    disabled
                    append-icon="visibility"
                    :label="$t('ConfirmPassword')"
                  />
                </v-col>

                <v-col
                  xs="12"
                  sm="6"
                  md="12"
                >
                  <v-select
                    v-model="userGroups"
                    :items="allGroups"
                    :label="$t('Groups')"
                    item-title="name"
                    item-value="id"
                    chips
                    variant="solo"
                    multiple
                    :disabled="!editedId"
                  >
                    <template #selection="data">
                      <v-chip
                        :value="data.selected"
                        closable
                      >
                        <strong>{{ data.item.name }}</strong>&nbsp;
                        <span>({{ $t('Group') }})</span>
                      </v-chip>
                    </template>
                  </v-select>
                </v-col>

                <v-col
                  xs="12"
                  sm="6"
                  md="12"
                >
                  <v-autocomplete
                    v-model="editedItem.roles"
                    :items="allowedRoles"
                    :label="$t('Roles')"
                    chips
                    clearable
                    variant="solo"
                    multiple
                  >
                    <template #selection="data">
                      <v-chip
                        :value="data.selected"
                        closable
                      >
                        <strong>{{ data.item }}</strong>&nbsp;
                        <span>({{ $t('role') }})</span>
                      </v-chip>
                    </template>
                  </v-autocomplete>
                </v-col>
                <v-col
                  xs="12"
                  sm="6"
                  md="12"
                >
                  <v-text-field
                    v-model.trim="editedItem.text"
                    :label="$t('Comment')"
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
              @click="validate"
            >
              {{ $t('Save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-card>
      <v-card-title class="text-h6">
        {{ $t('Users') }}
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
            value="inactive"
            variant="flat"
          >
            <v-tooltip location="bottom">
              <template #activator="{props}">
                <v-icon v-bind="props">
                  block
                </v-icon>
              </template>
              <span>{{ $t('Inactive') }}</span>
            </v-tooltip>
          </v-btn>
        </v-btn-toggle>
        <v-spacer />
        <v-col
          xs="3"
          class="mr-3 pt-3"
        >
          <v-autocomplete
            v-model="wantRoles"
            :items="allowedRoles"
            :label="$t('Roles')"
            chips
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
                <span>({{ $t('role') }})</span>
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>
        <v-col xs="6">
          <v-text-field
            v-model="search"
            append-icon="search"
            :label="$t('Search')"
            single-line
            hide-details
          />
        </v-col>
      </v-card-title>

      <v-data-table
        :header="headers"
        :item="users"
        :rows-per-page-items="rowsPerPageItems"
        v-model:pagination="pagination"
        class="px-2"
        :search="search"
        :custom-filter="customFilter"
        :loading="isLoading"
        must-sort
        sort-icon="arrow_drop_down"
      >
        <template #items="props">
          <td>{{ 'props.item.name' }}</td>
          <td class="text-center">
            <v-tooltip location="top">
              <template #activator="{props}">
                <v-icon
                  v-bind:="props"
                  :color="props.item.status == 'active' ? 'primary' : ''"
                  @click="toggleUserStatus(props.item)"
                >
                  {{
                    props.item.status === 'active' ? 'toggle_on' : 'toggle_off'
                  }}
                </v-icon>
              </template>
              <span>{{ $filters.capitalize(props.item.status) }}</span>
            </v-tooltip>
          </td>
          <td>{{ props.item.login }}</td>
          <td>{{ props.item.email }}</td>
          <td class="text-center">
            <v-tooltip location="top">
              <template #activator="{props}">
                <v-icon
                  v-bind="props"
                  @click="toggleEmailVerified(props.item)"
                >
                  {{
                    props.item.email_verified
                      ? 'check_box'
                      : 'check_box_outline_blank'
                  }}
                </v-icon>
              </template>
              <span>
                {{
                  props.item.email_verified
                    ? $t('EmailVerified')
                    : $t('EmailNotVerified')
                }}
              </span>
            </v-tooltip>
          </td>
          <td>
            <v-chip
              v-for="role in props.item.roles"
              :key="role"
            >
              <strong>{{ role }}</strong>&nbsp;
              <span>({{ $t('role') }})</span>
            </v-chip>
          </td>
          <td class="text-right">
            <date-time
              :value="props.item.createTime"
              format="mediumDate"
            />
          </td>
          <td class="text-right">
            <date-time
              v-if="props.item.lastLogin"
              :value="props.item.lastLogin"
              format="mediumDate"
            />
          </td>
          <td class="text-right">
            {{ props.item.text }}
          </td>
          <td class="text-no-wrap">
            <v-btn
              v-has-perms.disable="'admin:users'"
              icon
              class="btn--plain mr-0"
              @click="editItem(props.item)"
            >
              <v-icon
                size="small"
                color="grey-darken-3"
              >
                edit
              </v-icon>
            </v-btn>
            <v-btn
              v-has-perms.disable="'admin:users'"
              icon
              class="btn--plain mx-0"
              @click="deleteItem(props.item)"
            >
              <v-icon
                size="small"
                color="grey-darken-3"
              >
                delete
              </v-icon>
            </v-btn>
          </td>
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
            {{ $t('SearchNoResult1') }} "{{ search }}" {{ $t('SearchNoResult2') }}.
          </v-alert>
        </template>
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
  data: vm => ({
    descending: true,
    page: 1,
    rowsPerPageItems: [10, 20, 30, 40, 50],
    pagination: {
      sortBy: 'name',
      rowsPerPage: 20
    },
    // totalItems: number,
    status: ['active', 'inactive'],
    search: '',
    wantRoles: [],
    dialog: false,
    headers: [
      { text: i18n.global.t('Name'), value: 'name' },
      { text: i18n.global.t('Status'), value: 'status' },
      { text: i18n.global.t('Login'), value: 'login' },
      { text: i18n.global.t('Email'), value: 'email' },
      { text: i18n.global.t('VerifiedOrNot'), value: 'email_verified' },
      { text: i18n.global.t('Roles'), value: 'roles' },
      { text: i18n.global.t('Created'), value: 'createTime' },
      { text: i18n.global.t('LastLogin'), value: 'lastLogin' },
      { text: i18n.global.t('Comment'), value: 'text' },
      { text: i18n.global.t('Actions'), value: 'name', sortable: false }
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
      required: v => !!v || i18n.global.t('Required'),
      min: v => (vm.editedId && v == null) || (v && v.length >= 6) || i18n.global.t('Min6Char'),
      passwordMatch: v =>
        (vm.editedId && v == null) || (v && v == vm.editedItem.password) || i18n.global.t('PasswordNotMatch')
    }
  }),
  computed: {
    isBasicAuth() {
      return this.$config.provider == 'basic'
    },
    users() {
      return this.$store.state.users.users.filter(u => !this.status || this.status.includes(u.status))
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
      // added filtering of empty strings
      let rawRoles = this.$store.getters['perms/roles']
      const result = rawRoles.filter(word => word != '')
      return result
    },
    isLoading() {
      return this.$store.state.users.isLoading
    },
    formTitle() {
      return !this.editedId ? i18n.global.t('NewUser') : i18n.global.t('EditUser')
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
      items = items.filter(item =>
        this.wantRoles.length > 0 ? item.roles.some(x => this.wantRoles.includes(x)) : item
      )

      if (search.trim() === '') return items

      return items.filter(i => (
        Object.keys(i).some(j => filter(i[j], search))
      ))
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
      confirm(i18n.global.t('ConfirmDelete')) &&
        this.$store.dispatch('users/deleteUser', item.id)
    },
    close() {
      this.dialog = false
      setTimeout(() => {
        this.$refs.form.resetValidation()
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedId = null
      }, 100)
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
          const addedGroups = this.editedGroups.filter(g => !this.userGroups.map(g => g.id).includes(g))
          const removedGroups = this.userGroups.map(g => g.id).filter(g => !this.editedGroups.includes(g))
          addedGroups.map(groupId => this.$store.dispatch('groups/addUserToGroup', [groupId, this.editedId]))
          removedGroups.map(groupId => this.$store.dispatch('groups/removeUserFromGroup', [groupId, this.editedId]))
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
