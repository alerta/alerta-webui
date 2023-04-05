<!-- eslint-disable vuetify/no-deprecated-components -->
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
                  sm="6"
                  md="12"
                >
                  <v-chip
                    v-show="editedItem.match"
                    closable
                    @click="editedItem.match = null"
                  >
                    <strong>{{ editedItem.match }}</strong>&nbsp;
                    <span>({{ $t('role') }})</span>
                  </v-chip>
                </v-col>
                <v-text-field
                  v-model.trim="editedItem.match"
                  :label="$t('Role')"
                  :rules="[rules.required]"
                  required
                />
                <v-col
                  xs="12"
                  sm="6"
                  md="12"
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
        {{ $t('Permissions') }}
        <v-spacer />
        <v-col
          xs="3"
          class="mr-3 pt-3"
        >
          <v-autocomplete
            v-model="wantScopes"
            :items="scopes"
            :label="$t('Scopes')"
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
                <span>({{ $t('scope') }})</span>
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
        :headers="headers"
        :items="perms"
        :rows-per-page-items="rowsPerPageItems"
        v-model:pagination="pagination"
        class="px-2"
        :loading="isLoading"
        must-sort
        sort-icon="arrow_drop_down"
      >
        <template #item="{item}">
          <tr>
            <td>
              <v-chip small>
                <strong>{{ item.props.title.match }}</strong>&nbsp;
              </v-chip>
              <v-tooltip location="top">
                <template #activator="{props}">
                  <v-icon
                    v-if="systemRoles.includes(item.props.title.match)"
                    v-bind="props"
                    size="small"
                  >
                    lock
                  </v-icon>
                </template>
                <span>{{ $t('SystemRole') }}</span>
              </v-tooltip>
            </td>
            <td>
              <v-chip
                v-for="scope in item.props.title.scopes"
                :key="scope"
                small
              >
                <strong>{{ scope }}</strong>&nbsp;
              </v-chip>
            </td>
            <td class="text-no-wrap">
              <v-btn
                v-has-perms.disable="'admin:perms'"
                icon
                class="btn--plain mr-0"
                :disabled="systemRoles.includes(item.props.title.match)"
                @click="editItem(item.props.title)"
              >
                <v-icon
                  size="small"
                  color="grey-darken-3"
                >
                  edit
                </v-icon>
              </v-btn>
              <v-btn
                v-has-perms.disable="'admin:perms'"
                icon
                class="btn--plain mx-0"
                :disabled="systemRoles.includes(item.props.title.match)"
                @click="deleteItem(item.props.title)"
              >
                <v-icon
                  size="small"
                  color="grey-darken-3"
                >
                  delete
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
      perms="admin:perms"
      @add-to-list="dialog = true"
    />
  </div>
</template>

<script>
import ListButtonAdd from './lib/ListButtonAdd'
import i18n from '@/plugins/i18n'
import utils from '@/common/utils'

export default {
  components: {
    ListButtonAdd
  },
  data: () => ({
    descending: true,
    page: 1,
    rowsPerPageItems: [10, 20, 30, 40, 50],
    pagination: {
      sortBy: 'match',
      rowsPerPage: 20
    },
    // totalItems: number,
    search: '',
    systemRoles: ['admin', 'user', 'guest'],
    wantScopes: [],
    dialog: false,
    headers: [
      { title: i18n.global.t('Role'), key: 'match' },
      { title: i18n.global.t('Scopes'), key: 'scopes' },
      { title: i18n.global.t('Actions'), key: 'name', sortable: false }
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
      required: v => !!v || i18n.global.t('Required')
    }
  }),
  computed: {
    perms() {
      return this.$store.state.perms.permissions.filter(perm => {
        if(this.wantScopes.length > 0 && !perm.scopes.some(x => this.wantScopes.includes(x)))
          return false 
        if(this.search.trim() != '')
          return perm.match.includes(this.search)
        return true
      })
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
      return !this.editedId ? i18n.global.t('NewPermission') : i18n.global.t('EditPermission')
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
    editItem(item) {
      this.editedId = item.id
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    deleteItem(item) {
      confirm(i18n.global.t('ConfirmDelete')) &&
        this.$store.dispatch('perms/deletePerm', item.id)
    },
    close() {
      this.dialog = false
      /*eslint-disable*/
      setTimeout(() => {
        this.$refs.form.reset()
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedId = null
      }, 100)
    },
    validate() {
      this.$refs.form.validate().then((status) => {
        if(status){
          this.$refs.form.resetValidation()
          this.save()
        }
      })
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
