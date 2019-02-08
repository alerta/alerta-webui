<template>
  <div>
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12 sm6 md12>
                <v-text-field
                  v-model="editedItem.match"
                  label="Look Up"
                  hint="Use login, Keycloak role, GitHub org, GitLab group or email domain"
                  persistent-hint
                ></v-text-field>
                <v-flex xs12 sm6 md12>
                  <v-chip
                    v-show="editedItem.customer"
                    close
                    @click="editedItem.customer = null"
                  >
                    <strong>{{ editedItem.customer }}</strong
                    >&nbsp;
                    <span>(customer)</span>
                  </v-chip>
                </v-flex>
                <v-text-field
                  v-model="editedItem.customer"
                  label="Customer"
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
    </v-dialog>

    <v-card>
      <v-card-title class="title">
        Customers
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
        :items="customers"
        :rows-per-page-items="rowsPerPageItems"
        :pagination.sync="pagination"
        class="elevation-1"
        :search="search"
        :loading="isLoading"
        must-sort
        sort-icon="arrow_drop_down"
      >
        <template slot="items" slot-scope="props">
          <td>{{ props.item.match }}</td>
          <td>
            <v-chip>
              <strong>{{ props.item.customer }}</strong
              >&nbsp;
              <span>(customer)</span>
            </v-chip>
          </td>
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
import ListButtonAdd from '@/components/ListButtonAdd'

export default {
  components: {
    ListButtonAdd
  },
  data() {
    return {
      descending: true,
      page: 1,
      rowsPerPageItems: [10, 20, 30, 40],
      pagination: {
        sortBy: 'match',
        rowsPerPage: 20
      },
      // totalItems: number,
      search: '',
      dialog: false,
      headers: [
        { text: 'Look Up', value: 'match' },
        { text: 'Customer', value: 'customer' },
        { text: 'Actions', value: 'name', sortable: false }
      ],
      editedId: null,
      editedItem: {
        match: null,
        customer: null
      },
      defaultItem: {
        match: null,
        customer: null
      }
    }
  },
  computed: {
    customers() {
      return this.$store.state.customers.customers
    },
    isLoading() {
      return this.$store.state.customers.isLoading
    },
    formTitle() {
      return !this.editedId ? 'New Customer' : 'Edit Customer'
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
      confirm('Are you sure you want to delete this item?') &&
        this.$store.dispatch('customers/deleteCustomer', item.id)
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
