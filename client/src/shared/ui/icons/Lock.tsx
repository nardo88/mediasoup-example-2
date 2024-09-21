import React from 'react'

import IconComponent, { IconProps } from './IconComponent'

export const Lock: React.FC<IconProps> = (props): JSX.Element => (
  <IconComponent {...props} viewBox="0 0 21 20" id="close-icon" fill="none">
    <path
      d="M4.66667 10.8337C4.66667 10.3916 4.84226 9.96771 5.15482 9.65515C5.46738 9.34259 5.89131 9.16699 6.33333 9.16699H14.6667C15.1087 9.16699 15.5326 9.34259 15.8452 9.65515C16.1577 9.96771 16.3333 10.3916 16.3333 10.8337V15.8337C16.3333 16.2757 16.1577 16.6996 15.8452 17.0122C15.5326 17.3247 15.1087 17.5003 14.6667 17.5003H6.33333C5.89131 17.5003 5.46738 17.3247 5.15482 17.0122C4.84226 16.6996 4.66667 16.2757 4.66667 15.8337V10.8337Z"
      stroke="white"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.16667 9.16667V5.83333C7.16667 4.94928 7.51786 4.10143 8.14298 3.47631C8.7681 2.85119 9.61594 2.5 10.5 2.5C11.3841 2.5 12.2319 2.85119 12.857 3.47631C13.4821 4.10143 13.8333 4.94928 13.8333 5.83333V9.16667M9.66667 13.3333C9.66667 13.5543 9.75446 13.7663 9.91074 13.9226C10.067 14.0789 10.279 14.1667 10.5 14.1667C10.721 14.1667 10.933 14.0789 11.0893 13.9226C11.2455 13.7663 11.3333 13.5543 11.3333 13.3333C11.3333 13.1123 11.2455 12.9004 11.0893 12.7441C10.933 12.5878 10.721 12.5 10.5 12.5C10.279 12.5 10.067 12.5878 9.91074 12.7441C9.75446 12.9004 9.66667 13.1123 9.66667 13.3333Z"
      stroke="white"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconComponent>
)
