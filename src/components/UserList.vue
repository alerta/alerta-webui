<template>
  <div>
    <v-dialog v-model="dialog" max-width="500px">
      <v-form ref="form">
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12 sm6 md9>
                  <v-text-field
                    v-model="editedItem.name"
                    label="Name"
                    :rules="[rules.required]"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md3>
                  <v-switch
                    v-model="editedItem.status"
                    true-value="active"
                    false-value="inactive"
                    label="Active"
                  ></v-switch>
                </v-flex>
                <v-flex xs12 sm6 md9>
                  <v-text-field
                    v-model="editedItem.email"
                    label="Email"
                    :required="[rules.required]"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm6 md3>
                  <v-checkbox
                    v-model="editedItem.email_verified"
                    label="Verified"
                  ></v-checkbox>
                </v-flex>

                <v-flex xs12 sm6>
                  <v-text-field
                    v-model="editedItem.password"
                    :append-icon="
                      showPassword ? 'visibility_off' : 'visibility'
                    "
                    :rules="[rules.min]"
                    :type="showPassword ? 'text' : 'password'"
                    name="input-10-2"
                    label="Password"
                    class="input-group--focused"
                    @click:append="showPassword = !showPassword"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 sm6>
                  <v-text-field
                    :append-icon="
                      showPassword ? 'visibility_off' : 'visibility'
                    "
                    :rules="[rules.passwordMatch]"
                    :type="showPassword ? 'text' : 'password'"
                    name="input-10-2"
                    label="Confirm Password"
                    :value="confirmPassword"
                    @click:append="showPassword = !showPassword"
                  ></v-text-field>
                </v-flex>

                <v-flex xs12 sm6 md12>
                  <v-combobox
                    v-model="editedItem.roles"
                    :items="allowedRoles"
                    label="Roles"
                    chips
                    clearable
                    solo
                    multiple
                  >
                    <template slot="selection" slot-scope="data">
                      <v-chip :selected="data.selected" close>
                        <strong>{{ data.item }}</strong
                        >&nbsp;
                        <span>(role)</span>
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-flex>
                <v-flex xs12 sm6 md12>
                  <v-text-field
                    v-model="editedItem.text"
                    label="Comment"
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="close">Cancel</v-btn>
            <v-btn color="blue darken-1" flat @click="save">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-card>
      <v-card-title class="title">
        Users
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="search"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="users"
        :rows-per-page-items="rowsPerPageItems"
        :pagination.sync="pagination"
        class="elevation-1"
        :search="search"
        :loading="isLoading"
        must-sort
        sort-icon="arrow_drop_down"
      >
        <template slot="items" slot-scope="props">
          <td>{{ props.item.name }}</td>
          <td>
            <v-tooltip top>
              <v-icon
                slot="activator"
                :color="props.item.status == 'active' ? 'primary' : ''"
                @click="toggleUserStatus(props.item)"
              >{{
                props.item.status === 'active' ? 'toggle_on' : 'toggle_off'
              }}
              </v-icon>
              <span>{{ props.item.status | capitalize }}</span>
            </v-tooltip>
          </td>
          <td>{{ props.item.email }}</td>
          <td>
            <v-tooltip top>
              <v-icon
                slot="activator"
                @click="toggleEmailVerified(props.item)"
              >{{
                props.item.email_verified
                  ? 'check_box'
                  : 'check_box_outline_blank'
              }}</v-icon
              >
              <span>{{
                props.item.email_verified
                  ? 'Email Verified'
                  : 'Email not verified'
              }}</span>
            </v-tooltip>
          </td>
          <td>
            <v-chip v-for="role in props.item.roles" :key="role">
              <strong>{{ role }}</strong
              >&nbsp;
              <span>(role)</span>
            </v-chip>
          </td>
          <td class="text-xs-right">
            <date-time :value="props.item.createTime" format="mediumDate" />
          </td>
          <td class="text-xs-right">
            <date-time
              v-if="props.item.lastLogin"
              :value="props.item.lastLogin"
              format="mediumDate"
            />
          </td>
          <td class="text-xs-right">{{ props.item.text }}</td>
          <td class="justify-center layout px-0">
            <v-icon small class="mr-2" @click="editItem(props.item)">
              edit
            </v-icon>
            <v-icon small @click="deleteItem(props.item)">
              delete
            </v-icon>
          </td>
        </template>
        <template slot="no-data">
          <v-alert :value="true" color="error" icon="warning">
            Sorry, nothing to display here :(
          </v-alert>
        </template>
        <v-alert slot="no-results" :value="true" color="error" icon="warning">
          Your search for "{{ search }}" found no results.
        </v-alert>
      </v-data-table>
    </v-card>

    <list-button-add @add-to-list="dialog = true" />
  </div>
</template>

<script>
import DateTime from '@/components/DateTime'
import ListButtonAdd from '@/components/ListButtonAdd'

export default {
  components: {
    DateTime,
    ListButtonAdd
  },
  data() {
    return {
      descending: true,
      page: 1,
      rowsPerPageItems: [10, 20, 30, 40],
      pagination: {
        sortBy: 'name',
        rowsPerPage: 20
      },
      // totalItems: number,
      search: '',
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
        status: 'active',
        email: '',
        email_verified: false,
        password: '',
        roles: [],
        text: ''
      },
      defaultItem: {
        name: '',
        status: 'active',
        email: '',
        email_verified: false,
        password: '',
        roles: [],
        text: ''
      },
      confirmPassword: '',
      showPassword: false,
      rules: {
        required: v => !!v || 'Required.',
        min: v => !v || v.length >= 6 || 'Min 6 characters',
        passwordMatch: v =>
          v == this.editedItem.password || 'Passwords entered don\'t match'  // eslint-disable-line prettier/prettier
      }
    }
  },
  computed: {
    users() {
      return this.$store.state.users.users
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
      val || this.getUsers()
    }
  },
  created() {
    this.getUsers()
    this.getPerms()
  },
  methods: {
    getUsers() {
      this.$store.dispatch('users/getUsers')
    },
    getPerms() {
      this.$store.dispatch('perms/getPerms')
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
      this.dialog = true
    },
    deleteItem(item) {
      confirm('Are you sure you want to delete this item?') &&
        this.$store.dispatch('users/deleteUser', item.id)
    },
    close() {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedId = null
        this.confirmPassword = null
        this.reset()
      }, 300)
    },
    reset() {
      this.$refs.form.reset()
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
      } else {
        this.$store.dispatch('users/createUser', this.editedItem)
      }
      this.close()
    }
  }
}
</script>

<style></style>
