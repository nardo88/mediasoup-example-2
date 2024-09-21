import React from 'react'

import IconComponent, { IconProps } from './IconComponent'

export const OpenDoor: React.FC<IconProps> = (props): JSX.Element => (
  <IconComponent viewBox="0 0 28 28" size={28} fill="none" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.2 7.59961C4.2 6.49504 5.09543 5.59961 6.2 5.59961H12.6V22.3996H6.2C5.09543 22.3996 4.2 21.5042 4.2 20.3996V7.59961Z"
      stroke="white"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.8837 24.814C13.2421 25.0065 12.5964 24.526 12.5964 23.8561V4.14421C12.5964 3.47435 13.2421 2.9939 13.8837 3.18638L23.0837 5.94638C23.5067 6.07328 23.7964 6.4626 23.7964 6.90421V21.0961C23.7964 21.5378 23.5067 21.9271 23.0837 22.054L13.8837 24.814ZM17.3333 12.8331C17.3333 12.2808 16.8856 11.8331 16.3333 11.8331C15.7811 11.8331 15.3333 12.2808 15.3333 12.8331V15.1664C15.3333 15.7187 15.7811 16.1664 16.3333 16.1664C16.8856 16.1664 17.3333 15.7187 17.3333 15.1664V12.8331Z"
      fill="white"
    />
  </IconComponent>
)
