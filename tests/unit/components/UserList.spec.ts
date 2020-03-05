import { shallowMount } from '@vue/test-utils'
import UserList from '@/components/UserList.vue'
import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import Vuetify from 'vuetify'
import i18n from '@/plugins/i18n'

Vue.config.silent = true
Vue.use(Vuetify)
Vue.use(Vuex)

describe('UserList', () => {
  let store: Store<any>

  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        isLoading: false,

        domains: [],
        users: [],
        groups: []
      },
      actions: {
        ['groups/getGroups'](){ },
        ['perms/getPerms'](){ },
        ['users/getUserGroups'](){ },
        ['users/getUsers'](){ }
      },
      getters: {
      }
    })
  })

  it('renders props.msg when passed', () => {
    const msg = 'Sorry, nothing to display here :('
    const wrapper = shallowMount(UserList, {
      propsData: { msg },
      store,
      i18n,
      mocks: {
        $config: () => true
      }
    })
    expect(wrapper.text()).toMatch(msg)
  })
})
