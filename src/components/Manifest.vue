<!-- eslint-disable vuetify/no-deprecated-components -->
<template>
  <v-data-table
    :headers="headers"
    :items="manifest"
    class="px-2"
    hide-actions
  >
    <template #item="{item}">
      <td class="text-center">
        {{ version }}
      </td>
      <td>
        <span class="hidden-sm-and-down">{{ this.$filters.capitalize(application) }} {{ $t('API') }} </span>{{ item.props.title.release }}
      </td>
      <td>{{ item.props.build }}</td>
      <td>
        <date-time
          v-if="item.props.date"
          :value="item.props.date"
          format="mediumDate"
        />
      </td>
      <td>
        <span class="hidden-sm-and-down">{{ item.props.revision }}</span>
        <span class="show-md-and-up">{{ item.props.revision.substring(0, 7) }}</span>
        <a
          :href="`https://github.com/alerta/alerta/commit/${item.props.revision}`"
          target="_blank"
        >
          <v-tooltip end>
            <template #activator="{props}">
              {{ $t('OpenGitHub') }}
              <v-icon
                v-bind="props"
                size="small"
              >launch</v-icon>
            </template>
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
          location="top"
        >
          <template #activator="{props}">
            <v-icon
              v-bind="props"
              size="small"
              class="px-1"
              @click="clipboardCopy($config.endpoint)"
            >
              content_copy
            </v-icon>
          </template>
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
      {title: i18n.global.t('WebUI'), value: 'version', sortable: false},
      {title: i18n.global.t('API'), value: 'release', sortable: false},
      {title: i18n.global.t('Build'), value: 'build', sortable: false},
      {title: i18n.global.t('Date'), value: 'date', sortable: false},
      {title: i18n.global.t('GitRevision'), value: 'revision', sortable: false},
      {title: i18n.global.t('APIEndpoint'), value: 'endpoint', sortable: false}
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
