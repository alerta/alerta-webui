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
                <v-flex xs12>
                  <v-text-field
                    v-model.trim="editedItem.match"
                    :label="$t('LookUp')"
                    :hint="$t('LookUpDescription')"
                    persistent-hint
                    :rules="[rules.required]"
                    required
                  />
                  <v-flex xs12>
                    <v-chip
                      v-show="editedItem.customer"
                      close
                      @click="editedItem.customer = null"
                    >
                      <strong>{{ editedItem.customer }}</strong
                      >&nbsp;
                      <span>({{ $t('customer') }})</span>
                    </v-chip>
                  </v-flex>
                  <v-text-field
                    v-model.trim="editedItem.customer"
                    :label="$t('Customer')"
                    :rules="[rules.required]"
                    required
                  />
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
        {{ $t('Customers') }}
        <v-spacer />
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          :label="$t('Search')"
          single-line
          hide-details
        />
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="customers"
        :footer-props="{ itemsPerPageOptions }"
        :options.sync="pagination"
        class="px-2"
        :search="search"
        :loading="isLoading"
        must-sort
        :header-props="{ sortIcon: 'mdi-chevron-down' }"
      >
        <template slot="items" slot-scope="props">
          <td>{{ props.item.match }}</td>
          <td>
            <v-chip>
              <strong>{{ props.item.customer }}</strong
              >&nbsp;
              <span>({{ $t('customer') }})</span>
            </v-chip>
          </td>
          <td class="text-no-wrap">
            <v-btn
              v-has-perms.disable="'admin:customers'"
              icon
              class="btn--plain mr-0"
              @click="editItem(props.item)"
            >
              <v-icon small color="grey darken-3">mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              v-has-perms.disable="'admin:customers'"
              icon
              class="btn--plain mx-0"
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

    <list-button-add perms="admin:customers" @add-to-list="dialog = true" />
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
    itemsPerPageOptions: [10, 20, 30, 40, 50],
    pagination: {
      page: 1,
      sortBy: ['match'],
      sortDesc: [true],
      itemsPerPage: 20
    },
    // totalItems: number,
    search: '',
    dialog: false,
    headers: [
      { text: i18n.t('LookUp'), value: 'match' },
      { text: i18n.t('Customer'), value: 'customer' },
      { text: i18n.t('Actions'), value: 'name', sortable: false }
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
      required: (v) => !!v || i18n.t('Required')
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
      return !this.editedId ? i18n.t('NewCustomer') : i18n.t('EditCustomer')
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
      confirm(i18n.t('ConfirmDelete')) &&
        this.$store.dispatch('customers/deleteCustomer', item.id)
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
