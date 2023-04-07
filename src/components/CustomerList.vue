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
                >
                  <v-text-field
                    v-model.trim="editedItem.match"
                    :label="$t('LookUp')"
                    :hint="$t('LookUpDescription')"
                    persistent-hint
                    :rules="[rules.required]"
                    required
                  />
                  <v-col
                    xs="12"
                  >
                    <v-chip
                      v-show="editedItem.customer"
                      closable
                      @click="editedItem.customer = null"
                    >
                      <strong>{{ editedItem.customer }}</strong>&nbsp;
                      <span>({{ $t('customer') }})</span>
                    </v-chip>
                  </v-col>
                  <v-text-field
                    v-model.trim="editedItem.customer"
                    :label="$t('Customer')"
                    :rules="[rules.required]"
                    required
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
        {{ $t('Customers') }}
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
        :headers="headers"
        :items="customers"
        v-model:pagination="pagination"
        class="px-2"
        :search="search"
        :loading="isLoading"
        must-sort
        sort-icon="arrow_drop_down"
      >
        <template #item="{item}">
          <tr>
            <td>{{ item.props.title.match }}</td>
            <td>
              <v-chip>
                <strong>{{ item.props.title.customer }}</strong>&nbsp;
                <span>({{ $t('customer') }})</span>
              </v-chip>
            </td>
            <td class="text-no-wrap">
              <v-btn
                v-has-perms.disable="'admin:customers'"
                icon
                class="btn--plain mr-0"
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
                v-has-perms.disable="'admin:customers'"
                icon
                class="btn--plain mx-0"
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
        <template #bottom>
          <v-data-table-footer       
            :items-per-page-options="rowsPerPageItems.map(
              row => {
                return {
                  title: row.toString(),
                  value: row
                }
              }
            )"
          />
        </template>
      </v-data-table>
    </v-card>

    <list-button-add
      perms="admin:customers"
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
    dialog: false,
    headers: [
      { title: i18n.global.t('LookUp'), key: 'match' },
      { title: i18n.global.t('Customer'), key: 'customer' },
      { title: i18n.global.t('Actions'), key: 'name', sortable: false }
    ],
    editedId: null,
    editedItem: {
      match: null,
      customer: null
    },
    defaultItem: {
      match: null,
      customer: null
    },
    rules: {
      required: v => !!v || i18n.global.t('Required')
    }
  }),
  computed: {
    customers() {
      return this.$store.state.customers.customers
    },
    isLoading() {
      return this.$store.state.customers.isLoading
    },
    formTitle() {
      return !this.editedId ? i18n.global.t('NewCustomer') : i18n.global.t('EditCustomer')
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
      val || this.getCustomers()
    }
  },
  created() {
    this.getCustomers()
  },
  methods: {
    getCustomers() {
      this.$store.dispatch('customers/getCustomers')
    },
    editItem(item) {
      this.editedId = item.id
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    deleteItem(item) {
      confirm(i18n.global.t('ConfirmDelete')) &&
        this.$store.dispatch('customers/deleteCustomer', item.id)
    },
    close() {
      this.dialog = false
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
        this.$store.dispatch('customers/updateCustomer', [
          this.editedId,
          {
            match: this.editedItem.match,
            customer: this.editedItem.customer
          }
        ])
      } else {
        this.$store.dispatch('customers/createCustomer', this.editedItem)
      }
      this.close()
    }
  }
}
</script>

<style></style>
