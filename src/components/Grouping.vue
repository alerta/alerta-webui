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
        <v-btn text @click="dialog = false">Cancel</v-btn>
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
import { IIncident } from '@/common/interfaces'
import Vue from 'vue'

export default Vue.extend({
  props: {
    selected: {
      type: Array,
      default: () => []
    }
  },
  data: () => ({
    search: null as string | null,
    created: [] as Array<string>,
    dialog: false,
    incident: {} as any
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

      if (this.isCreating) {
        this.$store.dispatch('incidents/createIncident', {
          ...this.incident,
          alerts: this.selected.map((alert: any) => alert.id)
        })
        return
      }

      const incident = this.$store.state.incidents.incidents.find(
        (incident: IIncident) => incident.title === this.incident.title
      )

      this.$store.dispatch('incidents/updateIncident', {
        id: incident.id,
        alerts: this.selected.map((alert: any) => alert.id)
      })
    }
  }
})
</script>