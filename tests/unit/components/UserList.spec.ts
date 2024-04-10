import { shallowMount } from '@vue/test-utils'
import UserList from '@/components/UserList.vue'

describe('UserList', () => {
  it('renders a div', () => {
    const wrapper = shallowMount(UserList)
    expect(wrapper.contains('div')).toBe(true)
  })
})
