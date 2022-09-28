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

                <v-flex xs12>
                  <v-text-field
                    v-model="editedItem.id"
                    :label="$t('Id')"
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>

                <v-flex xs12>
                  <v-text-field
                    v-model="editedItem.sender"
                    :label="$t('Sender')"
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>

                <v-flex xs12>
                  <v-select
                    v-model="editedItem.type"
                    :items="types"
                    :label="$t('Type')"
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>
                <v-flex
                  v-if="(editedItem.type === 'smtp' || editedItem.type === 'link_mobility')"
                  xs12
                >
                  <v-text-field
                    v-model="editedItem.host"
                    :label="$t('Host')"
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>
                <v-flex
                  v-if="editedId === null && editedItem.type !== 'sendgrid'"
                  xs12
                >
                  <v-text-field
                    v-model="editedItem.apiSid"
                    :type="editedItem.type !== 'smtp' ? 'password' : 'text'"
                    :label="
                      (editedItem.type !== 'smtp' && editedItem.type !== 'link_mobility') ? $t('ApiSid') : $t('Username')
                    "
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>
                <v-flex
                  v-if="editedId === null"
                  xs12
                >
                  <v-text-field
                    v-model="editedItem.apiToken"
                    :type="'password'"
                    :label="
                      (editedItem.type !== 'smtp' && editedItem.type !== 'link_mobility')
                        ? $t('ApiToken')
                        : $t('Password')
                    "
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>
                <v-flex
                  v-if="editedItem.type === 'link_mobility'"
                  xs12
                >
                  <v-text-field
                    v-model="editedItem.platformId"
                    :label="$t('PlatformId')"
                    :rules="[rules.required]"
                    required
                  />
                </v-flex>
                <v-flex
                  v-if="editedItem.type === 'link_mobility'"
                  xs12
                >
                  <v-text-field
                    v-model="editedItem.platformPartnerId"
                    :label="$t('PlatfromPartnerId')"
                    :rules="[rules.required]"
                    required
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
        {{ $t('notificationChannels') }}
        <v-spacer />
        <v-tooltip bottom>
          <v-template slot="activator">
            <v-btn @click="copyEncryptionKey">
              Get New Encryption Key
              <!-- <v-icon slot="activator">
                notifications_paused
              </v-icon> -->
            </v-btn>
          </v-template>
          <span>{{
            $t('Genereates New Encryption Key And Copies It To Clipboard')
          }}</span>
          <br>
          <span>{{
            $t(
              'Set NOTIFICATION_KEY="{New Key}" In Config To Use Generated Key'
            )
          }}</span>
        </v-tooltip>
        <v-spacer />
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
        :headers="computedHeaders"
        :items="notification_channels"
        :pagination.sync="pagination"
        :total-items="pagination.totalItems"
        :rows-per-page-items="pagination.rowsPerPageItems"
        class="px-2"
        :loading="isLoading"
        must-sort
        sort-icon="arrow_drop_down"
      >
        <template
          slot="items"
          slot-scope="props"
        >
          <td v-if="$config.customer_views">
            {{ props.item.customer }}
          </td>
          <td>{{ props.item.id }}</td>
          <td>{{ props.item.sender }}</td>
          <td>{{ props.item.type }}</td>
          <td>{{ props.item.host }}</td>
          <td>{{ props.item.platformId }}</td>
          <td>{{ props.item.platformPartnerId }}</td>

          <td class="text-no-wrap">
            <v-btn
              v-has-perms.disable="'write:notification_channels'"
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
              v-has-perms.disable="'write:notification_channels'"
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
              v-has-perms.disable="'write:notification_channels'"
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
      perms="write:notification_channels"
      @add-to-list="dialog = true"
    />
  </div>
</template>

<script>
import ListButtonAdd from './lib/ListButtonAdd'
import moment from 'moment'
import i18n from '@/plugins/i18n'

