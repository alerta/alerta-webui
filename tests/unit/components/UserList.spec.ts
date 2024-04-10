import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import UserList from '@/components/UserList.vue'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('UserList', () => {

  let store = new Vuex.Store({})

  it('renders a div', () => {
    const wrapper = shallowMount(UserList, { store, localVue })
    expect(wrapper.contains('div')).toBe(true)
  })
})
