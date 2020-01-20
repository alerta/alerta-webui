import { shallowMount } from '@vue/test-utils'
import ApiKeyList from '@/components/ApiKeyList.vue'
import Vue from 'vue'
import Vuex, { Store } from 'vuex'
import Vuetify from 'vuetify'
import i18n from '@/plugins/i18n'

Vue.config.silent = true
Vue.use(Vuetify)
Vue.use(Vuex)

describe('ApiKeyList', () => {
  let store: Store<any>

  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        keys: [
          {
            count: 0,
            customer: 'Google',
            expireTime: '2020-01-11T17:37:48.569Z',
            href:
              'http://api.local.alerta.io:8080/key/vj50CYx04fpviPlyhQiz-l_XVOPZsWzSR9PIzRHH',
            id: '4429e9bf-f7b7-4a9d-b1bd-7252ee84635d',
            key: 'vj50CYx04fpviPlyhQiz-l_XVOPZsWzSR9PIzRHH',
            lastUsedTime: null,
            scopes: ['write', 'read'],
            text: '',
            type: 'read-write',
            user: 'nfsatterly@gmail.com'
          }
        ],
        perms: {
          permissions: [],
          scopes: []
        }
      },
      actions: {
        ['customers/getCustomers'](){ },
        ['perms/getScopes'](){ },
        ['keys/getKeys'](){ }
      },
      getters: {
        ['auth/scopes']() {
          return ['read', 'write'] // default user scopes
        }
      }
    })
  })

  it('renders props.msg when passed', () => {
    const msg = 'Sorry, nothing to display here :('
    const wrapper = shallowMount(ApiKeyList, {
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
