import ApiKeyList from '@/components/ApiKeyList.vue'
import i18n from '@/plugins/i18n'
import { shallowMount } from '@vue/test-utils'
import Vue from 'vue'
import Vuetify from 'vuetify'
import Vuex, { Store } from 'vuex'

Vue.config.silent = true
Vue.use(Vuetify)
Vue.use(Vuex)

describe('ApiKeyList', () => {
  let store: Store<any>

  beforeEach(() => {
    store = new Store({
      modules: {
        keys: {
          namespaced: true,
          state: {
            keys: [
              {
                count: 0,
                customer: 'Google',
                expireTime: '2020-01-11T17:37:48.569Z',
                href: 'http://api.local.alerta.io:8080/key/vj50CYx04fpviPlyhQiz-l_XVOPZsWzSR9PIzRHH',
                id: '4429e9bf-f7b7-4a9d-b1bd-7252ee84635d',
                key: 'vj50CYx04fpviPlyhQiz-l_XVOPZsWzSR9PIzRHH',
                lastUsedTime: null,
                scopes: ['write', 'read'],
                text: '',
                type: 'read-write',
                user: 'nfsatterly@gmail.com'
              }
            ],

            pagination: {
              page: 1,
              rowsPerPage: 20,
              totalItems: 1,
              sortBy: 'lastUsedTime',
              descending: true,
              rowsPerPageItems: [10, 20, 50, 100, 200]
            }
          },
          actions: {
            getKeys() {}
          },
          getters: {
            pagination: (state) => {
              return state.pagination
            }
          }
        },
        perms: {
          namespaced: true,
          state: {
            permissions: [],
            scopes: []
          },
          actions: {
            getScopes() {
              return ['read', 'write'] // default user scopes
            }
          }
        },
        users: {
          namespaced: true,
          state: {
            domains: [],
            users: [],
            groups: []
          },
          actions: {
            getUsers() {}
          }
        },
        customers: {
          namespaced: true,
          state: {
            customers: []
          },
          actions: {
            getCustomers() {}
          }
        },
        auth: {
          namespaced: true,
          state: {
            isAuthenticated: true
          },
          getters: {
            scopes() {
              return []
            }
          }
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
