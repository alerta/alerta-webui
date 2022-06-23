<template>
  <div>
    <v-dialog
      v-model="dialog"
      max-width="540px"
    >
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
                <v-flex
                  xs12
                >
                  <v-combobox
                    v-model="editedItem.type"
                    :items="currentTypes"
                    :menu-props="{ maxHeight: '400' }"
                    :label="$t('Type')"
                    chips
                    :hint="$t('ChooseType')"
                    persistent-hint
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>
                <v-flex
                  xs12
                >
                  <v-textarea
                    v-model="attributes"
                    :label="$t('Attributes')"
                    :hint="$t('JSONField')"
                    :rules="[rules.json]"
                    persistent-hint
                  />
                </v-flex>
                <v-flex
                  v-if="$config.customer_views"
                  xs12
                >
                  <v-select
                    v-model="editedItem.customer"
                    :items="allowedCustomers"
                    :label="$t('Customer')"
                    clearable
                  />
                </v-flex>
                <v-flex
                  xs12
                >
                  <v-select
                    v-model="editedItem.environment"
                    :items="allowedEnvironments"
                    :label="$t('Environment')"
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>

                <v-flex
                  xs12
                >
                  <v-combobox
                    v-model="editedItem.service"
                    :items="currentServices"
                    :menu-props="{ maxHeight: '400' }"
                    :label="$t('Service')"
                    chips
                    multiple
                    :hint="$t('ChooseService')"
                    persistent-hint
                  />
                </v-flex>
                <v-flex
                  xs12
                >
                  <v-text-field
                    v-model.trim="editedItem.resource"
                    :label="$t('Resource')"
                  />
                </v-flex>
                <v-flex
                  xs12
                >
                  <v-text-field
                    v-model.trim="editedItem.event"
                    :label="$t('Event')"
                  />
                </v-flex>
                <v-flex
                  xs12
                >
                  <v-text-field
                    v-model.trim="editedItem.group"
                    :label="$t('Group')"
                  />
                </v-flex>

                <v-flex
                  xs12
                >
                  <v-combobox
                    v-model="editedItem.tags"
                    :items="currentTags"
                    :label="$t('Tags')"
                    multiple
                    chips
                  >
                    <template
                      slot="selection"
                      slot-scope="data"
                    >
                      <v-chip
                        :key="JSON.stringify(data.item)"
                        :selected="data.selected"
                        :disabled="data.disabled"
                        class="v-chip--select-multi"
                        label
                        small
                        @input="data.parent.selectItem(data.item)"
                      >
                        <v-icon left>
                          label
                        </v-icon>{{ data.item }}
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-flex>

                <v-flex
                  xs12
                >
                  <v-text-field
                    v-model.trim="editedItem.origin"
                    :label="$t('Origin')"
                  />
                </v-flex>

                <v-flex
                  xs12
                >
                  <v-text-field
                    v-model.trim="editedItem.text"
                    :label="$t('Reason')"
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
              {{ $t('Cancel') }}
            </v-btn>
            <v-btn
              color="blue darken-1"
              flat
              @click="validate"
            >
              {{ $t('Save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-card>
      <v-card-title class="title">
        {{ $t('Filters') }}
        <v-spacer />
        <v-spacer />
        <v-text-field
          v-model="query"
          :label="$t('Search')"
          prepend-inner-icon="search"
          clearable
          @change="submitSearch"
          @click:clear="clearSearch"
        />
      </v-card-title>

      <v-data-table
        :headers="computedHeaders"
        :items="filters"
        :rows-per-page-items="rowsPerPageItems"
        :pagination.sync="pagination"
        class="px-2"
        :search="search"
        :loading="isLoading"
        must-sort
        sort-icon="arrow_drop_down"
      >
        <template
          slot="items"
          slot-scope="props"
        >
          <td>
            <v-chip
              color="blue"
              outline
              small
              @click="submitSearch('type:'+props.item.type)"
            >
              {{ props.item.type }}
            </v-chip>
          </td>
          <td>
            <v-chip
              v-for="( attribute, key) in props.item.attributes"
              :key="key"
              label
              small
            >
              {{ key }}: {{ attribute }}
            </v-chip>
          </td>
          <td
            v-if="$config.customer_views"
          >
            {{ props.item.customer }}
          </td>
          <td>{{ props.item.environment }}</td>
          <td>
            <v-chip
              v-for="service in props.item.service"
              :key="service"
              outline
              small
              @click="submitSearch('service:'+service)"
            >
              {{ service }}
            </v-chip>
          </td>
          <td>{{ props.item.resource }}</td>
          <td>{{ props.item.event }}</td>
          <td>{{ props.item.group }}</td>
          <td>
            <v-chip
              v-for="tag in props.item.tags"
              :key="tag"
              label
              small
              @click="submitSearch('tags:'+tag)"
            >
              <v-icon left>
                label
              </v-icon>{{ tag }}
            </v-chip>
          </td>
          <td>{{ props.item.origin }}</td>
          <td class="text-xs-left">
            {{ props.item.user }}
          </td>
          <td class="text-xs-left">
            {{ props.item.text }}
          </td>
          <td class="text-no-wrap">
            <v-btn
              v-has-perms.disable="'write:filters'"
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
              v-has-perms.disable="'write:filters'"
              icon
              class="btn--plain mx-0"
              @click="copyItem(props.item)"
            >
              <v-icon
                small
                color="grey darken-3"
              >
                content_copy
              </v-icon>
            </v-btn>
            <v-btn
              v-has-perms.disable="'write:filters'"
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
            {{ $t('NoDisplay') }}
          </v-alert>
        </template>
        <v-alert
          slot="no-results"
          :value="true"
          color="error"
          icon="warning"
        >
          {{ $t('SearchNoResult1') }} "{{ search }}" {{ $t('SearchNoResult2') }}
        </v-alert>
      </v-data-table>
    </v-card>

    <list-button-add
      perms="write:filters"
      @add-to-list="dialog = true"
    />
  </div>
</template>

<script>
import ListButtonAdd from './lib/ListButtonAdd'
import i18n from '@/plugins/i18n'

export default {
  components: {
    ListButtonAdd,
  },
  props: [],
  data: vm => ({
    descending: true,
    page: 1,
    rowsPerPageItems: [10, 20, 30, 40, 50],
    pagination: {
      sortBy: 'type',
      rowsPerPage: 20
    },
    // totalItems: number,
    search: '',
    dialog: false,
    headers: [
      { text: i18n.t('Type'), value: 'type' },
      { text: i18n.t('Attributes'), value: 'attributes' },
      { text: i18n.t('Customer'), value: 'customer' },
      { text: i18n.t('Environment'), value: 'environment' },
      { text: i18n.t('Service'), value: 'service' },
      { text: i18n.t('Resource'), value: 'resource' },
      { text: i18n.t('Event'), value: 'event' },
      { text: i18n.t('Group'), value: 'group' },
      { text: i18n.t('Tags'), value: 'tags' },
      { text: i18n.t('Origin'), value: 'origin' },
      { text: i18n.t('User'), value: 'user' },
      { text: i18n.t('Reason'), value: 'text' },
      { text: i18n.t('Actions'), value: 'name', sortable: false , align: 'center' },
    ],
    editedId: null,
    editedItem: {
      type: null,
      attributes: null,
      customer: null,
      environment: null,
      service: [],
      resource: null,
      event: null,
      group: null,
      tags: [],
      origin: null,
      text: ''
    },
    attributes: '',
    menu1: false,
    menu2: false,
    defaultItem: {
      type: null,
      attributes: null,
      customer: null,
      environment: null,
      service: [],
      resource: null,
      event: null,
      group: null,
      tags: [],
      origin: null,
      text: ''
    },
    rules: {
      required: v => !!v || i18n.t('Required'),
      json: function (value, attrValue, vnode) {
        if (value.length == 0){
          return true
        }
        if (value.length < 2) {
          return i18n.t('InvalidJSON')
        }
        try {
          JSON.parse( value )
        }
        catch(e) {
          return i18n.t('InvalidJSON')
        }
        return true
      }
    },
  }),
  computed: {
    filters() {
      return this.$store.state.filters.filters
    },
    computedHeaders() {
      return this.headers.filter(h => !this.$config.customer_views ? h.value != 'customer' : true)
    },
    allowedCustomers() {
      return this.$store.getters['customers/customers']
    },
    allowedEnvironments() {
      return this.$store.getters['alerts/environments']()
    },
    currentTypes() {
      return this.$store.getters['filters/types']
    },
    currentServices() {
      return this.$store.getters['alerts/services']
    },
    currentTags() {
      return this.$store.getters['alerts/tags']
    },
    isLoading() {
      return this.$store.state.filters.isLoading
    },
    formTitle() {
      return !this.editedId ? i18n.t('NewFilter') : i18n.t('EditFilter')
    },
    query: {
      get() {
        return this.$store.state.filters.query
          ? this.$store.state.filters.query.q
          : null
      },
      set(value) {
        // FIXME: offer query suggestions to user here, in future
      }
    }
  },
  watch: {
    dialog(val) {
      val || this.close()
    },
    query: {
      handler(val) {
        this.getFilters()
      },
      deep: true
    },
    //refresh(val) {
    //  if (!val) return
    //  this.getFilters()
    //  this.getCustomers()
    //  this.getEnvironments()
    //  this.getServices()
    //  this.getTags()
    //}
  },
  created() {
    this.checkSearch()
    this.getFilters()
    this.getFilterTypes()
    this.getCustomers()
    this.getEnvironments()
    this.getServices()
    this.getTags()
    this.editedItem = Object.assign({}, this.defaultItem)
  },
  methods: {
    refresh() {
      this.$store.dispatch('set', ['refresh', true])
    },
    checkSearch() {
      var q = this.$route.query
      if (q.hasOwnProperty('q') && q.q.length > 0) {
        this.$store.dispatch('filters/updateQuery', { q: q.q})
      }
    },
    submitSearch(query='') {
      if (query.length <= 0) {
        this.clearSearch()
        return
      }

      this.$store.dispatch('filters/updateQuery', { q: query })
      this.$router.push({
        query: { ...this.$router.query, q: query },
      })

      this.refresh()
    },
    clearSearch() {
      this.query = null
      this.$store.dispatch('filters/updateQuery', {})
      this.$router.push({
        query: { ...this.$router.query, q: undefined },
      })
      this.refresh()
    },
    getFilters() {
      this.$store.dispatch('filters/getFilters')
    },
    getFilterTypes() {
      this.$store.dispatch('filters/getFilterTypes')
    },
    getCustomers() {
      this.$store.dispatch('customers/getCustomers')
    },
    getEnvironments() {
      this.$store.dispatch('alerts/getEnvironments')
    },
    getServices() {
      this.$store.dispatch('alerts/getServices')
    },
    getTags() {
      this.$store.dispatch('alerts/getTags')
    },
    editItem(item) {
      this.editedId = item.id
      this.editedItem = Object.assign({}, item)
      if (Object.keys(this.editedItem.attributes).length > 0) {
        this.attributes = JSON.stringify({ ...this.editedItem.attributes }, null, 4)
      }
      this.dialog = true
    },
    copyItem(item) {
      this.editedItem = Object.assign({}, item)
      if (Object.keys(this.editedItem.attributes).length > 0) {
        this.attributes = JSON.stringify({ ...this.editedItem.attributes }, null, 4)
      }
      this.editedId = null
      this.dialog = true
    },
    deleteItem(item) {
      confirm(i18n.t('ConfirmDelete')) &&
        this.$store.dispatch('filters/deleteFilter', item.id)
    },
    close() {
      this.dialog = false
      this.attributes = ''
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
      // add a check
      this.attributes = JSON.parse(this.attributes)
      if (this.editedId) {
        this.$store.dispatch('filters/updateFilter', [
          this.editedId,
          {
            type: this.editedItem.type,
            attributes: this.attributes,
            customer: this.editedItem.customer,
            environment: this.editedItem.environment,
            service: this.editedItem.service,
            resource: this.editedItem.resource ? this.editedItem.resource : null,
            event: this.editedItem.event ? this.editedItem.event : null,
            group: this.editedItem.group ? this.editedItem.group : null,
            tags: this.editedItem.tags,
            origin: this.editedItem.origin ? this.editedItem.origin : null,
            text: this.editedItem.text
          }
        ])
      } else {
        this.$store.dispatch(
          'filters/createFilter',
          Object.assign(this.editedItem, {
            id: null,
            attributes: this.attributes,
          })
        )
      }
      this.close()
    }
  }
}
</script>

<style></style>
