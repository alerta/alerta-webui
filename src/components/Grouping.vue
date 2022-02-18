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
          :items="[...incidents, ...created]"
          :search-input.sync="search"
          :hide-no-data="!search"
          label="Incident"
          item-text="title"
          item-value="id"
          @input="onInput"
        >
          <template v-slot:no-data>
            <v-list-item @click="createItem(search)">
              <span>Create {{ search }}</span>
            </v-list-item>
          </template>
        </v-combobox>

        <v-autocomplete
          v-if="isCreating"
          :items="severities"
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

        <span>{{ incident }}</span>
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
import { IAlert, IIncident } from '@/common/interfaces'
import Vue, { PropType } from 'vue'

export default Vue.extend({
  props: {
    selected: {
      type: Array as PropType<IAlert[]>,
      default: () => []
    }
  },
  data: () => ({
    search: '',
    created: [] as Partial<IIncident>[],
    dialog: false,
    incident: {} as Partial<IIncident>,
    incidents: [],
    severities: [
      'warning',
      'critical',
      'debug',
      'cleared',
      'indeterminate',
      'informational',
      'major',
      'minor',
      'normal',
      'ok',
      'security',
      'trace',
      'unknown'
    ]
  }),
  mounted() {
    this.$store
      .dispatch('incidents/getIncidents')
      .then(
        () => (this.incidents = this.$store.state.incidents.incidents ?? [])
      )
  },
  computed: {
    isCreating() {
      return this.incident?.id === undefined
    }
  },
  watch: {
    dialog() {
      if (!this.dialog) {
        this.search = ''
        this.incident = {}
        return
      }
    }
  },
  methods: {
    onInput(event) {
      if (typeof event === 'string') return
      this.incident = event
    },
    createItem(item: string) {
      this.incident = { id: undefined, title: item }
      this.created.push(this.incident)

      return true
    },
    submit() {
      if (!this.incident) return
      this.dialog = false

      const incident: Partial<IIncident> = this.isCreating
        ? this.incident
        : {
            id: this.incident.id,
            alerts:
              this.$store.state.incidents.incidents.find(
                (incident) => incident.id === this.incident.id
              )?.alerts ?? []
          }

      incident.alerts = [
        ...this.selected.map((alert) => alert.id),
        ...(incident.alerts ?? [])
      ].filter((alert, index, self) => self.indexOf(alert) === index)

      this.$store.dispatch(
        this.isCreating
          ? 'incidents/createIncident'
          : 'incidents/updateIncident',
        incident
      )
    }
  }
})
</script>