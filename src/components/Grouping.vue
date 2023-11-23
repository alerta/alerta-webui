<template>
  <v-dialog v-model="dialog" max-width="750">
    <template v-for="(_, slot) in $slots">
      <template :slot="slot"><slot :name="slot" /></template>
    </template>
    <template v-for="(_, slot) in $scopedSlots" v-slot:[slot]="props">
      <slot :name="slot" v-bind="props" />
    </template>

    <v-card>
      <v-card-title>Add alerts to incident</v-card-title>
      <v-card-subtitle
        >Selected {{ selected.length }} alert{{
          selected.length == 1 ? '' : 's'
        }}</v-card-subtitle
      >

      <v-card-text>
        <v-combobox
          placeholder="Select or create an incident"
          :items="[...incidents, ...created]"
          :search-input.sync="search"
          :hide-no-data="!search"
          label="Incident"
          item-text="title"
          item-value="id"
          aria-required
          @input="onInput"
          ref="combobox"
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
          hint="Will use highest severity of alerts if not set"
          persistent-hint
          :disabled="!incident.title"
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
          :disabled="!incident.title"
        />
        <v-text-field 
          v-if="isCreating"
          label="External ID"
          hint="ID of an external object (e.g. Netbox Circuit ID)"
          persistent-hint
          v-model="incident.externalId"
        />
        <v-autocomplete
          v-if="isCreating"
          label="Owner"
          v-model="incident.ownerId"
          :items="users"
          item-text="name"
          item-value="id"
          hide-details
          class="flex-grow-0"
          :loading="$store.state.users.loading"
        />

        <pre v-if="isDev" class="caption">{{
          JSON.stringify(incident, null, 2)
        }}</pre>
      </v-card-text>

      <v-divider />

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
      'security',
      'critical',
      'major',
      'minor',
      'warning',
      'informational',
      'debug',
      'trace',
      'indeterminate',
      'cleared',
      'normal',
      'ok',
      'unknown'
    ]
  }),
  mounted() {
    this.$store
      .dispatch('incidents/setFilter', {
        status: ['open', 'ack', 'shelved']
      })
      .then(() => {
        this.$store
          .dispatch('incidents/getIncidents')
          .then(
            () => (this.incidents = this.$store.state.incidents.incidents ?? [])
          )
      })
  },
  computed: {
    isCreating() {
      return 'id' in this.incident && this.incident.id === undefined
    },
    isDev() {
      return import.meta.env.DEV
    },
    users() {
      return this.$store.state.users.users
    }
  },
  watch: {
    dialog() {
      if (this.dialog) return this.getUsers()
      this.search = ''
      this.incident = {}
    }
  },
  methods: {
    onInput(event) {
      if (typeof event === 'string') return
      this.incident = event
    },
    createItem(item: string) {
      // @ts-ignore
      this.$refs.combobox?.blur()

      this.incident = {
        id: undefined,
        title: item,
        ownerId: this.$store.getters['auth/getId']
      }
      this.created.push(this.incident)

      return true
    },
    getUsers() {
      if (!this.$store.state.users.users?.length)
        this.$store.dispatch('users/getUsers')
    },
    submit() {
      if (!this.incident) return
      this.dialog = false
      const creating = this.isCreating

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

      this.$store
        .dispatch(
          creating ? 'incidents/createIncident' : 'incidents/updateIncident',
          incident
        )
        .then((res) => {
          this.$store.dispatch('notifications/custom', {
            type: 'success',
            text: `${creating ? 'Created' : 'Updated'} incident ${
              res.incident.title
            }`,
            action: 'Open',
            timeout: 4000,
            callback: () => {
              this.$router.push({
                name: 'incident',
                params: { id: res.incident.id }
              })
            }
          })
        })
    }
  }
})
</script>
