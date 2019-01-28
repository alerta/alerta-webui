<template>
  <v-card>
    <v-card-title>
      Heartbeats
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="search"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="heartbeats"
      :rows-per-page-items="rowsPerPageItems"
      :pagination.sync="pagination"
      class="elevation-1"
      :search="search"
      :loading="isLoading"
      must-sort
      sort-icon="arrow_drop_down"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.origin }}</td>
        <td>{{ props.item.customer }}</td>
        <td>
          <v-chip v-for="tag in props.item.tags" :key="tag" label small>
            <v-icon left>label</v-icon>{{ tag }}
          </v-chip>
        </td>
        <td>
          <date-time :value="props.item.createTime" format="mediumDate" />
        </td>
        <td>
          <date-time :value="props.item.receiveTime" format="mediumDate" />
        </td>
        <td>
          {{ diffTime(props.item.createTime, props.item.receiveTime) }} ms
        </td>
        <td>{{ props.item.timeout | hhmmss }}</td>
        <td>{{ props.item.receiveTime | timeago }}</td>
        <td class="justify-center layout px-0">
          <v-icon small @click="deleteItem(props.item)">
            delete
          </v-icon>
        </td>
      </template>
      <template slot="no-data">
        <v-alert :value="true" color="error" icon="warning">
          Sorry, nothing to display here :(
        </v-alert>
      </template>
      <v-alert slot="no-results" :value="true" color="error" icon="warning">
        Your search for "{{ search }}" found no results.
      </v-alert>
    </v-data-table>
  </v-card>
</template>

<script>
import DateTime from './DateTime'

export default {
  components: {
    DateTime
  },
  data() {
    return {
      descending: true,
      page: 1,
      rowsPerPageItems: [10, 20, 30, 40],
      pagination: {
        sortBy: 'receiveTime',
        descending: true,
        rowsPerPage: 20
      },
      // totalItems: number,
      search: '',
      headers: [
        { text: 'Origin', value: 'origin' },
        { text: 'Customer', value: 'customer' },
        { text: 'Tags', value: 'tags' },
        { text: 'Create Time', value: 'createTime' },
        { text: 'Receive Time', value: 'receiveTime' },
        { text: 'Latency', value: 'latency' },
        { text: 'Timeout', value: 'timeout' },
        { text: 'Since', value: 'since' },
        { text: 'Actions', value: 'name', sortable: false }
      ]
    }
  },
  computed: {
    heartbeats() {
      return this.$store.state.heartbeats.heartbeats
    },
    isLoading() {
      return this.$store.state.heartbeats.isLoading
    },
    refresh() {
      return this.$store.state.refresh
    }
  },
  watch: {
    refresh(val) {
      val || this.getHeartbeats()
    }
  },
  created() {
    this.getHeartbeats()
  },
  methods: {
    getHeartbeats() {
      this.$store.dispatch('heartbeats/getHeartbeats')
    },
    deleteItem(item) {
      confirm('Are you sure you want to delete this item?') &&
        this.$store.dispatch('heartbeats/deleteHeartbeat', item.id)
    },
    diffTime(a, b) {
      return new Date(b).getTime() - new Date(a).getTime()
    }
  }
}
</script>

<style></style>
