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
                <v-flex xs12 sm6 md12>
                  <v-chip
                    v-show="editedItem.match"
                    close
                    @click="editedItem.match = null"
                  >
                    <strong>{{ editedItem.match }}</strong
                    >&nbsp;
                    <span>({{ $t('role') }})</span>
                  </v-chip>
                </v-flex>
                <v-text-field
                  v-model.trim="editedItem.match"
                  :label="$t('Role')"
                  :rules="[rules.required]"
                  required
                />
                <v-flex xs12 sm6 md12>
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
              </v-layout>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn color="blue darken-1" flat @click="close">
              {{ $t('Cancel') }}
            </v-btn>
            <v-btn color="blue darken-1" flat @click="validate">
              {{ $t('Save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-card>
      <v-card-title class="title">
        {{ $t('Permissions') }}
        <v-spacer />
        <v-flex xs3 class="mr-3 pt-3">
          <v-autocomplete
            v-model="wantScopes"
            :items="scopes"
            :label="$t('Scopes')"
            chips
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
        :items="perms"
        :footer-props="{ itemsPerPageOptions }"
        :options.sync="pagination"
        class="px-2"
        :search="search"
        :custom-filter="customFilter"
        :loading="isLoading"
        must-sort
        :header-props="{ sortIcon: 'mdi-chevron-down' }"
      >
        <template slot="items" slot-scope="props">
          <td>
            <v-chip small>
              <strong>{{ props.item.match }}</strong
              >&nbsp;
              <span>({{ $t('role') }})</span>
            </v-chip>
            <v-tooltip top>
              <v-icon
                v-if="systemRoles.includes(props.item.match)"
                slot="activator"
                small
              >
                mdi-lock
              </v-icon>
              <span>{{ $t('SystemRole') }}</span>
            </v-tooltip>
          </td>
          <td>
            <v-chip v-for="scope in props.item.scopes" :key="scope" small>
              <strong>{{ scope }}</strong
              >&nbsp;
              <span>({{ $t('scope') }})</span>
            </v-chip>
          </td>
          <td class="text-no-wrap">
            <v-btn
              v-has-perms.disable="'admin:perms'"
              icon
              class="btn--plain mr-0"
              :disabled="systemRoles.includes(props.item.match)"
              @click="editItem(props.item)"
            >
              <v-icon small color="grey darken-3">mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              v-has-perms.disable="'admin:perms'"
              icon
              class="btn--plain mx-0"
              :disabled="systemRoles.includes(props.item.match)"
              @click="deleteItem(props.item)"
            >
              <v-icon small color="grey darken-3">mdi-delete</v-icon>
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

    <list-button-add perms="admin:perms" @add-to-list="dialog = true" />
  </div>
</template>

<script>
import ListButtonAdd from './lib/ListButtonAdd.vue'
import i18n from '@/plugins/i18n'
import utils from '@/common/utils'

export default {
  components: {
    ListButtonAdd
  },
  data: () => ({
    itemsPerPageOptions: [10, 20, 30, 40, 50],
    pagination: {
      page: 1,
      sortBy: ['match'],
      sortDesc: [true],
      itemsPerPage: 20
    },
    search: '',
    systemRoles: ['admin', 'user', 'guest'],
    wantScopes: [],
    dialog: false,
    headers: [
      { text: i18n.t('Role'), value: 'match' },
      { text: i18n.t('Scopes'), value: 'scopes' },
      { text: i18n.t('Actions'), value: 'name', sortable: false }
    ],
    editedId: null,
    editedItem: {
      match: '',
      scopes: []
    },
    defaultItem: {
      match: '',
      scopes: []
    },
    rules: {
      required: (v) => !!v || i18n.t('Required')
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
      return !this.editedId ? i18n.t('NewPermission') : i18n.t('EditPermission')
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
    customFilter(value, search, item) {
      return (
        (this.wantScopes.length
          ? item.scopes.some((role) => this.wantScopes.includes(role))
          : true) &&
        value != null &&
        search != null &&
        typeof value !== 'boolean' &&
        value
          .toString()
          .toLocaleLowerCase()
          .indexOf(search.toLocaleLowerCase()) !== -1
      )
    },
    editItem(item) {
      this.editedId = item.id
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    deleteItem(item) {
      confirm(i18n.t('ConfirmDelete')) &&
        this.$store.dispatch('perms/deletePerm', item.id)
    },
    close() {
      this.dialog = false
      setTimeout(() => {
        this.$refs.form.reset()
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
