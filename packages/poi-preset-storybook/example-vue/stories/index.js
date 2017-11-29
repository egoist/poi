import { storiesOf } from 'storybook-vue'
import MyButton from './Button.vue'

storiesOf('Button', module)
  .add('default', () => ({
    render() {
      return <MyButton>hi</MyButton>
    }
  }))
  .add('template', () => ({
    components: { MyButton },
    template: '<my-button>vue template</my-button>'
  }))
