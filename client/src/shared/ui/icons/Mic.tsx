import React from 'react'

import IconComponent, { IconProps } from './IconComponent'

export const Mic: React.FC<IconProps> = (props): JSX.Element => (
  <IconComponent viewBox="0 0 28 28" size={28} fill="none" {...props}>
    <path
      d="M10.8684 6.63158C10.8684 5.80103 11.1984 5.0045 11.7856 4.41722C12.3729 3.82993 13.1695 3.5 14 3.5C14.8306 3.5 15.6271 3.82993 16.2144 4.41722C16.8017 5.0045 17.1316 5.80103 17.1316 6.63158V11.8509C17.1316 12.6814 16.8017 13.478 16.2144 14.0652C15.6271 14.6525 14.8306 14.9825 14 14.9825C13.1695 14.9825 12.3729 14.6525 11.7856 14.0652C11.1984 13.478 10.8684 12.6814 10.8684 11.8509V6.63158Z"
      stroke="#D0D4DD"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.69298 11.8506C6.69298 13.7885 7.46282 15.6471 8.83315 17.0174C10.2035 18.3878 12.0621 19.1576 14 19.1576M14 19.1576C15.9379 19.1576 17.7965 18.3878 19.1668 17.0174C20.5372 15.6471 21.307 13.7885 21.307 11.8506M14 19.1576V23.333M9.82456 23.333H18.1754"
      stroke="#D0D4DD"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconComponent>
)
