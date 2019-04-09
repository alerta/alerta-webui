<template>
  <div>
    <v-dialog
      v-model="dialog"
      max-width="500px"
    >
      <v-form
        ref="form"
        autocomplete="off"
      >
        <v-card>
          <v-card-title>
            <span class="headline">
              {{ formTitle }}
            </span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex
                  xs12
                  sm6
                  md9
                >
                  <v-text-field
                    v-model="editedItem.name"
                    :disabled="!isBasicAuth"
                    label="Name"
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>
                <v-flex
                  xs12
                  sm6
                  md3
                >
                  <v-switch
                    v-model="editedItem.status"
                    :true-value="'active'"
                    :false-value="'inactive'"
                    label="Active"
                  />
                </v-flex>
                <v-flex
                  xs12
                  sm6
                  md9
                >
                  <v-text-field
                    v-model="editedItem.email"
                    :disabled="!isBasicAuth"
                    label="Email"
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>
                <v-flex
                  xs12
                  sm6
                  md3
                >
                  <v-checkbox
                    v-model="editedItem.email_verified"
                    label="Verified"
                  />
                </v-flex>

                <v-flex
                  xs12
                  sm6
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
                    label="Password"
                    class="input-group--focused"
                    autocomplete="new-password"
                    @click:append="showPassword = !showPassword"
                  />
                  <v-text-field
                    v-show="!isBasicAuth"
                    disabled
                    append-icon="visibility"
                    label="Password"
                  />
                </v-flex>
                <v-flex
                  xs12
                  sm6
                >
                  <v-text-field
                    v-show="isBasicAuth"
                    :append-icon="
                      showPassword ? 'visibility_off' : 'visibility'
                    "
                    :rules="isBasicAuth ? [rules.passwordMatch] : []"
                    :type="showPassword ? 'text' : 'password'"
                    name="input-10-2"
                    label="Confirm Password"
                    :value="editedItem.confirmPassword"
                    autocomplete="new-password"
                    @click:append="showPassword = !showPassword"
                  />
                  <v-text-field
                    v-show="!isBasicAuth"
                    disabled
                    append-icon="visibility"
                    label="Confirm Password"
                  />
                </v-flex>

                <v-flex
                  xs12
                  sm6
                  md12
                >
                  <v-select
                    v-model="userGroups"
                    :items="allGroups"
                    label="Groups"
                    item-text="name"
                    item-value="id"
                    chips
                    solo
                    multiple
                    :disabled="!editedId"
                  >
                    <template
                      slot="selection"
                      slot-scope="data"
                    >
                      <v-chip
                        :selected="data.selected"
                        close
                      >
                        <strong>{{ data.item.name }}</strong>&nbsp;
                        <span>(group)</span>
                      </v-chip>
                    </template>
                  </v-select>
                </v-flex>

                <v-flex
                  xs12
                  sm6
                  md12
                >
                  <v-combobox
                    v-model="editedItem.roles"
                    :items="allowedRoles"
                    label="Roles"
                    chips
                    clearable
                    solo
                    multiple
                  >
                    <template
                      slot="selection"
                      slot-scope="data"
                    >
                      <v-chip
                        :selected="data.selected"
                        close
                      >
                        <strong>{{ data.item }}</strong>&nbsp;
                        <span>(role)</span>
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-flex>
                <v-flex
                  xs12
                  sm6
                  md12
                >
                  <v-text-field
                    v-model="editedItem.text"
                    label="Comment"
                  />
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="blue darken-1"
              flat
              @click="close"
            >
              Cancel
            </v-btn>
            <v-btn
              color="blue darken-1"
              flat
              @click="validate"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-card>
      <v-card-title class="title">
        Users
        <v-spacer />
        <v-flex
          xs3
          class="mr-3 pt-3"
        >
          <v-combobox
            v-model="wantRoles"
            :items="allowedRoles"
            label="Roles"
            chips
            multiple
          >
            <template
              slot="selection"
              slot-scope="data"
            >
              <v-chip
                :selected="data.selected"
                close
              >
                <strong>{{ data.item }}</strong>&nbsp;
                <span>(role)</span>
              </v-chip>
            </template>
          </v-combobox>
        </v-flex>
        <v-flex xs6>
          <v-text-field
            v-model="search"
            append-icon="search"
            label="Search"
            single-line
            hide-details
          />
        </v-flex>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="users"
        :rows-per-page-items="rowsPerPageItems"
        :pagination.sync="pagination"
        class="px-2"
        :search="search"
        :custom-filter="customFilter"
        :loading="isLoading"
        must-sort
        sort-icon="arrow_drop_down"
      >
        <template
          slot="items"
          slot-scope="props"
        >
          <td>{{ props.item.name }}</td>
          <td class="text-xs-center">
            <v-tooltip top>
              <v-icon
                slot="activator"
                :color="props.item.status == 'active' ? 'primary' : ''"
                @click="toggleUserStatus(props.item)"
              >
                {{
                  props.item.status === 'active' ? 'toggle_on' : 'toggle_off'
                }}
              </v-icon>
              <span>{{ props.item.status | capitalize }}</span>
            </v-tooltip>
          </td>
          <td>{{ props.item.email }}</td>
          <td class="text-xs-center">
            <v-tooltip top>
              <v-icon
                slot="activator"
                @click="toggleEmailVerified(props.item)"
              >
                {{
                  props.item.email_verified
                    ? 'check_box'
                    : 'check_box_outline_blank'
                }}
              </v-icon>
              <span>
                {{
                  props.item.email_verified
                    ? 'Email Verified'
                    : 'Email not verified'
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
              <span>(role)</span>
            </v-chip>
          </td>
          <td class="text-xs-right">
            <date-time
              :value="props.item.createTime"
              format="mediumDate"
            />
          </td>
          <td class="text-xs-right">
            <date-time
              v-if="props.item.lastLogin"
              :value="props.item.lastLogin"
              format="mediumDate"
            />
          </td>
          <td class="text-xs-right">
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
                small
                color="grey darken-3"
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
                small
                color="grey darken-3"
              >
                delete
              </v-icon>
            </v-btn>
          </td>
        </template>
        <template slot="no-data">
          <v-alert
            :value="true"
            color="error"
            icon="warning"
          >
            Sorry, nothing to display here :(
          </v-alert>
        </template>
        <v-alert
          slot="no-results"
          :value="true"
          color="error"
          icon="warning"
        >
          Your search for "{{ search }}" found no results.
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

export default {
  components: {
    DateTime,
    ListButtonAdd
  },
  data: vm => ({
    descending: true,
    page: 1,
    rowsPerPageItems: [10, 20, 30, 40],
    pagination: {
      sortBy: 'name',
      rowsPerPage: 20
    },
    // totalItems: number,
    search: '',
    wantRoles: [],
    dialog: false,
    headers: [
      { text: 'Name', value: 'name' },
      { text: 'Status', value: 'status' },
      { text: 'Login', value: 'email' },
      { text: 'Verified?', value: 'email_verified' },
      { text: 'Roles', value: 'roles' },
      { text: 'Created', value: 'createTime' },
      { text: 'Last Login', value: 'lastLogin' },
      { text: 'Comment', value: 'text' },
      { text: 'Actions', value: 'name', sortable: false }
    ],
    editedId: null,
    editedItem: {
      name: '',
      status: vm.editedId ? null : 'active',
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
      email: '',
      email_verified: false,
      password: '',
      confirmPassword: '',
      roles: [],
      text: ''
    },
    showPassword: false,
    rules: {
      required: v => !!v || 'Required.',
      min: v => (vm.editedId && v == null) || (v && v.length >= 6) || 'Min 6 characters',
      passwordMatch: v =>
        (vm.editedId && v == null) || (v && v == vm.editedItem.password) || 'Passwords entered don\'t match'
    }
  }),
  computed: {
    isBasicAuth() {
      return this.$config.provider == 'basic'
    },
    users() {
      return this.$store.state.users.users
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
      return !this.editedId ? 'New User' : 'Edit User'
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
      this.getUsers()
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
      confirm('Are you sure you want to delete this item?') &&
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
