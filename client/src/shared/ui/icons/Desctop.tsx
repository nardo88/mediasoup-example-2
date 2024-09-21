import React from 'react'

import IconComponent, { IconProps } from './IconComponent'

export const Desctop: React.FC<IconProps> = (props): JSX.Element => (
  <IconComponent viewBox="0 0 28 28" size={28} fill="none" {...props}>
    <path
      d="M8.81481 22.1663H19.1852M10.8889 18.083V22.1663M17.1111 18.083V22.1663M4.66666 6.85384C4.66666 6.5831 4.77592 6.32345 4.97041 6.132C5.16489 5.94056 5.42866 5.83301 5.7037 5.83301H22.2963C22.5713 5.83301 22.8351 5.94056 23.0296 6.132C23.2241 6.32345 23.3333 6.5831 23.3333 6.85384V17.0622C23.3333 17.3329 23.2241 17.5926 23.0296 17.784C22.8351 17.9755 22.5713 18.083 22.2963 18.083H5.7037C5.42866 18.083 5.16489 17.9755 4.97041 17.784C4.77592 17.5926 4.66666 17.3329 4.66666 17.0622V6.85384Z"
      stroke="#D0D4DD"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconComponent>
)
