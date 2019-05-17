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
      <td>
        {{ application | capitalize }} API {{ props.item.release }}
      </td>
      <td>{{ props.item.build }}</td>
      <td>
        <date-time
          v-if="props.item.date"
          :value="props.item.date"
          format="mediumDate"
        />
      </td>
      <td>
        {{ props.item.revision }}
        <a
          :href="`https://github.com/alerta/alerta/commit/${props.item.revision}`"
          target="_blank"
        >
          <v-tooltip right>
            Open in GitHub
            <v-icon
              slot="activator"
              small
            >launch</v-icon>
          </v-tooltip>
        </a>
      </td>
      <td
        monospace
      >
        <a :href="$config.endpoint" target="_blank">{{ $config.endpoint }}</a>
        <v-tooltip
          :key="copyIconText"
          top
        >
          <v-icon
            slot="activator"
            small
            @click="clipboardCopy($config.endpoint)"
            class="px-1"
          >
            content_copy
          </v-icon>
          <span>{{ copyIconText }}</span>
        </v-tooltip>
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
      {text: 'API Endpoint', value: 'endpoint', sortable: false}
    ],
    manifest: [],
    copyIconText: 'Copy'
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
    },
    clipboardCopy(text) {
      this.copyIconText = 'Copied!'
      let textarea = document.createElement('textarea')
      textarea.textContent = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setTimeout(() => {
        this.copyIconText = 'Copy'
      }, 2000)
    }
  }
}
</script>

<style>
td[monospace] {
  font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier,
    monospace;
}
</style>
