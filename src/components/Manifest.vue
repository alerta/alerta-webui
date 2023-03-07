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
      <td class="text-xs-center">
        {{ version }}
      </td>
      <td>
        <span class="hidden-sm-and-down">{{ $filters.capitalize(application) }} {{ $t('API') }} </span>{{ props.item.release }}
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
        <span class="hidden-sm-and-down">{{ props.item.revision }}</span>
        <span class="show-md-and-up">{{ props.item.revision.substring(0, 7) }}</span>
        <a
          :href="`https://github.com/alerta/alerta/commit/${props.item.revision}`"
          target="_blank"
        >
          <v-tooltip right>
            {{ $t('OpenGitHub') }}
            <v-icon
              slot="activator"
              small
            >launch</v-icon>
          </v-tooltip>
        </a>
      </td>
      <td>
        <a
          :href="$config.endpoint"
          target="_blank"
        >
          <span class="monospace">{{ $config.endpoint }}</span>
        </a>
        <v-tooltip
          :key="copyIconText"
          top
        >
          <v-icon
            slot="activator"
            small
            class="px-1"
            @click="clipboardCopy($config.endpoint)"
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
import i18n from '@/plugins/i18n'

export default {
  components: {
    DateTime
  },
  data: () => ({
    headers: [
      {text: i18n.global.t('WebUI'), value: 'version', sortable: false},
      {text: i18n.global.t('API'), value: 'release', sortable: false},
      {text: i18n.global.t('Build'), value: 'build', sortable: false},
      {text: i18n.global.t('Date'), value: 'date', sortable: false},
      {text: i18n.global.t('GitRevision'), value: 'revision', sortable: false},
      {text: i18n.global.t('APIEndpoint'), value: 'endpoint', sortable: false}
    ],
    manifest: [],
    copyIconText: i18n.global.t('Copy')
  }),
  computed: {
    application() {
      return this.$store.state.management.application
    },
    version() {
      return process.env.VUE_APP_VERSION || 'dev'
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
      this.copyIconText = i18n.global.t('Copied')
      let textarea = document.createElement('textarea')
      textarea.textContent = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setTimeout(() => {
        this.copyIconText = i18n.global.t('Copy')
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
