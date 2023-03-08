<template>
  <div>
    <v-dialog
      v-model="listbox"
      max-width="500px"
    >
      <v-form ref="form">
        <v-card>
          <v-card-title>
            <span class="text-h5">
              {{ $t('AddRemoveUsers') }}
            </span>
          </v-card-title>

          <v-card-text>
            <v-container grid-list-md>
              <v-row wrap>
                <v-col
                  xs="9"
                >
                  <v-autocomplete
                    v-model="selected"
                    :disabled="isLoading"
                    :items="allUsers"
                    autofocus
                    variant="filled"
                    chips
                    :label="$t('Addusers')"
                    item-title="name"
                    item-value="id"
                    @update:model-value="addUser"
                  >
                    <template #selection="data">
                      <v-chip
                        :value="data.selected"
                        closable
                        class="chip--select-multi"
                        @update:model-value="removeUser(data.item)"
                      >
                        <v-icon>person</v-icon>
                        {{ data.item.name }}
                      </v-chip>
                    </template>
                    <template #item="data">
                      <template v-if="typeof data.item !== 'object'">
                        {{ data.item }}
                      </template>
                      <template v-else>
                        <v-list-item :append-avatar="person" />
                        <!-- <v-icon>person</v-icon> -->
                        <v-list-item-title>{{ data.item.name }}</v-list-item-title>
                        <v-list-item-subtitle>{{ data.item.email }}</v-list-item-subtitle>
                      </template>
                    </template>
                  </v-autocomplete>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-title primary-title>
            <div>
              <div class="text-h5">
                {{ groupName }}
              </div>
              <span>{{ $t('UsersInGroup') }}</span>
            </div>
          </v-card-title>

          <!-- removed avatar prop from v-list as it has been removed in Vuetify 2 -->
          <v-list>
            <v-list-item
              v-for="item in groupUsers"
              :key="item.id"
              @click="removeUser(item.id)"
            >
              <v-list-item-avatar>
                <v-icon>person</v-icon>
              </v-list-item-avatar>
              <v-list-item-title>{{ item.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.login }}</v-list-item-subtitle>

              <v-list-item-action>
                <v-icon>
                  {{ item.status == 'active' ? 'remove_circle' : 'remove_circle_outline' }}
                </v-icon>
              </v-list-item-action>
            </v-list-item>
          </v-list>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="blue-darken-1"
              variant="flat"
              @click="close"
            >
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

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
                  sm="6"
                  md="12"
                >
                  <v-chip
                    v-show="editedItem.name"
                    closable
                    @click="editedItem.name = null"
                  >
                    <strong>{{ editedItem.name }}</strong>&nbsp;
                    <span>({{ $t('group') }})</span>
                  </v-chip>
                </v-col>
                <v-text-field
                  v-model.trim="editedItem.name"
                  :label="$t('Group')"
                  :rules="[rules.required]"
                  required
                />
                <v-col
                  xs="12"
                >
                  <v-text-field
                    v-model.trim="editedItem.text"
                    :label="$t('Description')"
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
        {{ $t('Groups') }}
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
        :header="headers"
        :item="groups"
        :rows-per-page-items="rowsPerPageItems"
        v-model:pagination="pagination"
        class="px-2"
        :search="search"
        :loading="isLoading"
        must-sort
        sort-icon="arrow_drop_down"
      >
        <template #items="props">
          <td>{{ props.item.name }}</td>
          <td class="text-left">
            {{ props.item.text }}
          </td>
          <td>
            {{ props.item.count }}
          </td>
          <td class="text-no-wrap">
            <v-btn
              v-has-perms.disable="'admin:groups'"
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
              v-has-perms.disable="'admin:groups'"
              icon
              class="btn--plain mr-0"
              @click="addRemoveUsers(props.item)"
            >
              <v-icon
                size="small"
                color="grey-darken-3"
              >
                person_add
              </v-icon>
            </v-btn>
            <v-btn
              v-has-perms.disable="'admin:groups'"
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
            {{ $t('SearchNoResult1') }} "{{ search }}" {{ $t('SearchNoResult2') }}
          </v-alert>
        </template>
      </v-data-table>
    </v-card>

    <list-button-add
      v-show="isBasicAuth"
      perms="admin:groups"
      @add-to-list="dialog = true"
    />
  </div>
</template>

<script>
import ListButtonAdd from './lib/ListButtonAdd'
import i18n from '@/plugins/i18n'

export default {
  components: {
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
    search: '',
    dialog: false,
    headers: [
      { text: i18n.global.t('Name'), value: 'name' },
      { text: i18n.global.t('Description'), value: 'text' },
      { text: i18n.global.t('NumberUsers'), value: 'count' },
      { text: i18n.global.t('Actions'), value: 'actions', sortable: false }
    ],
    editedId: null,
    editedItem: {
      name: null,
      text: ''
    },
    menu1: false,
    menu2: false,
    defaultItem: {
      name: null,
      text: ''
    },
    rules: {
      required: v => !!v || i18n.global.t('Required')
    },
    groupId: null,
    groupName: '',
    listbox: false,
    selected: null
  }),
  computed: {
    isBasicAuth() {
      return this.$config.provider == 'basic'
    },
    groups() {
      return this.$store.state.groups.groups
    },
    groupUsers() {
      return this.$store.state.groups.users
    },
    allUsers() {
      return this.$store.state.users.users
    },
    isLoading() {
      return this.$store.state.groups.isLoading
    },
    formTitle() {
      return !this.editedId ? i18n.global.t('NewGroup') : i18n.global.t('EditGroup')
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
      val || this.getGroups()
    }
  },
  created() {
    this.getUsers()
    this.getGroups()
  },
  methods: {
    getUsers() {
      this.$store.dispatch('users/getUsers')
    },
    getGroups() {
      this.$store.dispatch('groups/getGroups')
    },
    getGroupUsers(groupId) {
      this.$store.dispatch('groups/getGroupUsers', groupId)
    },
    editItem(item) {
      this.editedId = item.id
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    deleteItem(item) {
      confirm(i18n.global.t('ConfirmDelete')) &&
        this.$store.dispatch('groups/deleteGroup', item.id)
    },
    close() {
      this.dialog = false
      this.listbox = false
      setTimeout(() => {
        this.$refs.form.reset()
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedId = null
        this.groupId = null
        this.groupName = ''
        this.$store.dispatch('groups/clearGroupUsers')
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
        this.$store.dispatch('groups/updateGroup', [
          this.editedId,
          {
            name: this.editedItem.name,
            text: this.editedItem.text
          }
        ])
      } else {
        this.$store.dispatch('groups/createGroup', this.editedItem)
      }
      this.close()
    },
    addRemoveUsers(item) {
      this.groupId = item.id
      this.groupName = item.name
      this.getGroupUsers(this.groupId)
      this.listbox = true
    },
    addUser(userId) {
      this.$store.dispatch('groups/addUserToGroup', [this.groupId, userId])
      setTimeout(() => {
        this.$refs.form.reset()
        this.selected = null
      }, 100)
    },
    removeUser(userId) {
      this.$store.dispatch('groups/removeUserFromGroup', [this.groupId, userId])
    }
  }
}
</script>

<style scoped>
.v-list {
  height: 400px;
  overflow-y: auto;
}
</style>
