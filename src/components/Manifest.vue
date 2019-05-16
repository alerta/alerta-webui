<template>
  <v-data-table
    :headers="headers"
    :items="manifest"
    class="px-2"
    hide-actions
  >
    <template
      slot="items"
      slot-scope="props"
    >
      <td>{{ application | capitalize }} API {{ props.item.release }}</td>
      <td>{{ props.item.build }}</td>
      <td>
        <date-time
          v-if="props.item.date"
          :value="props.item.date"
          format="mediumDate"
        />
      </td>
      <td>
        <a
          :href="`https://github.com/alerta/alerta/commit/${props.item.revision}`"
          target="_blank"
        >{{ props.item.revision }} <v-icon small>launch</v-icon></a>
      </td>
    </template>
  </v-data-table>
</template>

<script>
import DateTime from './lib/DateTime'

export default {
  components: {
    DateTime
  },
  data: () => ({
    headers: [
      {text: 'API', value: 'release', sortable: false},
      {text: 'Build', value: 'build', sortable: false},
      {text: 'Date', value: 'date', sortable: false},
      {text: 'Git Revision', value: 'revision', sortable: false},
    ],
    manifest: []
  }),
  computed: {
    application() {
      return this.$store.state.management.application
    },
    refresh() {
      return this.$store.state.refresh
    }
  },
  watch: {
    refresh(val) {
      val || this.getManifest()
    }
  },
  created() {
    this.getManifest()
      .then(() => this.manifest = Array.of(this.$store.state.management.manifest))
  },
  methods: {
    getManifest() {
      return this.$store.dispatch('management/getManifest')
    }
  }
}
</script>

<style></style>
