import React from 'react'

import IconComponent, { IconProps } from './IconComponent'

const SearchIcon: React.FC<IconProps> = (props): JSX.Element => (
  <IconComponent {...props} viewBox="0 0 18 18" id="close-icon" fill="none">
    <path
      d="M15.75 15.75L11.25 11.25M2.25 7.5C2.25 8.18944 2.3858 8.87213 2.64963 9.50909C2.91347 10.146 3.30018 10.7248 3.78769 11.2123C4.2752 11.6998 4.85395 12.0865 5.49091 12.3504C6.12787 12.6142 6.81056 12.75 7.5 12.75C8.18944 12.75 8.87213 12.6142 9.50909 12.3504C10.146 12.0865 10.7248 11.6998 11.2123 11.2123C11.6998 10.7248 12.0865 10.146 12.3504 9.50909C12.6142 8.87213 12.75 8.18944 12.75 7.5C12.75 6.81056 12.6142 6.12787 12.3504 5.49091C12.0865 4.85395 11.6998 4.2752 11.2123 3.78769C10.7248 3.30018 10.146 2.91347 9.50909 2.64963C8.87213 2.3858 8.18944 2.25 7.5 2.25C6.81056 2.25 6.12787 2.3858 5.49091 2.64963C4.85395 2.91347 4.2752 3.30018 3.78769 3.78769C3.30018 4.2752 2.91347 4.85395 2.64963 5.49091C2.3858 6.12787 2.25 6.81056 2.25 7.5Z"
      stroke="#A0A9BC"
      strokeWidth="0.866667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconComponent>
)

export default SearchIcon
