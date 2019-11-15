<template>
  <div>
    <v-container
      v-if="!showForm"
      class="pa-1"
      fluid
    >
      <v-layout>
        <v-flex>
          <v-btn
            v-show="!isWatched"
            outline
            color="grey darken-2"
            @click="watchAlert"
          >
            <v-icon>visibility</v-icon>&nbsp;{{ $t('Watch') }}
          </v-btn>

          <v-btn
            v-show="isWatched"
            outline
            color="grey darken-2"
            @click="unwatchAlert"
          >
            <v-icon>visibility_off</v-icon>&nbsp;{{ $t('UnWatch') }}
          </v-btn>

          <v-btn
            v-if="!showForm"
            outline
            color="grey darken-2"
            @click="showForm = true"
          >
            <v-icon>note_add</v-icon>{{ $t('AddNote') }}
          </v-btn>

          <v-btn
            outline
            color="grey darken-2"
            @click="deleteAlert"
          >
            <v-icon>delete_forever</v-icon>&nbsp;{{ $t('Delete') }}
          </v-btn>
        </v-flex>
      </v-layout>
    </v-container>


    <v-container
      v-if="showForm"
      class="pa-1"
      fluid
    >
      <v-layout>
        <v-flex>
          <v-form
            ref="form"
            v-model="valid"
            lazy-validation
            @submit="addNote"
          >
            <v-card>
              <v-card-text>
                <v-text-field
                  v-model="text"
                  :counter="this.maxNoteLength"
                  :rules="textRules"
                  :label="$t('AddNote')"
                  prepend-icon="edit"
                  required
                />
              </v-card-text>
              <v-card-actions>
                <v-btn
                  :disabled="!isAcked && !isClosed"
                  color="green"
                  class="white--text"
                  @click="takeAction('open')"
                >
                  <v-icon>refresh</v-icon>&nbsp;Open
                </v-btn>

                <v-btn
                  v-show="!isAcked"
                  :disabled="!isOpen"
                  color="blue darken-2"
                  class="white--text"
                  @click="takeAction('ack')"
                >
                  <v-icon>check_circle_outline</v-icon>&nbsp;Ack
                </v-btn>

                <v-btn
                  v-show="isAcked"
                  color="blue darken-2"
                  class="white--text"
                  @click="takeAction('unack')"
                >
                  <v-icon>check_circle_outline</v-icon>&nbsp;Unack
                </v-btn>

                <v-btn
                  v-show="!isShelved"
                  :disabled="!isOpen && !isAcked"
                  color="blue"
                  class="white--text"
                  @click="shelveAlert()"
                >
                  <v-icon>schedule</v-icon>&nbsp;Shelve
                </v-btn>

                <v-btn
                  v-show="isShelved"
                  color="blue"
                  class="white--text"
                  @click="takeAction('unshelve')"
                >
                  <v-icon>schedule</v-icon>&nbsp;Unshelve
                </v-btn>

                <v-btn
                  :disabled="isClosed"
                  color="orange"
                  class="white--text"
                  @click="takeAction('close')"
                >
                  <v-icon>highlight_off</v-icon>&nbsp;Close
                </v-btn>

                <v-btn
                  color="white"
                  :class="{'black--text': isDark}"
                  @click="addNote"
                >
                  <v-icon>note_add</v-icon>&nbsp;Add&nbsp;note
                </v-btn>

                <v-spacer />

                <v-btn
                  icon
                  @click="close"
                >
                  <v-icon
                    color="grey darken-1"
                  >
                    delete
                  </v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'

export default {
  props: {
    id: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true
    },
    isWatched: {
      type: Boolean,
      required: true
    }
  },
  data: vm => ({
    showForm: false,
    valid: true,
    text: '',
    maxNoteLength: 200,
    textRules: [
      v => !!v || 'Text is required',
      v => (v && v.length <= vm.maxNoteLength) || `Text must be less than ${vm.maxNoteLength} characters`
    ]
  }),
  computed: {
    isDark() {
      return this.$store.getters.getPreference('isDark')
    },
    isOpen(status) {
      return this.status == 'open' || this.status == 'NORM'
    },
    isAcked() {
      return this.status == 'ack' || this.status == 'ACKED'
    },
    isShelved() {
      return this.status == 'shelved' || this.status == 'SHLVD'
    },
    isClosed() {
      return this.status == 'closed'
    }
  },
  methods: {
    takeAction: debounce(function(action) {
      this.$emit('take-action', this.id, action, this.text)
      this.close()
    }, 200, {leading: true, trailing: false}),
    shelveAlert: debounce(function(action) {
      this.$emit('shelve-alert', this.id, this.text)
      this.close()
    }, 200, {leading: true, trailing: false}),
    watchAlert: debounce(function() {
      this.$emit('watch-alert', this.id)
    }, 200, {leading: true, trailing: false}),
    unwatchAlert: debounce(function() {
      this.$emit('unwatch-alert', this.id)
    }, 200, {leading: true, trailing: false}),
    addNote: debounce(function(action) {
      this.$emit('add-note', this.id, this.text)
      this.close()
    }, 200, {leading: true, trailing: false}),
    deleteAlert: debounce(function() {
      this.$emit('delete-alert', this.id)
    }, 200, {leading: true, trailing: false}),
    close() {
      this.text = null
      this.showForm = false
    }
  }
}
</script>

<style></style>
