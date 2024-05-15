<template>
  <div class="notificationrule">
    <notification-rule-list />
  </div>
</template>

<script>
import NotificationRuleList from '@/components/NotificationRuleList.vue'

export default {
  components: {
    NotificationRuleList
  },
  props: {
    query: {
      type: Object,
      required: false,
      default: () => {}
    }
  },
  created (){
    this.setSearch(this.query)
  },
  methods: {
    setSearch(query) {
      this.$store.dispatch('notificationRules/updateQuery', query)
    }
  }
}
</script>
