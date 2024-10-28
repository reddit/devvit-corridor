import {Devvit} from '@devvit/public-api'

export function Preview(): JSX.Element {
  // to-do: this should be a TV showing static using the five sing! keyboard
  // colors. ideally, it'd be animated and zap in like a CRT.
  return (
    <vstack width={'100%'} height={'100%'} alignment='center middle'>
      <image
        url='loading.gif'
        description='loading…'
        height='140px'
        width='140px'
        imageHeight='240px'
        imageWidth='240px'
      />
    </vstack>
  )
}