export default {
  components: {
    ListButtonAdd
  },
  data: vm => ({
    types: [
      { text: 'sendgrid (mail)', value: 'sendgrid' },
      { text: 'smtp (mail)', value: 'smtp' },
      { text: 'twilio (sms)', value: 'twilio_sms' },
      { text: 'twilio (call + sms)', value: 'twilio_call' },
      { text: 'link moblity (sms)', value: 'link_mobility' }
    ],
    search: '',
    dialog: false,
    headers: [
      { text: i18n.t('Customer'), value: 'customer' },
      { text: i18n.t('Id'), value: 'id' },
      { text: i18n.t('Sender'), value: 'sender' },
      { text: i18n.t('Type'), value: 'type' },
      { text: i18n.t('Actions'), value: 'name', sortable: false }
    ],
    editedId: null,
    editedItem: {
      customer: null,
      id: null,
      sender: null,
      type: null,
      host: null,
      apiToken: null,
      apiSid: null,
      platformPartnerId: null,
      platformId: null
    },
    menu1: false,
    menu2: false,
    defaultItem: {
      customer: null,
      id: null,
      sender: null,
      type: 'sendgrid',
      host: null,
      apiToken: null,
      apiSid: null,
      platformPartnerId: null,
      platformId: null
    },
    rules: {
      required: v => !!v || i18n.t('Required')
    }
  }),
  computed: {
    notification_channels() {
      return this.$store.state.notificationChannels.notification_channels
        .filter(b =>
          this.search
            ? Object.keys(b).some(
              k => b[k] && b[k].toString().includes(this.search)
            )
            : true
        )
        .map(b => {
          return { ...b }
        })
    },
    pagination: {
      get() {
        return this.$store.getters['notificationChannels/pagination']
      },
      set(value) {
        this.$store.dispatch('notificationChannels/setPagination', value)
      }
    },
    computedHeaders() {
      return this.headers.filter(h =>
        !this.$config.customer_views ? h.value != 'customer' : true
      )
    },
    allowedCustomers() {
      return this.$store.getters['customers/customers']
    },
    isLoading() {
      return this.$store.state.notificationChannels.isLoading
    },
    formTitle() {
      return !this.editedId
        ? i18n.t('NewNotificationChannel')
        : i18n.t('EditNotificationChannel')
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
      if (!val) return
      this.getNotificationChannels()
      this.getEncryptionKey()
      this.getCustomers()
    },
    pagination: {
      handler() {
        this.getNotificationChannels()
      },
      deep: true
    }
  },
  created() {
    this.getNotificationChannels()
    this.getEncryptionKey()
    this.getCustomers()
    this.editedItem = Object.assign({}, this.defaultItem)
  },
  methods: {
    getEncryptionKey() {
      this.$store.dispatch('notificationChannels/getEncryptionKey')
    },
    copyEncryptionKey() {
      this.getEncryptionKey()
      navigator.clipboard.writeText(
        this.$store.state.notificationChannels.encryptionKey
      )
    },
    getNotificationChannels() {
      this.$store.dispatch('notificationChannels/getNotificationChannels')
    },
    getCustomers() {
      this.$store.dispatch('customers/getCustomers')
    },
    editItem(item) {
      this.editedId = item.id
      this.editedItem = Object.assign({}, item)
      console.log(item)
      this.dialog = true
    },
    copyItem(item) {
      this.editedItem = Object.assign({}, item)
      this.editedId = null
      this.dialog = true
    },
    deleteItem(item) {
      confirm(i18n.t('ConfirmDelete')) &&
        this.$store.dispatch(
          'notificationChannels/deleteNotificationChannel',
          item.id
        )
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
        this.$store.dispatch('notificationChannels/updateNotificationChannel', [
          this.editedId,
          {
            customer: this.editedItem.customer,
            sender: this.editedItem.sender,
            type: this.editedItem.type,
            host: this.editedItem.host,
            apiToken: this.editedItem.apiToken,
            apiSid: this.editedItem.apiSid,
            platformId: this.editedItem.platformId,
            platformPartnerId: this.editedItem.platformPartnerId
          }
        ])
      } else {
        this.$store.dispatch(
          'notificationChannels/createNotificationChannel',
          this.editedItem
        )
      }
      this.close()
    }
  }
}
</script>

<style></style>
