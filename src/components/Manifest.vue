<template>
  <v-data-table
    :headers="headers"
    :items="manifest"
    class="px-2"
    hide-default-footer
  >
    <template v-slot:item.version>
      <span>{{ version }}</span>
    </template>

    <template v-slot:item.date="{ item }">
      <date-time v-if="item.date" :value="item.date" format="mediumDate" />
    </template>

    <template v-slot:item.revision="{ item }">
      <span class="d-sm-none">{{ item.revision }}</span>
      <span class="d-none-xs d-inline-md">
        {{ item.revision.substring(0, 7) }}
      </span>
      <a
        :href="`https://github.com/alerta/alerta/commit/${item.revision}`"
        target="_blank"
      >
        <v-tooltip right>
          {{ $t('OpenGitHub') }}
          <template v-slot:activator="{ on }">
            <v-icon v-on="on" small>mdi-launch</v-icon>
          </template>
        </v-tooltip>
      </a>
    </template>

    <template v-slot:item.endpoint>
      <a :href="$config.endpoint" target="_blank" class="monospace">
        {{ $config.endpoint }}
      </a>
      <v-tooltip :key="copyIconText" top>
        <template v-slot:activator="{ on }">
          <v-icon
            v-on="on"
            small
            class="px-1"
            @click="clipboardCopy($config.endpoint)"
          >
            mdi-clipboard-multiple-outline
          </v-icon>
        </template>
        <span>{{ copyIconText }}</span>
      </v-tooltip>
    </template>
  </v-data-table>
</template>

<script>
import DateTime from './lib/DateTime.vue'
import i18n from '@/plugins/i18n'

export default {
  components: {
    DateTime
  },
  data: () => ({
    headers: [
      { text: i18n.t('WebUI'), value: 'version', sortable: false },
      { text: i18n.t('API'), value: 'release', sortable: false },
      { text: i18n.t('Build'), value: 'build', sortable: false },
      { text: i18n.t('Date'), value: 'date', sortable: false },
      { text: i18n.t('GitRevision'), value: 'revision', sortable: false },
      { text: i18n.t('APIEndpoint'), value: 'endpoint', sortable: false }
    ],
    manifest: [],
    copyIconText: i18n.t('Copy')
  }),
  computed: {
    application() {
      return this.$store.state.management.application
    },
    version() {
      return import.meta.env.VITE_VERSION || 'dev'
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
    this.getManifest().then(
      () => (this.manifest = Array.of(this.$store.state.management.manifest))
    )
  },
  methods: {
    getManifest() {
      return this.$store.dispatch('management/getManifest')
    },
    clipboardCopy(text) {
      if (!window.isSecureContext || !navigator.clipboard) return
      navigator.clipboard.writeText(text)

      this.copyIconText = i18n.t('Copied')
      setTimeout(() => {
        this.copyIconText = i18n.t('Copy')
      }, 2000)
    }
  }
}
</script>

<style scoped>
.monospace {
  font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier,
    monospace;
  font-size: 12px !important;
  font-weight: 600 !important;
}
</style>
