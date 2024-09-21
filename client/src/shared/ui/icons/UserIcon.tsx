import React from 'react'

import IconComponent, { IconProps } from './IconComponent'

export const UserIcon: React.FC<IconProps> = (props): JSX.Element => (
  <IconComponent viewBox="0 0 130 130" fill="none" {...props}>
    <g clip-path="url(#clip0_17464_239389)">
      <path
        d="M130 65C130 100.896 100.896 130 65 130C29.1038 130 0 100.896 0 65C0 29.1038 29.1038 0 65 0C100.896 0 130 29.1038 130 65Z"
        fill="#333333"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M64.8804 130.002C45.1707 129.966 27.518 121.157 15.62 107.271C24.0121 95.012 50.5216 88.8413 65.0008 88.8413C79.4793 88.8413 105.987 95.0115 114.38 107.27C102.482 121.156 84.8291 129.966 65.1186 130.002H64.8804ZM62.4843 77.5634C48.6174 76.0699 39.1213 61.3636 42.51 47.7727C48.749 22.7497 87.7497 26.0001 88.1123 54.181C88.1123 68.0168 76.3801 79.057 62.4843 77.5634Z"
        fill="#666666"
      />
    </g>
    <defs>
      <clipPath id="clip0_17464_239389">
        <rect width="130" height="130" fill="white" />
      </clipPath>
    </defs>
  </IconComponent>
)
