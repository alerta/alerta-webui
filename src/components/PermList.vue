<template>
  <div>
    <v-dialog
      v-model="dialog"
      max-width="500px"
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
                md12
              >
                <v-chip
                  v-show="editedItem.match"
                  close
                  @click="editedItem.match = null"
                >
                  <strong>{{ editedItem.match }}</strong>&nbsp;
                  <span>(role)</span>
                </v-chip>
              </v-flex>
              <v-text-field
                v-model="editedItem.match"
                label="Role"
              />
              <v-flex
                xs12
                sm6
                md12
              >
                <v-combobox
                  v-model="editedItem.scopes"
                  :items="allowedScopes"
                  label="Scopes"
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
                      <span>(scope)</span>
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
            @click="close"
          >
            Cancel
          </v-btn>
          <v-btn
            color="blue darken-1"
            flat
            @click="save"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card>
      <v-card-title class="title">
        Permissions
        <v-spacer />
        <v-flex
          xs3
          class="mr-3 pt-3"
        >
          <v-combobox
            v-model="wantScopes"
            :items="scopes"
            label="Scopes"
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
                <span>(scope)</span>
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
        :items="perms"
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
          <td>
            <v-chip small>
              <strong>{{ props.item.match }}</strong>&nbsp;
              <span>(role)</span>
            </v-chip>
            <v-tooltip top>
              <v-icon
                v-if="['admin', 'user'].includes(props.item.match)"
                slot="activator"
                small
              >
                lock
              </v-icon>
              <span>System role</span>
            </v-tooltip>
          </td>
          <td>
            <v-chip
              v-for="scope in props.item.scopes"
              :key="scope"
              small
            >
              <strong>{{ scope }}</strong>&nbsp;
              <span>(scope)</span>
            </v-chip>
          </td>
          <td>
            <v-icon
              small
              class="mr-2"
              :disabled="['admin', 'user'].includes(props.item.match)"
              @click="editItem(props.item)"
            >
              edit
            </v-icon>
            <v-icon
              small
              :disabled="['admin', 'user'].includes(props.item.match)"
              @click="deleteItem(props.item)"
            >
              delete
            </v-icon>
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

    <list-button-add @add-to-list="dialog = true" />
  </div>
</template>

<script>
import ListButtonAdd from '@/components/ListButtonAdd'

import utils from '@/common/utils'

export default {
  components: {
    ListButtonAdd
  },
  data: () => ({
    descending: true,
    page: 1,
    rowsPerPageItems: [10, 20, 30, 40],
    pagination: {
      sortBy: 'match',
      rowsPerPage: 20
    },
    // totalItems: number,
    search: '',
    wantScopes: [],
    dialog: false,
    headers: [
      { text: 'Role', value: 'match' },
      { text: 'Scopes', value: 'scopes' },
      { text: 'Actions', value: 'name', sortable: false }
    ],
    editedId: null,
    editedItem: {
      match: '',
      scopes: []
    },
    defaultItem: {
      match: '',
      scopes: []
    }
  }),
  computed: {
    perms() {
      return this.$store.state.perms.permissions
    },
    scopes() {
      return this.$store.state.perms.scopes
    },
    allowedScopes() {
      return utils.getAllowedScopes(
        this.$store.getters['auth/scopes'],
        this.$store.state.perms.scopes
      )
    },
    isLoading() {
      return this.$store.state.perms.isLoading
    },
    formTitle() {
      return !this.editedId ? 'New Permission' : 'Edit Permission'
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
      val || this.getPerms()
    }
  },
  created() {
    this.getPerms()
    this.getScopes()
  },
  methods: {
    getPerms() {
      this.$store.dispatch('perms/getPerms')
    },
    getScopes() {
      this.$store.dispatch('perms/getScopes')
    },
    filterByScopes(scopes) {
      this.wantScopes = scopes
    },
    customFilter(items, search, filter) {
      items = items.filter(item =>
        this.wantScopes.length > 0 ? item.scopes.some(x => this.wantScopes.includes(x)) : item
      )

      if (search.trim() === '') return items

      return items.filter(i => (
        Object.keys(i).some(j => filter(i[j], search))
      ))
    },
    editItem(item) {
      this.editedId = item.id
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    deleteItem(item) {
      confirm('Are you sure you want to delete this item?') &&
        this.$store.dispatch('perms/deletePerm', item.id)
    },
    close() {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedId = null
      }, 300)
    },
    save() {
      if (this.editedId) {
        this.$store.dispatch('perms/updatePerm', [
          this.editedId,
          {
            match: this.editedItem.match, // role
            scopes: this.editedItem.scopes
          }
        ])
      } else {
        this.$store.dispatch('perms/createPerm', this.editedItem)
      }
      this.close()
    }
  }
}
</script>

<style></style>
