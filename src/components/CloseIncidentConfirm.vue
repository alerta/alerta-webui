<template>
  <v-dialog v-model="isOpen" max-width="500px">
    <template v-slot:activator="{ on }">
      <slot
        name="activator"
        v-bind="{
          on: { click: (...args) => handleOpen(() => on.click(...args)) }
        }"
      ></slot>
    </template>
    <v-card>
      <v-card-title>
        Add note to close "{{ this.incident.title }}"
      </v-card-title>
      <v-form v-model="valid" @submit.prevent="addNote">
        <v-card-text>
          <v-text-field
            v-model="note"
            label="Note"
            outlined
            :rules="[(v) => !!v || 'Note is required']"
            hint="Describe the reason for closing this incident"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" @click="isOpen = false">
            {{ $t('Cancel') }}
          </v-btn>
          <v-btn color="blue darken-1" type="submit" :disabled="!valid">
            Close
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import moment from 'moment'

export default Vue.extend({
  data: () => ({
    isOpen: false,
    valid: true,
    note: null,
    minutes: 1
  }),
  props: {
    incident: {
      type: Object,
      required: true
    },
    callback: {
      type: Function,
      required: false
    }
  },
  methods: {
    handleOpen(open: () => void) {
      this.$store
        .dispatch('incidents/getNotes', this.incident.id)
        .then((notes: any[]) => {
          if (
            notes.length > 0 &&
            moment().diff(notes[notes.length - 1].createTime, 'minutes') <
              this.minutes
          )
            this.closeIncident()
          else open()
        })
    },
    addNote() {
      if (!this.valid) return

      return this.$store
        .dispatch('incidents/addNote', [this.incident.id, this.note])
        .then(this.closeIncident)
    },
    closeIncident() {
      this.$store
        .dispatch('incidents/takeAction', [
          this.incident.id,
          'close',
          undefined
        ])
        .then((res) => {
          this.isOpen = false
          this.callback?.(res)
        })
    }
  }
})
</script>