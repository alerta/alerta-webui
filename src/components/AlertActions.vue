<template>
  <div>
    <v-container
      v-if="!showForm"
      fluid
    >
      <v-layout>
        <v-flex>
          <v-btn
            v-show="!isWatched"
            outline
            color="grey"
            @click="watchAlert"
          >
            <v-icon>visibility</v-icon>&nbsp;Watch
          </v-btn>

          <v-btn
            v-show="isWatched"
            outline
            color="grey"
            @click="unwatchAlert"
          >
            <v-icon>visibility_off</v-icon>&nbsp;Unwatch
          </v-btn>

          <v-btn
            v-if="!showForm"
            outline
            color="grey"
            @click="showForm = true"
          >
            <v-icon>note_add</v-icon>&nbsp;Add&nbsp;note
          </v-btn>

          <v-btn
            outline
            color="grey"
            @click="deleteAlert"
          >
            <v-icon>delete_forever</v-icon>&nbsp;Delete
          </v-btn>
        </v-flex>
      </v-layout>
    </v-container>


    <v-container
      v-if="showForm"
      fluid
    >
      <v-layout>
        <v-flex>
          <v-form
            ref="form"
            v-model="valid"
            lazy-validation
          >
            <v-card>
              <v-card-text>
                <v-text-field
                  v-model="text"
                  :counter="100"
                  :rules="textRules"
                  label="Add Note"
                  prepend-icon="edit"
                  required
                />
              </v-card-text>
              <v-card-actions>
                <v-btn
                  color="green"
                  class="white--text"
                  @click="takeAction('open')"
                >
                  <v-icon>refresh</v-icon>&nbsp;Open
                </v-btn>

                <v-btn
                  v-show="!isShelved"
                  color="blue"
                  class="white--text"
                  :disabled="isClosed"
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
                  v-show="!isAcked"
                  color="blue darken-2"
                  class="white--text"
                  :disabled="isShelved || isClosed"
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
                  color="orange"
                  class="white--text"
                  :disabled="isClosed"
                  @click="takeAction('close')"
                >
                  <v-icon>highlight_off</v-icon>&nbsp;Close
                </v-btn>

                <v-btn
                  color="white"
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
                    color="grey"
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
  data: () => ({
    showForm: false,
    valid: true,
    text: '',
    textRules: [
      v => !!v || 'Text is required',
      v => (v && v.length <= 100) || 'Text must be less than 100 characters'
    ]
  }),
  computed: {
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
    takeAction(action) {
      this.$emit('take-action', this.id, action, this.text)
      this.close()
    },
    shelveAlert(action) {
      this.$emit('shelve-alert', this.id, this.text)
      this.close()
    },
    watchAlert() {
      this.$emit('watch-alert', this.id)
    },
    unwatchAlert() {
      this.$emit('unwatch-alert', this.id)
    },
    addNote(action) {
      this.$emit('add-note', this.id, this.text)
      this.close()
    },
    deleteAlert() {
      this.$emit('delete-alert', this.id)
    },
    close() {
      this.text = null
      this.showForm = false
    }
  }
}
</script>

<style></style>
