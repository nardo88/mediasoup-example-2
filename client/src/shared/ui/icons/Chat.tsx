import React from 'react'

import IconComponent, { IconProps } from './IconComponent'

export const Chat: React.FC<IconProps> = (props): JSX.Element => (
  <IconComponent viewBox="0 0 28 28" size={28} fill="none" {...props}>
    <path
      d="M9.85185 10.9801H18.1482M9.85185 15.0977H16.0741M20.2222 5.83301C21.0473 5.83301 21.8387 6.15837 22.4221 6.73753C23.0056 7.31669 23.3333 8.10219 23.3333 8.92124V17.1565C23.3333 17.9756 23.0056 18.7611 22.4221 19.3403C21.8387 19.9194 21.0473 20.2448 20.2222 20.2448H15.037L9.85185 23.333V20.2448H7.77778C6.95266 20.2448 6.16134 19.9194 5.57789 19.3403C4.99444 18.7611 4.66667 17.9756 4.66667 17.1565V8.92124C4.66667 8.10219 4.99444 7.31669 5.57789 6.73753C6.16134 6.15837 6.95266 5.83301 7.77778 5.83301H20.2222Z"
      stroke="#D0D4DD"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconComponent>
)
