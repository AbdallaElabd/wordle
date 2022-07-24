import { keyframes } from '@emotion/react'

import { theme } from './theme'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 100; }
`
const fadeOut = keyframes`
  from { opacity: 100; }
  to { opacity: 0; }
`

const horizontalShake = keyframes`
  0% {
    transform: translateX(0rem);
  }
  25% {
    transform: translateX(0.5rem);
  }
  50% {
    transform: translateX(0rem);
  }
  75% {
    transform: translateX(-0.5rem);
  }
  100% {
    transform: translateX(1);
  }
`

const zoomShake = keyframes`
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
`

const guessColors = theme.colors.guesses
type ColorKeyframe = typeof guessColors[keyof typeof guessColors]

const flip = (fromColor: ColorKeyframe, toColor: ColorKeyframe) => keyframes`
  0% {
    transform: rotateX(0);
    background-color: ${fromColor.background};
    color: ${fromColor.foreground};
    border-color: ${fromColor.border};
  }
  49% {
    transform: rotateX(90deg);
    background-color: ${fromColor.background};
    color: ${fromColor.foreground};
    border-color: ${fromColor.border};
  }
  51% {
    transform: rotateX(90deg);
    background-color: ${toColor.background};
    color: ${toColor.foreground};
    border-color: ${toColor.border};
  }
  100% {
    transform: rotateX(0);
    background-color: ${toColor.background};
    color: ${toColor.foreground};
    border-color: ${toColor.border};
  }
`

export const animations = { fadeIn, fadeOut, horizontalShake, zoomShake, flip }
