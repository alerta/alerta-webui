<template>
  <v-dialog v-model="dialog" max-width="750">
    <template v-for="(_, slot) in $slots">
      <template :slot="slot"><slot :name="slot" /></template>
    </template>
    <template v-for="(_, slot) in $scopedSlots" v-slot:[slot]="props">
      <slot :name="slot" v-bind="props" />
    </template>

    <v-card>
      <v-card-title>Group Alerts</v-card-title>
      <v-card-subtitle>Selected {{ selected.length }} alerts</v-card-subtitle>

      <v-card-text>
        <v-combobox
          placeholder="Select or create an incident"
          :items="[...items, ...created]"
          :search-input.sync="search"
          :hide-no-data="!search"
          label="Incident"
          v-model="incident.title"
        >
          <template v-slot:no-data>
            <v-list-item @click="createItem(search)">
              <span>Create {{ search }}</span>
            </v-list-item>
          </template>
        </v-combobox>

        <v-autocomplete
          v-if="isCreating"
          :items="['Severe', 'Warning']"
          label="Severity"
          v-model="incident.severity"
        />
        <v-combobox
          v-if="isCreating"
          chips
          clearable
          deletable-chips
          multiple
          small-chips
          label="Tags"
          v-model="incident.tags"
        />
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          text
          @click="submit"
          :disabled="search ? search.length === 0 : true"
        >
          {{ isCreating ? 'Create' : 'Add to' }} Incident
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: ['selected'],
  data: () => ({
    search: null,
    created: [],
    dialog: false,
    incident: {}
  }),
  mounted() {
    this.$store.dispatch('incidents/getIncidents')
  },
  computed: {
    items() {
      return this.$store.getters['incidents/incidents']
    },
    isCreating() {
      return this.search && this.created.includes(this.search)
    }
  },
  watch: {
    dialog() {
      if (!this.dialog) {
        this.search = null
        this.incident = {}
        return
      }
    }
  },
  methods: {
    createItem(item: string) {
      this.created.push(item as never)
    },
    submit() {
      this.dialog = false
      console.log(this.incident)

      // this.$store.dispatch('incidents/createIncident', {})
    }
  }
})
</script>